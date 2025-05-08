import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Chats() {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    api.get('/api/chats')
      .then(res => setChats(res.data))
      .catch(console.error);
  }, []);

  if (chats.length === 0) {
    return <p className="m-4 text-muted">Teil ei ole veel ühtegi jututuba.</p>;
  }

  return (
    <div className="container my-4">
      <h2>Teie vestlused</h2>
      <ul className="list-group">
        {chats.map(c => (
          <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
            <Link to={`/chats/${c.id}`} className="flex-grow-1">
              {c.otherUser.userName}
              {c.lastMessage && (
                <div className="text-truncate text-muted small">
                  {c.lastMessage.text}
                </div>
              )}
            </Link>
            <span className="text-muted small">
              {c.lastMessage ? new Date(c.lastMessage.sentAt).toLocaleString() : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
