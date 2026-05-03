import { useState } from "react";
import "../index.css";

type Message = {
    text: string;
    sender: "me" | "stranger";
};

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [status, setStatus] = useState("idle");

    const startChat = () => {
        setStatus("searching");

        setTimeout(() => {
        setStatus("connected");
        }, 2000);
    };

    const sendMessage = () => {
        if (!input || status !== "connected") return;

        setMessages((prev) => [...prev, { text: input, sender: "me" }]);
        setInput("");

        setTimeout(() => {
        setMessages((prev) => [
            ...prev,
            { text: "Hello 👋", sender: "stranger" },
        ]);
        }, 1000);
    };

    return (
        <div className="chat-container">

        <div className="header">
            PIXEL CHAT <br />
            Status: {status}
        </div>

        <div className="controls">
            <button onClick={startChat}>START</button>
        </div>

        <div className="messages">
            {messages.map((msg, i) => (
            <div
                key={i}
                className={`message ${msg.sender === "me" ? "me" : "stranger"}`}
            >
                {msg.text}
            </div>
            ))}
        </div>

        <div className="input-area">
            <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== "connected"}
            />
            <button onClick={sendMessage} disabled={status !== "connected"}>
            Send
            </button>
        </div>

        </div>
    );
}