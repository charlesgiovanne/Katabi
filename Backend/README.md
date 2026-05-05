# PIXELCHAT — Backend Requirements & Flow Specification

> Document for the backend programmer.
> Frontend stack: Vite + React + TypeScript + Tailwind CSS.
> Current frontend uses `BroadcastChannel` + `localStorage` as a local stub.
> The backend **replaces** all of that. The frontend's `useSocket.ts` hook is the single integration point — only that file changes when wiring to a real server.

---

## 1. Technology Recommendations

| Concern | Recommended |
|---|---|
| Runtime | Node.js (v20+)  (can change this) |
| Framework | Express.js or Fastify (can change this)|
| Real-time | Socket.io (preferred) or native `ws` |
| In-memory store | Redis (rooms, presence, message buffer) |
| Persistent store | PostgreSQL (message history, audit) — optional for v1 |
| Language | TypeScript |

Redis is strongly recommended. Rooms are ephemeral by design (1-hour expiry), presence tracking is volatile, and pub/sub fits the broadcast model. A full relational DB is optional for v1 — messages can live in Redis lists and be dropped when a room expires.

---

## 2. Data Models

These exactly mirror the frontend `types/index.ts`. The backend must produce and consume these shapes.

### 2.1 User
```ts
interface User {
  id: string;       // uuid v4, generated on registration
  username: string; // uppercase, alphanumeric + _ -, 2–28 chars
}
```

### 2.2 Room
```ts
interface Room {
  id: string;          // uuid v4
  name: string;        // uppercase, 2–24 chars
  keyword: string;     // uppercase, alphanumeric + _ -, 2–32 chars (hashed at rest)
  userCount: number;   // live count — computed from presence set, NOT stored
  createdAt: number;   // Unix ms
  lastActivity: number; // Unix ms — reset on every message sent
  creatorId: string;   // User.id of the creator
}
```

> ⚠️ `keyword` is sensitive. Store a **bcrypt hash** (or similar) server-side. Never send the plaintext keyword back to any client after room creation. The frontend only ever sends it for validation, never displays it except to room members inside the chat header.

### 2.3 Message
```ts
interface Message {
  id: string;       // uuid v4
  roomId: string;
  userId: string;   // 'system' for system messages
  username: string; // 'SYSTEM' for system messages
  content: string;  // max 500 chars
  timestamp: number; // Unix ms
  type: 'user' | 'system';
}
```

---

## 3. HTTP REST Endpoints

These are one-time request/response operations. Use standard JSON bodies and HTTP status codes.

### POST `/api/register`
Called once on the Landing page when the user submits their callsign.

**Request body**
```json
{
  "username": "NEON_WOLF_4821"
}
```

**Validation**
- `username` required
- 2–28 characters
- Matches `/^[A-Z0-9_\-]+$/` (uppercase enforced by frontend, but validate server-side)
- Username uniqueness is **not** required — users are identified by `id`, not username

