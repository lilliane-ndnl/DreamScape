import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthLanding.module.css';

const AuthLanding = () => {
    return (
        <div className={`pageContainer showBackground`}>
            <div className="floatingShapes">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`shape shape${i + 1}`} />
                ))}
            </div>
            
            <div className="wideContainer">
                <div className={styles.authContainer}>
                    <div className={styles.welcomeSection}>
                        <h1 className={styles.pageTitle}>
                            <span>Welcome to</span>
                            <img src="/images/dreamscape-logo.png" alt="DreamScape" className={styles.titleLogo} />
                        </h1>
                        <p className={styles.subtitle}>Your journey to self-growth and success starts here.</p>
                        <p className={styles.description}>Whether you're setting new goals, tracking progress, or building positive habits, DreamScape is here to support you every step of the way.</p>
                    </div>
                    
                    <div className={styles.optionsContainer}>
                        <div className={styles.option}>
                            <h2>Create New Account</h2>
                            <p>Start your journey with DreamScape. Create vision boards, set goals, and build better habits.</p>
                            <Link to="/signup" className={styles.primaryButton}>
                                Create Account
                            </Link>
                        </div>
                        
                        <div className={styles.divider}>
                            <span>or</span>
                        </div>
                        
                        <div className={styles.option}>
                            <h2>Already Have an Account?</h2>
                            <p>Welcome back to DreamScape! Log in to continue your growing journey and track your transformation.</p>
                            <Link to="/login" className={styles.secondaryButton}>
                                Log In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLanding; 
