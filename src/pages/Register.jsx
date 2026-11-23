import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [error, setError] = useState("");
  // ✨ FIX: Defined showPassword state to prevent "ReferenceError"
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    // Mobile validation: Starts with 6-9 and has 10 digits
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError("Mobile number must be 10 digits and start with 6-9.");
      return false;
    }

    // Password validation: Must have a special character
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(formData.password)) {
      setError("Password must contain at least one special character.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      await axios.post(`${API_BASE_URL}auth/register/`, formData);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.mobile ||
          err.response?.data?.password ||
          err.response?.data?.email ||
          "Registration failed.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-xl">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create Account
        </h2>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <input
              name="first_name"
              type="text"
              placeholder="First Name"
              required
              className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={handleChange}
            />
            <input
              name="last_name"
              type="text"
              placeholder="Last Name"
              required
              className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <input
            name="username"
            type="text"
            placeholder="Username"
            required
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            required
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={handleChange}
          />

          <input
            name="mobile"
            type="text"
            placeholder="Mobile (e.g. 9876543210)"
            required
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={handleChange}
          />

          {/* Password Field with Show/Hide Logic */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password (must include @, #, etc.)"
              required
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Create My Account
          </button>
        </form>

        <div className="text-center mt-4 border-t pt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-bold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
