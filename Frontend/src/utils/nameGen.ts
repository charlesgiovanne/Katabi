const ADJECTIVES = [
    'NEON', 'CYBER', 'GLITCH', 'PIXEL', 'VOXEL', 'TURBO', 'ULTRA', 'HYPER',
    'GHOST', 'ROGUE', 'STRAY', 'VOID', 'DARK', 'SOLAR', 'LUNAR', 'ASTRO',
    'BINARY', 'VECTOR', 'DELTA', 'SIGMA', 'OMEGA', 'ALPHA', 'BETA', 'GAMMA',
    'FLUX', 'NOVA', 'PULSE', 'SONIC', 'LASER', 'RAZOR', 'STORM', 'BLAZE',
    'IRON', 'STEEL', 'CHROME', 'COBALT', 'CRIMSON', 'JADE', 'AMBER', 'CYAN',
];

const NOUNS = [
    'WOLF', 'HAWK', 'VIPER', 'COBRA', 'RAVEN', 'EAGLE', 'SHARK', 'TIGER',
    'PHANTOM', 'SPECTER', 'WRAITH', 'SHADE', 'CIPHER', 'NEXUS', 'APEX',
    'PILOT', 'DRONE', 'MECH', 'DROID', 'UNIT', 'NODE', 'CORE', 'BYTE',
    'RUNNER', 'HACKER', 'CODER', 'RACER', 'HUNTER', 'SEEKER', 'STALKER',
    'ACE', 'REX', 'MAX', 'ZAX', 'KAI', 'ZEN', 'ION', 'ARC', 'ORB',
];

export function generateUsername(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `${adj}_${noun}_${num}`;
}

const KEYWORDS = [
    'ARCADE', 'PIXEL', 'RETRO', 'NEON', 'GLITCH', 'VECTOR', 'ROGUE',
    'CIPHER', 'VORTEX', 'NEBULA', 'MATRIX', 'BINARY', 'QUANTUM', 'PRISM',
    'ECHO', 'DELTA', 'FORGE', 'NEXUS', 'ORBIT', 'PULSE', 'RELAY', 'SURGE',
    'STATIC', 'SYNTAX', 'TOKEN', 'UPLINK', 'VERTEX', 'WARP', 'XENON', 'ZERO',
];

export function generateKeyword(): string {
  const k1 = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
  let k2 = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
  while (k2 === k1) k2 = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
    return `${k1}-${k2}`;
}

const ROOM_PREFIXES = [
    'SECTOR', 'ZONE', 'BLOCK', 'NODE', 'HUB', 'GRID', 'BASE', 'CELL',
    'UNIT', 'CORE', 'DECK', 'BAY', 'ROOM', 'LAB', 'DEN', 'BUNKER',
];

const ROOM_SUFFIXES = [
    'ALPHA', 'BETA', 'GAMMA', 'DELTA', 'OMEGA', 'SIGMA',
    'ONE', 'TWO', 'THREE', 'PRIME', 'ZERO', 'NINE',
];

export function generateRoomName(): string {
    const prefix = ROOM_PREFIXES[Math.floor(Math.random() * ROOM_PREFIXES.length)];
    const suffix = ROOM_SUFFIXES[Math.floor(Math.random() * ROOM_SUFFIXES.length)];
    return `${prefix}-${suffix}`;
}