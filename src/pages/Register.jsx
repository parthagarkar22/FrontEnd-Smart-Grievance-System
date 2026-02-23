import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    mobile: "",
    password: "",
  });
  const [error, setError] = useState("");

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
      // Matches the RegisterSerializer logic in backend/apps/accounts/serializers.py
      await axios.post("http://127.0.0.1:8000/api/auth/register/", formData);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.mobile ||
          err.response?.data?.password ||
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
            <p className="text-red-500 text-sm text-center font-medium">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <input
              name="first_name"
              type="text"
              placeholder="First Name"
              required
              className="border p-3 rounded-lg"
              onChange={handleChange}
            />
            <input
              name="last_name"
              type="text"
              placeholder="Last Name"
              required
              className="border p-3 rounded-lg"
              onChange={handleChange}
            />
          </div>

          <input
            name="username"
            type="text"
            placeholder="Username"
            required
            className="w-full border p-3 rounded-lg"
            onChange={handleChange}
          />

          <input
            name="mobile"
            type="text"
            placeholder="Mobile (e.g. 9876543210)"
            required
            className="w-full border p-3 rounded-lg"
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password (must include @, #, etc.)"
            required
            className="w-full border p-3 rounded-lg"
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Register
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
