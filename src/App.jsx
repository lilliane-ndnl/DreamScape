import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import About from './components/About/About';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import Welcome from './components/Welcome/Welcome';
import Dashboard from './components/Dashboard/Dashboard';
import VisionBoard from './components/VisionBoard/VisionBoard';
import Journal from './components/Journal/Journal';
import Goals from './components/Goals/Goals';
import Habits from './components/Habits/Habits';
import Reading from './components/Reading/Reading';
import { UserAuthContextProvider, useUserAuth } from './contexts/UserAuthContext';
import './App.css';

// Protected Route component - defined with the hook inside for proper context access
const ProtectedRoute = ({ children }) => {
  // Move the hook inside the component that's wrapped in the context
  const authContext = useUserAuth();
  
  // Show a loading state while auth is initializing
  if (authContext.loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!authContext.user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// First Time User Route component - defined with the hook inside for proper context access
const FirstTimeUserRoute = ({ children }) => {
  // Move the hook inside the component that's wrapped in the context
  const authContext = useUserAuth();
  
  // Show a loading state while auth is initializing
  if (authContext.loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!authContext.user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  if (!authContext.isNewUser) {
    console.log("Not a new user, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// This component ensures the main content is only rendered once auth is initialized
const AuthAwareContent = ({ children }) => {
  const { loading } = useUserAuth();
  const location = useLocation();
  
  console.log("Current location:", location.pathname);
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading authentication...</p>
      </div>
    );
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <UserAuthContextProvider>
        <div className="app">
          <Navbar />
          <AuthAwareContent>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Welcome route for new users */}
              <Route 
                path="/welcome" 
                element={
                  <FirstTimeUserRoute>
                    <Welcome />
                  </FirstTimeUserRoute>
                } 
              />
              
              {/* Dashboard is special - it shows different content for guests vs auth users */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Other protected routes */}
              <Route 
                path="/vision-board" 
                element={
                  <ProtectedRoute>
                    <VisionBoard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/journal" 
                element={
                  <ProtectedRoute>
                    <Journal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/goals" 
                element={
                  <ProtectedRoute>
                    <Goals />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/habits" 
                element={
                  <ProtectedRoute>
                    <Habits />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reading" 
                element={
                  <ProtectedRoute>
                    <Reading />
                  </ProtectedRoute>
                } 
              />
              
              {/* Fallback route for any unmatched paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthAwareContent>
        </div>
      </UserAuthContextProvider>
    </Router>
  );
}

export default App; 