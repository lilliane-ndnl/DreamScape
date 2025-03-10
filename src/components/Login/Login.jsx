import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import styles from '../Auth/AuthShared.module.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

            await signInWithEmailAndPassword(auth, email, formData.password);
            navigate('/');
        } catch (error) {
            if (error.message === 'user-not-found' || error.code === 'auth/user-not-found') {
                setErrors(prev => ({ ...prev, emailOrUsername: 'No account found with these credentials' }));
            } else if (error.code === 'auth/wrong-password') {
                setErrors(prev => ({ ...prev, password: 'Incorrect password' }));
            } else {
                setErrors(prev => ({ ...prev, submit: 'Failed to sign in. Please try again.' }));
            }
        } finally {
            setIsSubmitting(false);
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