import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="container my-4">
      <h1>Admini Töölaud</h1>
      <ul className="list-group">
        <li className="list-group-item">
          <Link to="/admin/categories">Halda Kategooriaid</Link>
        </li>
        <li className="list-group-item">
          <Link to="/admin/products">Halda Tooteid</Link>
        </li>
      </ul>
    </div>
  );
}
