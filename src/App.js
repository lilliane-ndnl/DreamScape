import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Journal from './components/Journal/Journal';
import VisionBoard from './components/VisionBoard/VisionBoard';
import About from './components/About/About';
import Footer from './components/Footer/Footer';
import Sidebar from './components/SideBar/SideBar';
import GuestDashboard from './components/Dashboard/GuestDashboard';
import LoggedInDashboard from './components/Dashboard/LoggedInDashboard';
import GoalList from './components/GoalList/GoalList';
import HabitList from './components/HabitList/HabitList';
import ReadingList from './components/ReadingList/ReadingList';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import AuthLanding from './components/Auth/AuthLanding';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function AppContent() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="App">
      <Sidebar />
      
      <div className="appContent">
        <nav className="topNav">
          <div className="navLinks">
            <Link to="/vision-board">Vision Board</Link>
            <Link to="/journal">Journal</Link>
            {!currentUser ? (
              <Link to="/auth" className="joinButton">Join Us</Link>
            ) : (
              <Link to="/dashboard" className="dashboardButton">Dashboard</Link>
            )}
            <Link to="/about">About</Link>
          </div>
          <Link to="/" className="logoLink">
            <img src="/images/dreamscape-logo.png" alt="DreamScape" className="logo" />
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={currentUser ? <LoggedInDashboard /> : <GuestDashboard />} />
          <Route path="/dashboard" element={currentUser ? <LoggedInDashboard /> : <GuestDashboard />} />
          <Route path="/vision-board" element={<VisionBoard />} />
          <Route path="/goals" element={<GoalList />} />
          <Route path="/habits" element={<HabitList />} />
          <Route path="/reading" element={<ReadingList />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<AuthLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>

        <Footer />

        {showScrollTop && (
          <button className="scrollTopButton" onClick={scrollToTop} aria-label="Scroll to top" />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
