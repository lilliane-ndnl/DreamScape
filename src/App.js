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
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.pageYOffset / totalHeight) * 100;
      setProgress(progress);
      
      // Show/hide button based on scroll position
      setIsVisible(window.pageYOffset > 100);
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

  // Add logging to check auth state
  console.log('AppContent: Rendering with auth state:', { 
    isAuthenticated: !!currentUser,
    userExists: currentUser ? 'Yes' : 'No'
  });

  return (
    <div className="App">
      <Sidebar />
      
      <div className="appContent">
        <nav className="topNav">
          <div className="navLinks">
            <Link to="/vision-board">Vision Board</Link>
            <Link to="/journal">Journal</Link>
            <Link to="/auth" className="joinButton">Join Us</Link>
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

        <div className={`progress-wrap ${isVisible ? 'active-progress' : ''}`} onClick={scrollToTop}>
          <svg className="progress-circle" width="100%" height="100%" viewBox="-1 -1 102 102">
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"/>
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" 
                  style={{strokeDashoffset: `${316 - (316 * progress) / 100}`}}/>
          </svg>
        </div>
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
