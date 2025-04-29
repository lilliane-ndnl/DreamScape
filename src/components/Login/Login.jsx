import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase';
import styles from '../Auth/AuthShared.module.css';

const Login = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [redirectInProgress, setRedirectInProgress] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && !redirectInProgress) {
                navigate('/');
            }
        });
        
        return () => unsubscribe();
    }, [navigate, redirectInProgress]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.emailOrUsername) {
            newErrors.emailOrUsername = 'Email or username is required';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const isEmail = (value) => {
        return /\S+@\S+\.\S+/.test(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        try {
            let email = formData.emailOrUsername;

            if (!isEmail(formData.emailOrUsername)) {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("username", "==", formData.emailOrUsername));
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    const error = new Error('User not found');
                    error.code = 'auth/user-not-found';
                    throw error;
                }
                
                email = querySnapshot.docs[0].data().email;
            }

            await signInWithEmailAndPassword(auth, email, formData.password);
            
            setRedirectInProgress(true);
            navigate('/');
            
        } catch (error) {
            console.error('Login error:', error);
            setIsSubmitting(false);
            
            const errorCode = error.code || error.message;
            
            if (errorCode === 'auth/user-not-found') {
                setErrors(prev => ({ ...prev, emailOrUsername: 'No account found with these credentials' }));
            } else if (errorCode === 'auth/wrong-password') {
                setErrors(prev => ({ ...prev, password: 'Incorrect password' }));
            } else if (errorCode === 'auth/invalid-email') {
                setErrors(prev => ({ ...prev, emailOrUsername: 'Invalid email format' }));
            } else if (errorCode === 'auth/too-many-requests') {
                setErrors(prev => ({ ...prev, submit: 'Too many failed login attempts. Please try again later.' }));
            } else {
                setErrors(prev => ({ ...prev, submit: 'Failed to sign in. Please try again.' }));
            }
        }
    };

    return (
        <div className={`pageContainer showBackground`}>
            <div className="floatingShapes">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`shape shape${i + 1}`} />
                ))}
            </div>
            
            <div className="wideContainer">
                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <h1>Welcome Back</h1>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="emailOrUsername">Email or Username</label>
                        <input
                            type="text"
                            id="emailOrUsername"
                            name="emailOrUsername"
                            value={formData.emailOrUsername}
                            onChange={handleChange}
                            className={errors.emailOrUsername ? styles.error : ''}
                            autoComplete="username"
                        />
                        {errors.emailOrUsername && <span className={styles.errorMessage}>{errors.emailOrUsername}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? styles.error : ''}
                            autoComplete="current-password"
                        />
                        {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
                    </div>

                    {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className={styles.authLinks}>
                        <Link to="/forgot-password">Forgot Password?</Link>
                        <span className={styles.divider}>|</span>
                        <Link to="/signup">Create Account</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login; 