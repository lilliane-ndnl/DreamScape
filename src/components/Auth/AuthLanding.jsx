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
                    <h1>Welcome to DreamScape</h1>
                    <p className={styles.subtitle}>Your journey to personal growth and achievement begins here</p>
                    
                    <div className={styles.optionsContainer}>
                        <div className={styles.option}>
                            <h2>Create New Account</h2>
                            <p>Start your journey with DreamScape. Create vision boards, track goals, and build better habits.</p>
                            <Link to="/signup" className={styles.primaryButton}>
                                Create Account
                            </Link>
                        </div>
                        
                        <div className={styles.divider}>
                            <span>or</span>
                        </div>
                        
                        <div className={styles.option}>
                            <h2>Already have an account?</h2>
                            <p>Welcome back! Continue your journey and track your progress.</p>
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
