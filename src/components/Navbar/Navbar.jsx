import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { user, logout } = useUserAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Monitor authentication state more carefully
    useEffect(() => {
        console.log("Navbar auth state:", user ? "logged in" : "logged out");
        setIsAuthenticated(!!user);
    }, [user]);

    const handleLogout = async () => {
        try {
            console.log("Logging out...");
            await logout();
            console.log("Logged out successfully");
            setIsAuthenticated(false);
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

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
                            className={location.pathname === '/dashboard' ? styles.active : ''}
                        >
                            Dashboard
                        </Link>
                        <Link 
                            to="/vision-board" 
                            className={location.pathname === '/vision-board' ? styles.active : ''}
                        >
                            Vision Board
                        </Link>
                        <Link 
                            to="/journal" 
                            className={location.pathname === '/journal' ? styles.active : ''}
                        >
                            Journal
                        </Link>
                        <Link 
                            to="/goals" 
                            className={location.pathname === '/goals' ? styles.active : ''}
                        >
                            Goals
                        </Link>
                    </>
                )}
                <Link 
                    to="/about" 
                    className={location.pathname === '/about' ? styles.active : ''}
                >
                    About
                </Link>
                {!isAuthenticated ? (
                    <>
                        <Link 
                            to="/login" 
                            className={location.pathname === '/login' ? styles.active : ''}
                        >
                            Login
                        </Link>
                        <Link 
                            to="/signup" 
                            className={styles.joinButton}
                        >
                            Join Us
                        </Link>
                    </>
                ) : (
                    <button 
                        onClick={handleLogout} 
                        className={styles.logoutButton}
                    >
                        Log Out
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar; 