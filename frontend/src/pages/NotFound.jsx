// src/pages/NotFound.jsx

import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-6xl font-bold text-red-500">404</h1>
        <p className="mt-4 text-xl text-gray-600">
          La page que tu cherches n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
