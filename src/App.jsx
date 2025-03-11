import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  
  if (!authContext || !authContext.user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// First Time User Route component - defined with the hook inside for proper context access
const FirstTimeUserRoute = ({ children }) => {
  // Move the hook inside the component that's wrapped in the context
  const authContext = useUserAuth();
  
  if (!authContext || !authContext.user) {
    return <Navigate to="/login" />;
  }
  
  if (!authContext.isNewUser) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <UserAuthContextProvider>
        <div className="app">
          <Navbar />
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
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
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
          </Routes>
        </div>
      </UserAuthContextProvider>
    </Router>
  );
}

export default App; 