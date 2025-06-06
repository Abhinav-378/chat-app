import {useState, useEffect} from 'react'
import Sidebar from './Sidebar.jsx'
import ChatWindow from './ChatWindow.jsx'
import socket from '../socket.js'

function ChatPage() {
    const [selected, setSelected] = useState(null);
    const [chatType, setChatType] = useState(null); // 'user' or 'group'
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        socket.emit("join", currentUser._id);
    }, [currentUser]);

    const handleUserSelect = (user) => {
        setSelected(user);
        setChatType('user');
    }
    const handleGroupSelect = (group) => {
        setSelected(group);
        setChatType('group');
    }
    return (
        <div className="flex h-screen">
            <Sidebar selectUser={handleUserSelect} selectGroup={handleGroupSelect} />
            {selected ? (
                <ChatWindow selected={selected} type={chatType} />
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
                    Select a user or group to start chatting
                </div>
            )}
        </div>
    )
}

export default ChatPage
