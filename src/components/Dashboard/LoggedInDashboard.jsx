import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { useUserAuth } from '../../contexts/UserAuthContext';

function LoggedInDashboard() {
  const [showBackground, setShowBackground] = useState(false);
  const { user } = useUserAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Show background with delay
    const backgroundTimer = setTimeout(() => setShowBackground(true), 500);
    return () => clearTimeout(backgroundTimer);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className={`pageContainer ${showBackground ? 'showBackground' : ''}`}>
      <div className="floatingShapes">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`shape shape${i + 1}`} />
        ))}
      </div>

      <div className={styles.dashboardContainer}>
        <h1 className={styles.welcomeTitle}>Welcome, {user?.displayName || 'Dreamer'}!</h1>
        
        <div className={styles.dashboardGrid}>
          <div className={styles.dashboardCard}>
            <h3>Your Goals</h3>
            <p>No goals created yet. Start by creating your first goal!</p>
            <button 
              className={styles.actionButton}
              onClick={() => handleNavigate('/goals')}
            >
              Create Goal
            </button>
          </div>
          
          <div className={styles.dashboardCard}>
            <h3>Your Habits</h3>
            <p>Track daily habits to build consistency</p>
            <button 
              className={styles.actionButton}
              onClick={() => handleNavigate('/habits')}
            >
              Add Habit
            </button>
          </div>
          
          <div className={styles.dashboardCard}>
            <h3>Vision Board</h3>
            <p>Visualize your dreams and aspirations</p>
            <button 
              className={styles.actionButton}
              onClick={() => handleNavigate('/vision-board')}
            >
              View Board
            </button>
          </div>
          
          <div className={styles.dashboardCard}>
            <h3>Journal</h3>
            <p>Reflect on your journey</p>
            <button 
              className={styles.actionButton}
              onClick={() => handleNavigate('/journal')}
            >
              Write Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoggedInDashboard; 