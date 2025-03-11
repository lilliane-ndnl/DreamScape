import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendEmailVerification, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from '../Auth/AuthShared.module.css';
import { useUserAuth } from '../../contexts/UserAuthContext';

const Signup = () => {
    const navigate = useNavigate();
    
    // Try to use context but provide fallback for direct Firebase access
    const authContext = useUserAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        birthday: '',
        sex: '',
        fullName: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        
        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Username validation (letters, numbers, periods, and underscores only, max 30 chars)
        if (!formData.username) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length > 30) {
            newErrors.username = 'Username must be 30 characters or less';
        } else if (!/^[a-zA-Z0-9._]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, periods, and underscores';
        }

        // Password validation (at least 8 chars, 1 uppercase, 1 number)
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/\d/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one number';
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Birthday validation (must be above 12 years old)
        if (!formData.birthday) {
            newErrors.birthday = 'Birthday is required';
        } else {
            const birthDate = new Date(formData.birthday);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age < 12) {
                newErrors.birthday = 'You must be at least 12 years old to register';
            }
        }

        // Sex validation
        if (!formData.sex) {
            newErrors.sex = 'Sex is required';
        }

        // Full Name validation
        if (!formData.fullName) {
            newErrors.fullName = 'Full name is required';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        try {
            console.log("Starting signup process for:", formData.email);
            
            // Set persistence to LOCAL first
            await setPersistence(auth, browserLocalPersistence);
            
            // Use either context method or direct Firebase method
            let userCredential;
            if (authContext && authContext.createUser) {
                userCredential = await authContext.createUser(formData.email, formData.password);
                console.log("User created using context");
            } else {
                // Fallback to direct Firebase call
                userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                console.log("User created using direct Firebase");
            }
            
            const user = userCredential.user;
            console.log("User created with ID:", user.uid);

            // Send email verification silently
            await sendEmailVerification(user);
            console.log("Verification email sent");

            // Create user document in Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userData = {
                username: formData.username,
                email: formData.email,
                birthday: new Date(formData.birthday).toISOString(),
                sex: formData.sex,
                fullName: formData.fullName,
                createdAt: new Date().toISOString(),
                bio: '',
                profilePicture: '',
                isNewUser: true
            };
            
            await setDoc(userDocRef, userData);
            console.log("User document created in Firestore");

            // Navigate to the welcome page
            console.log("Signup successful, navigating to welcome page");
            navigate('/welcome');
        } catch (error) {
            console.error('Signup error:', error);

            if (error.code === 'auth/email-already-in-use') {
                setErrors(prev => ({ ...prev, email: 'Email is already registered' }));
            } else if (error.code === 'auth/invalid-email') {
                setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
            } else if (error.code === 'auth/weak-password') {
                setErrors(prev => ({ ...prev, password: 'Password is too weak' }));
            } else {
                setErrors(prev => ({ 
                    ...prev, 
                    submit: `Failed to create account: ${error.message || 'Unknown error occurred'}`
                }));
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
                    <h1>Create Account</h1>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={errors.fullName ? styles.error : ''}
                            autoComplete="name"
                        />
                        {errors.fullName && <span className={styles.errorMessage}>{errors.fullName}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? styles.error : ''}
                            autoComplete="email"
                        />
                        {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={errors.username ? styles.error : ''}
                            autoComplete="username"
                        />
                        {errors.username && <span className={styles.errorMessage}>{errors.username}</span>}
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? styles.error : ''}
                                autoComplete="new-password"
                            />
                            {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? styles.error : ''}
                                autoComplete="new-password"
                            />
                            {errors.confirmPassword && <span className={styles.errorMessage}>{errors.confirmPassword}</span>}
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="birthday">Birthday</label>
                            <input
                                type="date"
                                id="birthday"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleChange}
                                className={errors.birthday ? styles.error : ''}
                            />
                            {errors.birthday && <span className={styles.errorMessage}>{errors.birthday}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="sex">Sex</label>
                            <select
                                id="sex"
                                name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                className={errors.sex ? styles.error : ''}
                            >
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.sex && <span className={styles.errorMessage}>{errors.sex}</span>}
                        </div>
                    </div>

                    {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <p style={{ 
                        textAlign: 'center', 
                        marginTop: '1.5rem',
                        fontFamily: 'Playfair Display, serif',
                        color: '#532e3b'
                    }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{
                            color: 'var(--accent-color-1)',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}>
                            Sign in here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup; 