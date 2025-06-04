import { useState } from 'react';
import API from '../api';

function GroupModal({ users, onClose, onGroupCreated }) {
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/groups', {
                name: groupName,
                members: selectedUsers,
                admin: currentUser._id
            });
            onGroupCreated(response.data);
            onClose();
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">Create New Group</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                        required
                    />
                    <div className="mb-4">
                        <h3 className="font-bold mb-2">Select Members</h3>
                        <div className="max-h-48 overflow-y-auto">
                            {users.map(user => (
                                <label key={user._id} className="flex items-center p-2 hover:bg-gray-100">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user._id)}
                                        onChange={() => {
                                            setSelectedUsers(prev => 
                                                prev.includes(user._id)
                                                    ? prev.filter(id => id !== user._id)
                                                    : [...prev, user._id]
                                            );
                                        }}
                                        className="mr-2"
                                    />
                                    {user.username}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                        >
                            Create Group
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GroupModal;