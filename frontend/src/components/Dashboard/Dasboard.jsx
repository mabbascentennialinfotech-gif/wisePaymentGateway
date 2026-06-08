import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Plan</h2>
          <p className="text-2xl font-bold text-indigo-600">
            {user?.plan === "none"
              ? "No active plan"
              : `${user?.plan?.toUpperCase()} Plan`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Upgrade Your Plan</h2>
          <Link
            to="/checkout"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            View Plans →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
