import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { user, logout, loading } = useUserAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [error, setError] = useState(null);
    
    // Monitor authentication state more carefully
    useEffect(() => {
        console.log("Navbar auth state:", user ? "logged in" : "logged out");
        setIsAuthenticated(!!user);
    }, [user]);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            setError(null);
            console.log("Logging out...");
            await logout();
            console.log("Logged out successfully");
            setIsAuthenticated(false);
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
            setError('Failed to log out. Please try again.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (loading) {
        return (
            <nav className={styles.navbar}>
                <div className={styles.loadingSpinner}></div>
            </nav>
        );
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <Link to="/">DreamScape</Link>
            </div>
            <div className={styles.navLinks}>
                {isAuthenticated && (
                    <>
                        <Link 
                            to="/dashboard" 
                            className={`${styles.navLink} ${location.pathname === '/dashboard' ? styles.active : ''}`}
                        >
                            Dashboard
                        </Link>
                        <Link 
                            to="/vision-board" 
                            className={`${styles.navLink} ${location.pathname === '/vision-board' ? styles.active : ''}`}
                        >
                            Vision Board
                        </Link>
                        <Link 
                            to="/journal" 
                            className={`${styles.navLink} ${location.pathname === '/journal' ? styles.active : ''}`}
                        >
                            Journal
                        </Link>
                        <Link 
                            to="/goals" 
                            className={`${styles.navLink} ${location.pathname === '/goals' ? styles.active : ''}`}
                        >
                            Goals
                        </Link>
                    </>
                )}
                <Link 
                    to="/about" 
                    className={`${styles.navLink} ${location.pathname === '/about' ? styles.active : ''}`}
                >
                    About
                </Link>
                {!isAuthenticated ? (
                    <>
                        <Link 
                            to="/login" 
                            className={`${styles.navLink} ${location.pathname === '/login' ? styles.active : ''}`}
                        >
                            Login
                        </Link>
                        <Link 
                            to="/signup" 
                            className={`${styles.navLink} ${styles.joinButton}`}
                        >
                            Join Us
                        </Link>
                    </>
                ) : (
                    <button 
                        onClick={handleLogout} 
                        className={`${styles.navLink} ${styles.logoutButton}`}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? 'Logging out...' : 'Log Out'}
                    </button>
                )}
            </div>
            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}
        </nav>
    );
};

export default Navbar; 