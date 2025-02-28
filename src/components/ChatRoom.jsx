import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
const socket = io(SOCKET_URL, { transports: ["websocket"] });

window.socket = socket;

const ChatRoom = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [currentRoom, setCurrentRoom] = useState("general");

    useEffect(() => {
        if (!user) return;
        socket.emit("joinRoom", currentRoom);
        console.log(`Joined room: ${currentRoom}`);

        fetch(`${import.meta.env.VITE_API_URL}/chat/history/${currentRoom}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
            .then((res) => res.json())
            .then((data) => setMessages(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Error fetching chat history:", err));

        const handleNewMessage = (msg) => {
            console.log("🔥 Received message:", msg);
            setMessages((prevMessages) => [...prevMessages, msg]);
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [user, currentRoom]);

    const sendMessage = () => {
        if (!messageInput.trim()) return;

        const messageData = {
            sender: user.name,
            message: messageInput,
            room: currentRoom,
        };

        console.log("Sending message:", messageData);
        socket.emit("sendMessage", messageData);

        setMessages((prev) => [...prev, messageData]);
        setMessageInput("");
    };

    if (!user) {
        return <p>Please log in first.</p>;
    }

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-800 text-white p-4">
                <h2 className="text-xl font-bold mb-4">Rooms</h2>
                {["general", "sports", "movies"].map((room) => (
                    <div
                        key={room}
                        className={`p-2 mb-2 cursor-pointer rounded ${
                            room === currentRoom ? "bg-blue-500" : "bg-gray-700"
                        }`}
                        onClick={() => setCurrentRoom(room)}
                    >
                        {room.toUpperCase()}
                    </div>
                ))}
            </div>

            {/* Chat Section */}
            <div className="w-3/4 flex flex-col">
                <div className="p-4 bg-blue-600 text-white font-bold">{currentRoom.toUpperCase()}</div>
                <div className="flex-1 p-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-2 my-2 rounded w-fit ${
                                msg.sender === user.name ? "bg-blue-500 text-white ml-auto" : "bg-gray-300 text-black"
                            }`}
                        >
                            <strong>{msg.sender}: </strong>
                            {msg.message}
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t flex">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="flex-1 p-2 border rounded"
                        placeholder="Type a message..."
                    />
                    <button onClick={sendMessage} className="ml-2 bg-blue-600 text-white px-4 py-2 rounded">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
