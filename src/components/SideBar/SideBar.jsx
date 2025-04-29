import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import styles from './SideBar.module.css';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest(`.${styles.sidebar}`)) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLogin = () => {
    setIsOpen(false);
    navigate('/login');
  };

  const handleSignup = () => {
    setIsOpen(false);
    navigate('/signup');
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <button onClick={toggleSidebar} className={styles.menuButton}>
        <div className={styles.menuButtonBg}></div>
        <img src="/images/cloudladder-icon.png" alt="Menu" className={styles.menuIcon} />
      </button>
      <div className={styles.links}>
        <Link to="/dashboard" className={styles.link}>Dashboard</Link>
        <Link to="/vision-board" className={styles.link}>Vision Board</Link>
        <Link to="/goals" className={styles.link}>Goals</Link>
        <Link to="/habits" className={styles.link}>Habits</Link>
        <Link to="/reading" className={styles.link}>Reading List</Link>
        <Link to="/journal" className={styles.link}>Journal</Link>
        <Link to="/about" className={styles.link}>About</Link>
        
        <div className={styles.authSection}>
          {user ? (
            <button onClick={handleLogout} className={styles.logoutButton}>
              Log Out
            </button>
          ) : (
            <>
              <button onClick={handleLogin} className={styles.loginButton}>
                Log In
              </button>
              <button onClick={handleSignup} className={styles.signupButton}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;