import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { db, auth } from '../../firebase';
import styles from '../Auth/AuthShared.module.css';
import { useUserAuth } from '../../contexts/UserAuthContext';

const Login = () => {
    const navigate = useNavigate();
    
    // Try to use context but provide fallback for direct Firebase access
    const authContext = useUserAuth();
    
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [redirectInProgress, setRedirectInProgress] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        if (authContext && authContext.user && !redirectInProgress) {
            console.log("User already logged in, redirecting to dashboard");
            navigate('/dashboard');
        }
    }, [authContext, navigate, redirectInProgress]);

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
                    throw new Error('user-not-found');
                }
                
                email = querySnapshot.docs[0].data().email;
            }

            console.log("Attempting to sign in with:", email);

            // Set persistence to LOCAL first
            await setPersistence(auth, browserLocalPersistence);
            
            // Use either context method or direct Firebase method
            if (authContext && authContext.signIn) {
                await authContext.signIn(email, formData.password);
                console.log("Signed in using context");
            } else {
                // Fallback to direct Firebase call
                await signInWithEmailAndPassword(auth, email, formData.password);
                console.log("Signed in using direct Firebase");
            }
            
            console.log("Login successful");
            
            // Mark that a redirect is in progress to prevent double redirects
            setRedirectInProgress(true);
            
            // Delay navigation slightly to ensure auth state is updated
            setTimeout(() => {
                console.log("Navigating to dashboard");
                navigate('/dashboard');
                setIsSubmitting(false);
            }, 500);
        } catch (error) {
            console.error('Login error:', error);
            setIsSubmitting(false);
            
            if (error.message === 'user-not-found' || error.code === 'auth/user-not-found') {
                setErrors(prev => ({ ...prev, emailOrUsername: 'No account found with these credentials' }));
            } else if (error.code === 'auth/wrong-password') {
                setErrors(prev => ({ ...prev, password: 'Incorrect password' }));
            } else if (error.code === 'auth/invalid-email') {
                setErrors(prev => ({ ...prev, emailOrUsername: 'Invalid email format' }));
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
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>

                    <p style={{ 
                        textAlign: 'center', 
                        marginTop: '1.5rem',
                        fontFamily: 'Playfair Display, serif',
                        color: '#532e3b'
                    }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{
                            color: 'var(--accent-color-1)',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}>
                            Create one now
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login; 