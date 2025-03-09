import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Journal from './components/Journal/Journal';
import VisionBoard from './components/VisionBoard/VisionBoard';
import About from './components/About/About';
import Footer from './components/Footer/Footer';
import Sidebar from './components/SideBar/SideBar';
import Dashboard from './components/Dashboard/Dashboard';
import GoalList from './components/GoalList/GoalList';
import HabitList from './components/HabitList/HabitList';
import ReadingList from './components/ReadingList/ReadingList';
import './App.css';

function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);

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
            <Link to="/about">About</Link>
          </div>
          <Link to="/" className="logoLink">
            <img src="/images/dreamscape-logo.png" alt="DreamScape" className="logo" />
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vision-board" element={<VisionBoard />} />
          <Route path="/goals" element={<GoalList />} />
          <Route path="/habits" element={<HabitList />} />
          <Route path="/reading" element={<ReadingList />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/about" element={<About />} />
        </Routes>

        <Footer />

        {showScrollTop && (
          <button className="scrollTopButton" onClick={scrollToTop} aria-label="Scroll to top" />
        )}
      </div>
    </div>
  );
}

export default App;
