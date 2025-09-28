import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userStore } from "../store/userStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const { sign } = userStore();
  const nav = useNavigate();

  const handleSign = async (e) => {
    e.preventDefault();
    const res = await sign(formData);
    if (res.message === "User registered successfully") {
      setTimeout(() => {
        toast.success("User registered successfully!")
        nav("/login");
      }, 2000);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleSign}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

        <label className="block mb-2">Name:</label>
        <input
          className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded"
          name="username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
        />

        <label className="block mb-2">Email:</label>
        <input
          className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <label className="block mb-2">Password:</label>
        <input
          className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded"
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        <label className="block mb-2">Role:</label>
        <select
          className="w-full p-2 mb-6 bg-gray-700 border border-gray-600 rounded"
          name="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
