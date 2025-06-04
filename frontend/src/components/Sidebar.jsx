import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import API from '../api.js';
import GroupModal from './GroupModal.jsx';

function Sidebar({selectUser, selectGroup}) {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    useEffect(() => {
        API.get('/users').then((res) => {
            console.log("Fetched users:", res.data);
            setUsers(res.data);
        }).catch((error) => {
            console.error("Error fetching users:", error);
        });

        API.get('/groups').then((res) => {
            console.log("Fetched groups:", res.data);
            setGroups(res.data);
        }).catch((error) => {
            console.error("Error fetching groups:", error);
        });
    }, []);
    const handleGroupCreated = (newGroup) => {
        setGroups(prev => [...prev, newGroup]);
    }
    return (
        <div className='w-64 bg-gray-100 h-screen p-4'>
            <h1 className='text-xl bg-gray-800 text-white p-2 rounded-lg max-w-fit my-5'>Current User: { currentUser.username }</h1>
            <div className="mb-10">
                <h2 className="font-bold mb-2">Direct Messages</h2>
                {users.map(user => (
                    <div 
                        key={user._id} 
                        onClick={() => selectUser(user)} 
                        className='cursor-pointer p-2 my-2 bg-gray-200 hover:bg-gray-300 rounded'
                    >
                        {user.username}
                    </div>
                ))}
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold">Groups</h2>
                    <button 
                    onClick={() => setShowGroupModal(true)}
                    className="text-sm bg-black text-white px-2 py-1 rounded cursor-pointer ">
                        + New
                    </button>
                </div>
                {groups.map(group => (
                    <div 
                        key={group._id} 
                        onClick={() => selectGroup(group)}
                        className='cursor-pointer p-2 my-2 bg-gray-200 hover:bg-gray-300 rounded'
                    >
                        # {group.name}
                    </div>
                ))}
            </div>
            {showGroupModal && (
                <GroupModal 
                    users={users} 
                    onClose={() => setShowGroupModal(false)} 
                    onGroupCreated={handleGroupCreated} 
                />
            )}
        </div>
    );
}

export default Sidebar
