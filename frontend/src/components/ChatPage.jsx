import React, {useState, useEffect} from 'react'
import Sidebar from './Sidebar.jsx'
import ChatWindow from './ChatWindow.jsx'
import socket from '../socket.js'

function ChatPage() {
    const [selectedUser, setSelectedUser] = useState(null);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        socket.emit("join", currentUser._id);
    }, [currentUser]);

    return (
        <div className="flex h-screen">
            <Sidebar selectUser={setSelectedUser} />
            {selectedUser ? (
                <ChatWindow selectedUser={selectedUser} />
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
                    Select a user to start chatting
                </div>
            )}
        </div>
    )
}

export default ChatPage
