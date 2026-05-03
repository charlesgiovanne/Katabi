    import { useState } from "react";

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
        if (!input) return;

        setMessages((prev) => [...prev, { text: input, sender: "me" }]);
        setInput("");

        // fake reply
        setTimeout(() => {
        setMessages((prev) => [
            ...prev,
            { text: "Hello 👋", sender: "stranger" },
        ]);
        }, 1000);
    };

    return (
        <div className="h-screen bg-black text-green-400 flex flex-col">

        {/* Header */}
        <div className="p-3 border-b border-green-500">
            Status: {status}
        </div>

        {/* Start Button */}
        <button
            onClick={startChat}
            className="m-2 border border-green-500 px-3"
        >
            Start Chat
        </button>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {messages.map((msg, i) => (
            <div
                key={i}
                className={msg.sender === "me" ? "text-right" : "text-left"}
            >
                {msg.sender === "me" ? "You" : "Stranger"}: {msg.text}
            </div>
            ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-green-500 flex gap-2">
            <input
            className="flex-1 bg-black border border-green-500 px-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            />
            <button
            onClick={sendMessage}
            className="border border-green-500 px-3"
            >
            Send
            </button>
        </div>

        </div>
    );
    }