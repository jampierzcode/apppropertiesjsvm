import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/login`, { email, password });
      console.log(response);
      if (response.data.message === "login_success") {
        sessionStorage.setItem("session", JSON.stringify(response.data.data));
        navigate("/propiedades");
      } else {
        alert("No se pudo iniciar sesion");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const session = JSON.parse(sessionStorage.getItem("session"));
  if (session) {
    return <Navigate to="/propiedades" replace={true} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">AppPropiedades</h2>
        <h2 className="text-sm font-bold mb-4">Login</h2>
        <label htmlFor="usuario" className="text-sm text-gray-500">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded mb-4 bg-gray-200 text-gray-900 text-sm rounded"
          required
        />
        <label htmlFor="usuario" className="text-sm text-gray-500">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded mb-4 bg-gray-200 text-gray-900 text-sm rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
