import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import image1png from "./image1.png";
import logo from "./images.png";
import { login } from "../Services/api";
 
const Login = ({ setIsAuthenticated = () => {} }) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const domain = "integrator-orange.com";
 
  const handleLogin = async (e) => {
    e.preventDefault();
 
    if (usernameInput.trim() === "" || password.trim() === "") {
      setError("Username and password are required!");
      return;
    }
 
    const username = usernameInput.trim() + "@" + domain;
 
    try {
      const response = await login(username, password);
 
      if (!response) {
        setError("Invalid login credentials.");
        return;
      }
 
      const { token, role, name, email: userEmail, staffId , isProjectOwner } = response;
 
      if (!role) {
        setError("Role information is missing. Please contact admin.");
        return;
      }
 
      // Store values before navigating
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name || "");
      localStorage.setItem("email", userEmail);
      localStorage.setItem("staffId", staffId || "");
      localStorage.setItem("isProjectOwner", isProjectOwner ? "true" : "false");
 
      setIsAuthenticated(true);
 
      // Navigate to landing page
      navigate("/landing", { replace: true });
 
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };
 
  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
 
      <div className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
 
        <form onSubmit={handleLogin}>
 
  <input
    id="cuid"
    type="text"
    placeholder="Enter your CUID"
    required
    value={usernameInput}
    onChange={(e) => setUsernameInput(e.target.value)}
  />
 
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
 
      <div className="image-container">
        <img src={image1png} alt="Meditation" />
      </div>
    </div>
  );
};
 
export default Login;
 
 