**Success response — 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "NEON_WOLF_4821"
}
```

**Error response — 400**
```json
{ "error": "USERNAME_INVALID", "message": "Alphanumeric + _ - only, 2–28 chars" }
```

> The frontend stores the returned `{ id, username }` object in `sessionStorage`. The `id` is used as the WebSocket identity for all subsequent events.

---

### GET `/api/rooms`
Called on Lobby mount and on manual refresh. Returns all active (non-expired) rooms.

**No auth required** for listing (keyword is not included in the response).

**Success response — 200**
```json
[
  {
    "id": "abc-123",
    "name": "SECTOR-ALPHA",
    "keyword": "***",
    "userCount": 3,
    "createdAt": 1714900000000,
    "lastActivity": 1714903200000,
    "creatorId": "550e8400-..."
  }
]
```

> `keyword` must **never** be returned in full. Return `"***"` or omit the field entirely. The frontend only displays the keyword inside the chat room header, and it already knows it because the user entered it to join.

---

### POST `/api/rooms`
Called from `CreateRoomModal` when a user creates a room.

**Request body**
```json
{
  "name": "SECTOR-ALPHA",
  "keyword": "NEON-CIPHER",
  "creatorId": "550e8400-..."
}
```

**Validation**
- `name`: 2–24 chars, `/^[A-Z0-9_\-\s]+$/`
- `keyword`: 2–32 chars, `/^[A-Z0-9_\-]+$/`
- `creatorId`: must be a known registered user id

**Success response — 201** — returns the full Room object (keyword shown plaintext **only** this one time, to the creator)
```json
{
  "id": "room-uuid",
  "name": "SECTOR-ALPHA",
  "keyword": "NEON-CIPHER",
  "userCount": 0,
  "createdAt": 1714900000000,
  "lastActivity": 1714900000000,
  "creatorId": "550e8400-..."
}
```

After creation:
1. Store room in Redis with a 1-hour TTL (see Section 6).
2. Emit `ROOMS_UPDATED` to all connected clients via Socket.io broadcast.

---

### POST `/api/rooms/:roomId/validate`
Called from `JoinRoomModal` before the user enters a room.

**Request body**
```json
{ "keyword": "NEON-CIPHER" }
```

**Logic:** Compare submitted keyword against the stored bcrypt hash.

**Success — 200**
```json
{ "valid": true }
```

**Wrong keyword — 200** (not 401 — avoids leaking room existence via status codes)
```json
{ "valid": false }
```

**Room not found — 404**
```json
{ "error": "ROOM_NOT_FOUND" }
```

> The frontend is already rate-limiting attempts (warns after 3 wrong guesses), but the backend should enforce its own limit: **5 failed attempts per IP per room per 10 minutes** → respond with `{ "valid": false, "locked": true }`.

---

### GET `/api/rooms/:roomId/messages`
Called when a user enters a chat room to load message history.

**Query params**
- `limit` — default 50, max 100
- `before` — message `id` for cursor-based pagination (optional)

**Success — 200**
```json
{
  "messages": [ /* Message[] ordered oldest → newest */ ],
  "hasMore": false
}
```

**Room not found — 404**

---

## 4. WebSocket Events (Socket.io)

The frontend's `useSocket.ts` hook opens a single persistent Socket.io connection. All real-time updates flow through this connection. The hook maps **BroadcastPayload types** directly to Socket.io events.

### 4.1 Connection & Identity

When the client connects, it must immediately emit `CLIENT_IDENTIFY`:

```ts
// Client → Server (emit immediately after connect)
socket.emit('CLIENT_IDENTIFY', {
  userId: string,   // from sessionStorage after /api/register
  username: string
});
```

Server stores `socket.id → userId` mapping in memory. If `CLIENT_IDENTIFY` is not received within 5 seconds, disconnect the socket.

---

### 4.2 Event Reference Table

| Direction | Event Name | Payload | Description |
|---|---|---|---|
| C → S | `CLIENT_IDENTIFY` | `{ userId, username }` | Identity handshake on connect |
| C → S | `JOIN_ROOM` | `{ roomId, userId }` | User enters a chat room |
| C → S | `LEAVE_ROOM` | `{ roomId, userId }` | User leaves a chat room |
| C → S | `SEND_MESSAGE` | `{ roomId, userId, username, content }` | User sends a message |
| S → C | `ROOMS_UPDATED` | `Room[]` | Full room list refresh |
| S → C | `ROOM_EXPIRED` | `{ roomId }` | A specific room was deleted |
| S → C | `MESSAGE_SENT` | `Message` | A new message in a room |
| S → C | `USER_JOINED` | `{ roomId, userId, username, userCount }` | Someone joined |
| S → C | `USER_LEFT` | `{ roomId, userId, username, userCount }` | Someone left |
| S → C | `ERROR` | `{ code, message }` | Server-side error for the client |

---

### 4.3 Event Flows in Detail

#### Flow A — User Opens Lobby
```
Client connects to WS
  → emit CLIENT_IDENTIFY { userId, username }
  ← server emits ROOMS_UPDATED { rooms: Room[] }   (all active rooms)
```

The client Lobby page polls `GET /api/rooms` on mount AND listens to `ROOMS_UPDATED` via socket for live updates. Both paths must work.

---

#### Flow B — User Creates a Room
```
Client calls POST /api/rooms  (HTTP)
  ← 201 { room }
Client receives full room including plaintext keyword (store in component state)
Server emits ROOMS_UPDATED to ALL connected clients
Client then emits JOIN_ROOM { roomId, userId }  (WS)
  ← server emits USER_JOINED to room channel
  ← server emits ROOMS_UPDATED to all (updated userCount)
```

---

#### Flow C — User Joins an Existing Room
```
Client calls POST /api/rooms/:roomId/validate { keyword }  (HTTP)
  ← { valid: true }
Client emits JOIN_ROOM { roomId, userId }  (WS)
  Server: adds userId to room's presence set in Redis
  Server: computes new userCount
  ← server emits USER_JOINED { roomId, userId, username, userCount } to ROOM channel
  ← server emits ROOMS_UPDATED to ALL (updated userCount on lobby)
Client calls GET /api/rooms/:roomId/messages  (HTTP) to load history
```

---

#### Flow D — User Sends a Message
```
Client emits SEND_MESSAGE { roomId, userId, username, content }
  Server validates:
    - userId is known
    - userId is in the room's presence set
    - content is not empty and ≤ 500 chars
  Server creates Message object:
    - id: uuid
    - timestamp: Date.now()
    - type: 'user'
  Server stores message (Redis list for room)
  Server resets room's lastActivity = Date.now() and updates Redis TTL
  ← server emits MESSAGE_SENT { message: Message } to ROOM channel (all members)
  ← server emits ROOMS_UPDATED to ALL (updated lastActivity / timer)
