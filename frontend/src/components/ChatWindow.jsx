import React, { useState, useEffect, useRef } from "react";
import API from "../api.js";
import socket from "../socket.js";

function ChatWindow({ selected, type }) {
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const chatRef = useRef();
  const fileInputRef = useRef();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("recipient", selected._id);
    formData.append("recipientType", type === "group" ? "Group" : "User");

    try {
        const res = await API.post("/messages/upload", formData);
        const fileData = res.data;
        console.log("File uploaded successfully:", fileData);

        // Don't emit socket event - server will handle broadcasting
        if(type!=="group")setMessages(prev => [...prev, fileData]);
    } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file");
    }
  }

  const renderMessage = (message)=>{
    if(message.attachment?.type!=="none") {
      switch (message.attachment?.type) {
        case 'image':
          return <img src={message.attachment.url} alt={message.attachment.originalname} className="max-w-full rounded" />;
        case 'video':
            return <video src={message.attachment.url} controls className="max-w-full rounded" />;
        case 'file':
            return (
                <a href={message.attachment.url} target="_blank" rel="noopener noreferrer" 
                    className="flex items-center space-x-2  hover:underline">
                    <span>📎</span>
                    <span>{message.attachment.filename}</span>
                </a>
            );
      }
    }

    return <p className="">{message.content}</p>;
  }
  useEffect(() => {
    if (selected) {
      const endpoint =
        type === "group"
          ? `messages/groups/${selected._id}`
          : `/messages/${selected._id}`;
      API.get(endpoint).then((res) => {
        setMessages(res.data);
        console.log("Fetched messages:", res.data);
      });
      if (type === "group") {
        socket.emit("joinGroup", selected._id);
      }
    }
  }, [selected, type]);

  useEffect(() => {
    if (!socket) return;

    socket.on("private_message", (msg) => {
        console.log("Received private message:", msg);
        // Check if message belongs to current chat
        if (
            (msg.sender._id === selected._id && msg.recipient === currentUser._id) ||
            (msg.sender._id === currentUser._id && msg.recipient === selected._id)
        ) {
            setMessages(prev => [...prev, msg]);
        }
    });

    socket.on("newGroupMessage", (msg) => {
        console.log("Received group message:", msg);
        if (type === 'group' && msg.recipient === selected._id) {
            setMessages(prev => [...prev, msg]);
        }
    });

    return () => {
        socket.off("private_message");
        socket.off("newGroupMessage");
    };
}, [selected._id, currentUser._id, type]);

  useEffect(() => {
    if (!socket) return;
    socket.on("userTyping", (data) => {
      if (data.sender === selected._id) {
        setTyping(data.isTyping);
      }
    });
    return () => socket.off("userTyping");
  }, [selected]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit("typing", {
      sender: currentUser._id,
      recipient: selected._id,
    });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        sender: currentUser._id,
        recipient: selected._id,
      });
    }, 1000);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const msg = {
      sender: currentUser._id,
      recipient: selected._id,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      if (type === "group") {
        socket.emit("groupMessage", msg);
      } else {
        socket.emit("private_message", msg);
      }
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };
  return (
    <div className="flex-1 p-4 flex flex-col h-screen">
      <div className="p-4 border-b mb-2">
        <h2 className="font-bold">
          {type === "group" ? `# ${selected.name}` : selected.username}
        </h2>
      </div>
      <div ref={chatRef} className="flex-1  overflow-y-auto mb-4 space-y-4">
        {type === "group"
          ? messages.map((m, i) => (
              <div key={i} className="flex flex-col">
                <div
                  className={`text-xs text-gray-500 mb-1 mx-1 ${
                    m.sender._id === currentUser._id ? "text-right" : "text-left"
                  }`}
                >
                  {m.sender.username}
                </div>
                <div
                  className={`flex ${
                    m.sender._id === currentUser._id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[60%] rounded-lg p-3 ${
                      m.sender._id === currentUser._id
                        ? "bg-black text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    <div className="">
                        {renderMessage(m)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          : messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.sender === currentUser._id || m.sender._id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[60%] rounded-lg p-3 ${
                    m.sender === currentUser._id || m.sender._id === currentUser._id
                      ? "bg-black text-white "
                      : "bg-gray-200 "
                  }`}
                >
                  <div className="">
                      {renderMessage(m)}
                  </div>
                </div>
              </div>
            ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              {selected.username} is typing...
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-auto">
        <button onClick={()=> fileInputRef.current.click()} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer aspect-square">
          📎
        </button>
        <input 
          ref = {fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,.pdf, .doc, .docx"
        />
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
  );
}
export default ChatWindow;
