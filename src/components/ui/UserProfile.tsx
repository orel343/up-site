'use client'

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function UserProfile() {
  const { user, updateUserEmail, updateUserPassword } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await updateUserEmail(newEmail);
      setMessage('Email updated successfully');
      setNewEmail('');
    } catch {
      setMessage('Failed to update email');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await updateUserPassword(newPassword);
      setMessage('Password updated successfully');
      setNewPassword('');
    } catch {
      setMessage('Failed to update password');
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="text-xl font-semibold mb-2">User Profile</h2>
      <p>Email: {user.email}</p>
      {message && (
        <div className={`mt-2 p-2 rounded ${
          message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
      <form onSubmit={handleEmailChange} className="mt-4">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="New Email"
          className="w-full p-2 border rounded mb-2"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Update Email
        </button>
      </form>
      <form onSubmit={handlePasswordChange} className="mt-4">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="w-full p-2 border rounded mb-2"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Update Password
        </button>
      </form>
    </div>
  );
}
