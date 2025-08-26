import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from "./pages/Home";
import MyAccount from "./pages/MyAccount";
import Dashboard from "./pages/Dashboard";


function App() {
  return (
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
              <Route path="/home" element={<Home />} />
              <Route path="/account" element={<MyAccount />} />
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/dashboard" element={<Dashboard />} />

          </Routes>
        </div>
      </Router>
  );
}

export default App;