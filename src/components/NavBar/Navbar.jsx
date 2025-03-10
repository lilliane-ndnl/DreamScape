import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { user, logout } = useUserAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <Link to="/">Mindscape</Link>
            </div>
            <div className={styles.navLinks}>
                <Link to="/about">About</Link>
                {!user ? (
                    <>
                        <Link to="/login" className={styles.authButton}>Log In</Link>
                        <Link to="/signup" className={styles.authButton}>Sign Up</Link>
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