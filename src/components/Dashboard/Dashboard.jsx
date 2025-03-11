import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { useUserAuth } from '../../contexts/UserAuthContext';
import GuestDashboard from './GuestDashboard';
import LoggedInDashboard from './LoggedInDashboard';

// Main Dashboard component that decides which version to show
function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useUserAuth();
  
  console.log("Dashboard rendering, authenticated user:", !!user);
  
  const handleLogin = (isSignup = false) => {
    navigate(isSignup ? '/signup' : '/login');
  };
  
  // If we can't determine authentication state yet, show a loading spinner
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Loading dashboard...</p>
      </div>
    );
  }
  
  return user ? <LoggedInDashboard /> : <GuestDashboard onLogin={handleLogin} />;
}

export default Dashboard;