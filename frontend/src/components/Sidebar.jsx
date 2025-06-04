import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import API from '../api.js';

function Sidebar({selectUser} ) {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        API.get('/users').then((res) => {
            setUsers(res.data);
        }).catch((error) => {
            console.error("Error fetching users:", error);
        });
    }, []);
  return (
    <div className='w-64 bg-gray-100 h-screen p-4'>
        {users.map( user => (

            <div key={user._id} onClick={()=>selectUser(user)} className='cursor-pointer p-2 hover:bg-gray-200'>
                {user.username}
            </div>
        ))}
      
    </div>
  )
}

export default Sidebar
