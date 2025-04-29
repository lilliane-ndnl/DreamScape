import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoggedInDashboard.module.css';
import './CalendarStyles.css';
import { auth, db, storage } from '../../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to format date
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

const LoggedInDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [readingList, setReadingList] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [moodData, setMoodData] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    username: '',
    bio: '',
    birthdate: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageURL, setProfileImageURL] = useState('');
  const [lastUsernameChange, setLastUsernameChange] = useState(null);
  const [usernameError, setUsernameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
  // New state for affirmations and quotes
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [currentQuote, setCurrentQuote] = useState({ text: '', author: '' });

  // Array of affirmations
  const affirmations = [
    "I am worthy of love, respect, and positive energy.",
    "I trust in my ability to create positive change in my life.",
    "I embrace challenges as opportunities for growth.",
    "I am becoming the best version of myself every day.",
    "I release all negative thoughts and embrace positivity.",
    "I am in charge of my own happiness and I choose to be happy.",
    "I am capable, strong, and will accomplish my goals.",
    "My potential is limitless, and my opportunities are abundant.",
    "I welcome joy, love, and positivity into my life.",
    "I am enough, just as I am right now.",
    "I radiate confidence, self-respect, and inner harmony.",
    "I accept myself unconditionally and love myself deeply.",
    "My body is healthy, my mind is brilliant, my soul is tranquil.",
    "I am surrounded by people who recognize my worth and value my presence.",
    "Today, I choose to focus on what I can control and let go of what I cannot."
  ];

  // Array of quotes
  const quotes = [
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The power of imagination makes us infinite.", author: "John Muir" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
    { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
    { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" }
  ];

  // Function to get a random affirmation
  const getRandomAffirmation = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return affirmations[randomIndex];
  }, []);

  // Function to get a random quote
  const getRandomQuote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          await Promise.all([
            fetchUserData(currentUser.uid),
            fetchGoals(currentUser.uid),
            fetchHabits(currentUser.uid),
            fetchReadingList(currentUser.uid),
            fetchJournalEntries(currentUser.uid)
          ]);
          
          // Set initial affirmation and quote
          setCurrentAffirmation(getRandomAffirmation());
          setCurrentQuote(getRandomQuote());
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, getRandomAffirmation, getRandomQuote]);

  const fetchUserData = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        console.log('Fetched user data:', data);
        
        setUserData(data);
        setProfileForm({
          displayName: data.displayName || '',
          username: data.username || '',
          bio: data.bio || '',
          birthdate: data.birthdate || '',
        });
        
        if (data.profileImageURL) {
          console.log('Setting profile image URL:', data.profileImageURL);
          setProfileImageURL(data.profileImageURL);
        }
        
        setLastUsernameChange(data.lastUsernameChange || null);
      } else {
        // Create a new user document if it doesn't exist
        const newUserData = {
          displayName: user?.displayName || '',
          email: user?.email || '',
          createdAt: new Date(),
        };
        
        await setDoc(userDocRef, newUserData);
        setUserData(newUserData);
        setProfileForm({
          displayName: newUserData.displayName || '',
          username: '',
          bio: '',
          birthdate: '',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  const fetchGoals = async (userId) => {
    try {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(goalsQuery);
      const goalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoals(goalsData);
      console.log('Fetched goals:', goalsData);
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  };

  const fetchHabits = async (userId) => {
    try {
      const habitsQuery = query(
        collection(db, 'habits'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(habitsQuery);
      const habitsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHabits(habitsData);
      console.log('Fetched habits:', habitsData);
    } catch (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }
  };

  const fetchReadingList = async (userId) => {
    try {
      const readingQuery = query(
        collection(db, 'readingList'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(readingQuery);
      const readingData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReadingList(readingData);
      console.log('Fetched reading list:', readingData);
    } catch (error) {
      console.error('Error fetching reading list:', error);
      throw error;
    }
  };

  const fetchJournalEntries = async (userId) => {
    try {
      const journalQuery = query(
        collection(db, 'journalEntries'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(journalQuery);
      const journalData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJournalEntries(journalData);
      console.log('Fetched journal entries:', journalData);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setProfileImageURL(downloadURL);
      
      // Update user document with new profile image URL
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        profileImageURL: downloadURL
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setError('Failed to upload profile image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...profileForm,
        updatedAt: new Date()
      });
      
      setUserData(prev => ({
        ...prev,
        ...profileForm
      }));
      
      setShowEditProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Profile Section */}
      <div className={styles.profileSection}>
        <div className={styles.profileHeader}>
          <div 
            className={styles.profileImageContainer}
            onClick={handleProfileImageClick}
          >
            {profileImageURL ? (
              <img 
                src={profileImageURL} 
                alt="Profile" 
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.profileImagePlaceholder}>
                {userData.displayName?.[0] || userData.email?.[0] || '?'}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <div className={styles.profileInfo}>
            <h2>{userData.displayName || 'User'}</h2>
            <p className={styles.username}>@{userData.username || 'username'}</p>
            <p className={styles.bio}>{userData.bio || 'No bio yet'}</p>
          </div>
          <button 
            className={styles.editProfileButton}
            onClick={() => setShowEditProfile(true)}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className={styles.quickStats}>
        <div className={styles.statCard}>
          <h3>Goals</h3>
          <p>{goals.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Habits</h3>
          <p>{habits.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Books</h3>
          <p>{readingList.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Journal Entries</h3>
          <p>{journalEntries.length}</p>
        </div>
      </div>

      {/* Daily Affirmation */}
      <div className={styles.affirmationCard}>
        <h3>Daily Affirmation</h3>
        <p>{currentAffirmation}</p>
      </div>

      {/* Inspirational Quote */}
      <div className={styles.quoteCard}>
        <h3>Today's Quote</h3>
        <p>"{currentQuote.text}"</p>
        <p className={styles.quoteAuthor}>- {currentQuote.author}</p>
      </div>

      {/* Recent Journal Entries */}
      <div className={styles.recentEntries}>
        <h3>Recent Journal Entries</h3>
        {journalEntries.length > 0 ? (
          <div className={styles.entriesList}>
            {journalEntries.map(entry => (
              <div key={entry.id} className={styles.entryCard}>
                <h4>{formatDate(entry.createdAt)}</h4>
                <p>{entry.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noEntries}>No journal entries yet</p>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmitProfile}>
              <div className={styles.formGroup}>
                <label htmlFor="displayName">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={profileForm.displayName}
                  onChange={handleProfileFormChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profileForm.username}
                  onChange={handleProfileFormChange}
                  required
                />
                {usernameError && (
                  <p className={styles.errorText}>{usernameError}</p>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileForm.bio}
                  onChange={handleProfileFormChange}
                  rows="3"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="birthdate">Birthdate</label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  value={profileForm.birthdate}
                  onChange={handleProfileFormChange}
                />
              </div>
              <div className={styles.modalButtons}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowEditProfile(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.saveButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggedInDashboard; 