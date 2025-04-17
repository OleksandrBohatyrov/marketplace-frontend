import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="container my-4">
      <h1>Admin Dashboard</h1>
      <ul className="list-group">
        <li className="list-group-item">
          <Link to="/admin/categories">Manage Categories</Link>
        </li>
        <li className="list-group-item">
          <Link to="/admin/products">Manage Products</Link>
        </li>
      </ul>
    </div>
  );
}
