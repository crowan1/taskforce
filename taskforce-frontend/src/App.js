import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
 
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const MyAccount = React.lazy(() => import('./pages/MyAccount'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Upgrade = React.lazy(() => import('./pages/Upgrade'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
 
const LoadingSpinner = () => (
  <div className="loading-container" style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px'
  }}>
    <div>Chargement...</div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<MyAccount />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;