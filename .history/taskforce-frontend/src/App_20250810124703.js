import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from "./pages/Home";
import MyAccount from "./pages/myAccount";

function App() {
  return (
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/home" element={<Home />} />
              <Route path="/account" element={<MyAccount />} />
              <Route path="/" element={<Navigate to="/home" />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;