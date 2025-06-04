import React, { useState, useEffect, useRef } from 'react'
import API from '../api.js';
import socket from '../socket.js';

function ChatWindow({ selectedUser }) {
    const [typing, setTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const chatRef = useRef();

    useEffect(() => {
        if (selectedUser) {
            API.get(`/messages/${selectedUser._id}`).then(
                res => {
                    setMessages(res.data)
                    console.log("Fetched messages:", res.data)
                }
            )
        }
    }, [selectedUser]);

    useEffect(() => {
        if (!socket) return;

        socket.on("private_message", (msg) => {
            console.log("Received message:", msg);
            // Check if message is from current chat
            if (msg.sender === selectedUser._id || msg.sender === currentUser._id) {
                setMessages(prev => [...prev, msg]);
            }
        });

        return () => socket.off("private_message");
    }, [selectedUser]);

    useEffect(() => {
        if (!socket) return;
        socket.on("userTyping", (data) => {
            if (data.sender === selectedUser._id) {
                setTyping(data.isTyping);
            }
        });
        return () => socket.off("userTyping");
    }, [selectedUser]);

    const handleTyping = (e) => {
        setInput(e.target.value);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        socket.emit("typing", {
            sender: currentUser._id,
            recipient: selectedUser._id
        });

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", {
                sender: currentUser._id,
                recipient: selectedUser._id
            });
        }, 1000);
    }

    const sendMessage = async () => {
        if (!input.trim()) return;

        const msg = {
            sender: currentUser._id,
            recipient: selectedUser._id,
            content: input.trim(),
            timestamp: new Date().toISOString()
        };

        try {
            // Send message through socket
            socket.emit("private_message", msg);

            // Clear input after sending
            setInput('');
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message");
        }
    }
    return (
        <div className="flex-1 p-4 flex flex-col h-screen">
            <h1 className='text-2xl font-bold mb-4 text-center'>
                You are chatting with {selectedUser.username}
            </h1>
            <div
                ref={chatRef}
                className="flex-1 overflow-y-auto mb-4 space-y-4"
            >
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.sender === currentUser._id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[70%] rounded-lg p-3 ${m.sender === currentUser._id
                            ? 'bg-black text-white '
                            : 'bg-gray-200 '
                            }`}>
                            <p className="break-words">{m.content}</p>
                        </div>
                    </div>
                ))}
                {
                    typing && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3">
                                {selectedUser.username} is typing...
                            </div>
                        </div>
                    )}
            </div>
            <div className="flex gap-2 mt-auto">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={handleTyping}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                    onClick={sendMessage}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    )
}
export default ChatWindow