```

---

#### Flow E — User Leaves a Room
```
Client emits LEAVE_ROOM { roomId, userId }
  Server: removes userId from room's presence set
  Server: computes new userCount
  ← server emits USER_LEFT { roomId, userId, username, userCount } to ROOM channel
  ← server emits ROOMS_UPDATED to ALL (updated userCount)
  Server: posts a system message "USERNAME LEFT THE ROOM"
  ← server emits MESSAGE_SENT { message: systemMsg } to ROOM channel
```

---

#### Flow F — User Disconnects Unexpectedly (tab closed / network drop)
```
Socket disconnect event fires on server
  Server: looks up userId from socket.id map
  Server: finds which room(s) userId was in via presence sets
  Server: removes userId from all presence sets
  Server: for each room → emit USER_LEFT + ROOMS_UPDATED
  Server: post system message "USERNAME DISCONNECTED"
```

> This is the most critical flow to get right. The frontend fires `beforeunload` as a best-effort, but it is not reliable. The server's `disconnect` handler is the authoritative cleanup path.

---

#### Flow G — Room Expiry (1-hour inactivity)
The server is the **sole authority** on expiry. The frontend timers are display-only.

```
Background job runs every 60 seconds:
  For each room in Redis:
    if Date.now() - room.lastActivity >= 3_600_000:
      Delete room data (room record, message list, presence set)
      Emit ROOM_EXPIRED { roomId } to ALL connected clients
      Emit ROOMS_UPDATED (updated room list) to ALL clients
```

Clients currently in the expired room must be redirected to the Lobby. The frontend already handles this: when it receives `ROOM_EXPIRED` and the `roomId` matches `currentRoomId`, it calls `leaveRoom()`.

---

### 4.4 System Messages
System messages are generated **server-side** for these events:

| Trigger | Content |
|---|---|
| User joins room | `"USERNAME JOINED THE ROOM"` |
| User leaves room (explicit) | `"USERNAME LEFT THE ROOM"` |
| User disconnects | `"USERNAME DISCONNECTED"` |
| Room created | `"USERNAME CREATED THIS ROOM"` |

System messages use `userId: 'system'`, `username: 'SYSTEM'`, `type: 'system'`. They are stored in the message list and emitted via `MESSAGE_SENT` like any other message.

---

## 5. Socket.io Room Strategy

Use Socket.io's native room feature to scope broadcasts:

```
Lobby channel:   socket.join('lobby')         — all connected clients
Room channel:    socket.join(`room:${roomId}`) — clients inside a specific chat room
```

| Broadcast target | Socket.io call |
|---|---|
| Everyone (lobby + all rooms) | `io.emit(event, payload)` |
| Only the lobby | `io.to('lobby').emit(event, payload)` |
| Only members of a room | `io.to('room:' + roomId).emit(event, payload)` |
| One client | `socket.emit(event, payload)` |

All clients join `'lobby'` on connect. They join `'room:roomId'` when they emit `JOIN_ROOM`, and leave it on `LEAVE_ROOM` or disconnect.

---

## 6. Redis Data Structure

```
# Room record (Hash)
Key:    room:{roomId}
Fields: id, name, keywordHash, creatorId, createdAt, lastActivity
TTL:    3600 seconds, reset on every SEND_MESSAGE

# Room list index (Set)
Key:    rooms:active
Value:  Set of roomIds
Note:   Add on room create, remove on room expire

# Message list (List)
Key:    room:{roomId}:messages
Value:  JSON-serialized Message objects, RPUSH (newest at tail)
TTL:    3600 seconds (same as room, deleted together)
Note:   Trim to last 500 messages with LTRIM after every RPUSH

# Presence set (Set)
Key:    room:{roomId}:users
Value:  Set of userIds currently in the room
TTL:    3600 seconds

# Registered users (Hash)
Key:    user:{userId}
Fields: id, username
TTL:    24 hours (re-registered on each session)

