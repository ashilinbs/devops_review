import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!"); // Set error message
      return;
    }

    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setErrorMessage(""); // Clear error message
      alert("Sign Up Successful!");
      navigate("/");
    } else {
      setErrorMessage("Failed to sign up!"); // Set error message
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-white-500 to-white-500 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-8 max-w-md w-full border border-gray-300/30">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>} {/* Display error message */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-300 focus:ring-4 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-300 focus:ring-4 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-300 focus:ring-4 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-300 focus:ring-4 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full text-white py-3 rounded-lg transition duration-300 shadow-lg bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/50"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-6 text-gray-300">
          Already have an account?{" "}
          <a href="/" className="text-blue-300 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;