import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(credentials.username, credentials.password);
      // Redirection is handled inside AuthContext.js based on role!
    } catch (err) {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-xl">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to Smart Grievance
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="rounded-md shadow-sm space-y-4">
            <input
              name="username"
              type="text"
              required
              className="w-full border p-3 rounded-lg"
              placeholder="Username"
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              required
              className="w-full border p-3 rounded-lg"
              placeholder="Password"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Sign in
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            New user?{" "}
            <Link to="/register" className="text-blue-600 font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