# Socket-to-user map (Hash)  — in-process memory is fine, but Redis works for multi-instance
Key:    socket:{socketId}
Value:  userId
TTL:    session-scoped
```

---

## 7. Validation Rules (Summary)

All validation must happen server-side regardless of what the frontend enforces.

| Field | Rule |
|---|---|
| `username` | Required, 2–28 chars, `/^[A-Z0-9_\-]+$/` |
| `room.name` | Required, 2–24 chars, `/^[A-Z0-9_\-\s]+$/` |
| `room.keyword` | Required, 2–32 chars, `/^[A-Z0-9_\-]+$/` |
| `message.content` | Required, 1–500 chars, strip leading/trailing whitespace |
| `userId` in WS events | Must match a known registered user |
| `roomId` in WS events | Must be an active (non-expired) room |
| Keyword validation | bcrypt compare, max 5 attempts / IP / room / 10 min |

---

## 8. Error Codes

Emit `ERROR` event to the specific client socket on any server-side failure:

```json
{ "code": "ROOM_NOT_FOUND",       "message": "Room does not exist or has expired" }
{ "code": "UNAUTHORIZED",         "message": "You are not in this room" }
{ "code": "CONTENT_TOO_LONG",     "message": "Message exceeds 500 characters" }
{ "code": "KEYWORD_LOCKED",       "message": "Too many failed attempts" }
{ "code": "IDENTITY_REQUIRED",    "message": "CLIENT_IDENTIFY must be sent first" }
{ "code": "INVALID_USERNAME",     "message": "Username fails validation" }
{ "code": "ROOM_NAME_INVALID",    "message": "Room name fails validation" }
{ "code": "ROOM_KEYWORD_INVALID", "message": "Keyword fails validation" }
```

---

## 9. CORS & Connection Config

The frontend dev server runs on `http://localhost:5173` (Vite default).

```ts
// Socket.io server init
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://your-production-domain.com'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 10000,
  pingInterval: 25000,
});
```

The frontend `useSocket.ts` hook will connect with:
```ts
const socket = io('http://localhost:3001', {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

The backend should run on port **3001** (or expose it via `.env`).

---

## 10. What the Frontend Will Change

When the backend is ready, **only `src/hooks/useSocket.ts` needs to be rewritten**. All other files stay the same. The new hook will:

1. Import `socket.io-client` and open one persistent connection.
2. On `connect`, emit `CLIENT_IDENTIFY`.
3. Replace all `localStorage` reads/writes with socket emits and REST calls.
4. Listen for server events and call the same React state setters.
5. Return the same public API: `{ status, rooms, messages, createRoom, sendMessage, postSystemMessage, validateKeyword, getRoomById, getRemainingMs, syncRooms, EXPIRY_MS }`.

Everything above that hook — the context, pages, and components — is backend-agnostic.

---

## 11. Suggested Server File Structure

```
server/
├── src/
│   ├── index.ts              ← Express + Socket.io init, CORS, port
│   ├── redis.ts              ← Redis client singleton
│   ├── routes/
│   │   ├── register.ts       ← POST /api/register
│   │   ├── rooms.ts          ← GET/POST /api/rooms
│   │   ├── validate.ts       ← POST /api/rooms/:id/validate
│   │   └── messages.ts       ← GET /api/rooms/:id/messages
│   ├── socket/
│   │   ├── index.ts          ← io.on('connection') entry
│   │   ├── handlers/
│   │   │   ├── identify.ts
│   │   │   ├── joinRoom.ts
│   │   │   ├── leaveRoom.ts
│   │   │   ├── sendMessage.ts
│   │   │   └── disconnect.ts
│   │   └── broadcast.ts      ← shared emit helpers
│   ├── jobs/
│   │   └── expiryWorker.ts   ← setInterval room expiry checker
│   ├── services/
│   │   ├── roomService.ts    ← create, get, expire, validate keyword
│   │   ├── messageService.ts ← store, fetch, trim
│   │   └── presenceService.ts← join, leave, count, list
│   └── types.ts              ← mirrors frontend types/index.ts
├── package.json
└── tsconfig.json
```

---

## 12. MVP Checklist

- [ ] `POST /api/register` — returns `{ id, username }`
- [ ] `GET /api/rooms` — returns active rooms (no keyword)
- [ ] `POST /api/rooms` — creates room, hashes keyword, emits `ROOMS_UPDATED`
- [ ] `POST /api/rooms/:id/validate` — keyword check with rate limit
- [ ] `GET /api/rooms/:id/messages` — history with limit/cursor
- [ ] WS `CLIENT_IDENTIFY` handler
- [ ] WS `JOIN_ROOM` → presence + `USER_JOINED` + `ROOMS_UPDATED`
- [ ] WS `LEAVE_ROOM` → presence + system msg + `USER_LEFT` + `ROOMS_UPDATED`
- [ ] WS `SEND_MESSAGE` → store + reset TTL + `MESSAGE_SENT` + `ROOMS_UPDATED`
- [ ] WS `disconnect` → same as `LEAVE_ROOM` for all active rooms
- [ ] Background job: expire rooms at 1hr inactivity → `ROOM_EXPIRED` + `ROOMS_UPDATED`
- [ ] System messages generated server-side for join/leave/disconnect/create
- [ ] Redis TTL management (room, messages, presence all share same 3600s TTL)