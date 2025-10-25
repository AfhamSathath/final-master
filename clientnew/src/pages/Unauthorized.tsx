// frontend/src/pages/Unauthorized.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this page.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;