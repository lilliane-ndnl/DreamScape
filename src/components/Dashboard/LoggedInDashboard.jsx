import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import styles from './LoggedInDashboard.module.css';
import affirmationsData from '../../data/affirmations.json';
import quotesData from '../../data/quotes.json';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function LoggedInDashboard() {
  const { user, updateUserProfile } = useUserAuth();
  const [currentAffirmation, setCurrentAffirmation] = useState(() => {
    const saved = localStorage.getItem('currentAffirmation');
    return saved || '';
  });
  
  const [currentQuote, setCurrentQuote] = useState(() => {
    const saved = localStorage.getItem('currentQuote');
    return saved ? JSON.parse(saved) : { text: '', author: '' };
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    photoURL: '',
    bio: ''
  });
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || 'Dreamer',
    photoURL: user?.photoURL || '',
    bio: ''
  });
  const [userStats, setUserStats] = useState({
    journalEntries: 0,
    completedGoals: 0,
    activeHabits: 0,
    booksInProgress: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const db = getFirestore();
  const storage = getStorage();

  // Helper function to get random item from array
  const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

  // Helper function to get all affirmations from all categories
  const getAllAffirmations = () => {
    return Object.values(affirmationsData.categories).flat();
  };

  // Helper function to get all quotes from all categories
  const getAllQuotes = () => {
    return Object.values(quotesData.categories).flat();
  };

  // Generate appropriate greeting based on time of day
  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      setCurrentTime(now);
      
      const hour = now.getHours();
      let newGreeting = '';
      
      if (hour < 12) {
        newGreeting = 'Good morning';
      } else if (hour < 18) {
        newGreeting = 'Good afternoon';
      } else {
        newGreeting = 'Good evening';
      }
      
      setGreeting(newGreeting);
    };
    
    updateTimeAndGreeting();
    
    // Update time every minute
    const timeInterval = setInterval(updateTimeAndGreeting, 60000);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Fetch user profile data and stats
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoading(true);
        
        // Get user profile from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData({
            displayName: user.displayName || userData.displayName || 'Dreamer',
            photoURL: user.photoURL || userData.photoURL || '',
            bio: userData.bio || ''
          });
          
          // Initialize profile form with current data
          setProfileForm({
            displayName: user.displayName || userData.displayName || '',
            photoURL: user.photoURL || userData.photoURL || '',
            bio: userData.bio || ''
          });
        }
        
        // Get user journal entries count
        const journalQuery = query(
          collection(db, "journal_entries"),
          where("userId", "==", user.uid)
        );
        const journalSnapshot = await getDocs(journalQuery);
        const journalCount = journalSnapshot.size;
        
        // Get completed goals count
        const goalsQuery = query(
          collection(db, "goals"),
          where("userId", "==", user.uid),
          where("completed", "==", true)
        );
        const goalsSnapshot = await getDocs(goalsQuery);
        const completedGoalsCount = goalsSnapshot.size;
        
        // Get active habits count
        const habitsQuery = query(
          collection(db, "habits"),
          where("userId", "==", user.uid),
          where("active", "==", true)
        );
        const habitsSnapshot = await getDocs(habitsQuery);
        const activeHabitsCount = habitsSnapshot.size;
        
        // Get books in progress
        const booksQuery = query(
          collection(db, "reading_list"),
          where("userId", "==", user.uid),
          where("status", "==", "reading")
        );
        const booksSnapshot = await getDocs(booksQuery);
        const booksCount = booksSnapshot.size;
        
        // Update stats
        setUserStats({
          journalEntries: journalCount,
          completedGoals: completedGoalsCount,
          activeHabits: activeHabitsCount,
          booksInProgress: booksCount
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Use default values if we can't fetch
        setUserStats({
          journalEntries: 0,
          completedGoals: 0,
          activeHabits: 0,
          booksInProgress: 0
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, db]);

  const handleNewAffirmation = useCallback(() => {
    setIsAnimating(true);
    const allAffirmations = getAllAffirmations();
    const newAffirmation = getRandomItem(allAffirmations);
    const affirmationText = `${newAffirmation.text} ${newAffirmation.emoji}`;
    
    setTimeout(() => {
      setCurrentAffirmation(affirmationText);
      localStorage.setItem('currentAffirmation', affirmationText);
      setIsAnimating(false);
    }, 500);
  }, []);

  const handleNewQuote = useCallback(() => {
    const allQuotes = getAllQuotes();
    const newQuote = getRandomItem(allQuotes);
    setCurrentQuote(newQuote);
    localStorage.setItem('currentQuote', JSON.stringify(newQuote));
  }, []);

  useEffect(() => {
    // Show background with delay
    const backgroundTimer = setTimeout(() => setShowBackground(true), 500);

    // Only get new affirmation and quote if none exist
    if (!currentAffirmation) {
      handleNewAffirmation();
    }
    if (!currentQuote.text) {
      handleNewQuote();
    }

    return () => {
      clearTimeout(backgroundTimer);
    };
  }, [currentAffirmation, currentQuote.text, handleNewAffirmation, handleNewQuote]);

  // Handle profile edit form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
  };

  // Handle file selection for avatar
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit profile updates
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let photoURL = profileForm.photoURL;
      
      // If a new file was uploaded, store it in Firebase Storage
      if (selectedFile) {
        const storageRef = ref(storage, `profile_images/${user.uid}`);
        await uploadBytes(storageRef, selectedFile);
        photoURL = await getDownloadURL(storageRef);
      }
      
      // Update Firebase Auth profile
      await updateUserProfile({
        displayName: profileForm.displayName,
        photoURL: photoURL
      });
      
      // Update additional profile data in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: profileForm.displayName,
        photoURL: photoURL,
        bio: profileForm.bio,
        updatedAt: new Date()
      });
      
      // Update local state
      setProfileData({
        displayName: profileForm.displayName,
        photoURL: photoURL,
        bio: profileForm.bio
      });
      
      // Close edit mode
      setIsEditingProfile(false);
      
      // Clear file selection
      setSelectedFile(null);
      setFilePreview(null);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  // Cancel profile edit
  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({
      displayName: profileData.displayName,
      photoURL: profileData.photoURL,
      bio: profileData.bio
    });
    setSelectedFile(null);
    setFilePreview(null);
  };

  // Format date options
  const dateOptions = { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  // For calendar days with activity
  const mockActiveDays = [2, 7, 10, 14, 15, 18, 21, 25, 28];
  const currentMonth = currentTime.getMonth();
  const currentYear = currentTime.getFullYear();
  
  // Generate activity days for current month
  const activeDates = mockActiveDays.map(day => new Date(currentYear, currentMonth, day));

  // Profile edit form component
  const ProfileEditForm = () => (
    <div className={styles.profileEditOverlay}>
      <div className={styles.profileEditForm}>
        <h2>Edit Your Profile</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className={styles.profilePhotoEdit}>
            <div className={styles.profilePhotoPreview}>
              {filePreview ? (
                <img src={filePreview} alt="Preview" className={styles.photoPreview} />
              ) : profileForm.photoURL ? (
                <img src={profileForm.photoURL} alt="Current" className={styles.photoPreview} />
              ) : (
                <div className={styles.photoPlaceholder}>
                  {profileForm.displayName.charAt(0) || 'D'}
                </div>
              )}
            </div>
            <label className={styles.photoUploadButton}>
              Change Photo
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileSelect} 
                style={{ display: 'none' }}
              />
            </label>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={profileForm.displayName}
              onChange={handleProfileChange}
              placeholder="Your name"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profileForm.bio}
              onChange={handleProfileChange}
              placeholder="Tell us about yourself"
              rows={3}
              maxLength={150}
            ></textarea>
            <small className={styles.charCount}>
              {profileForm.bio.length}/150 characters
            </small>
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className={styles.dashboardContainer}>
      {/* Animated background elements */}
      <div className={styles.backgroundElements}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`${styles.bgElement} ${styles[`element${i+1}`]}`} />
        ))}
      </div>
      
      {/* Profile edit modal */}
      {isEditingProfile && <ProfileEditForm />}
      
      {/* Main dashboard content */}
      <div className={styles.dashboardContent}>
        {/* Header section with welcome and time */}
        <header className={styles.dashboardHeader}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeHeading}>
              {greeting}, <span className={styles.userName}>{profileData.displayName}</span>
            </h1>
            <p className={styles.currentDate}>
              {currentTime.toLocaleDateString(undefined, dateOptions)}
            </p>
            {profileData.bio && (
              <p className={styles.userBio}>
                {profileData.bio}
              </p>
            )}
          </div>
          
          <div className={styles.profileSection}>
            <div className={styles.profileImageContainer} onClick={() => setIsEditingProfile(true)}>
              {profileData.photoURL ? (
                <img 
                  src={profileData.photoURL} 
                  alt={`${profileData.displayName}'s profile`} 
                  className={styles.profileImage} 
                />
              ) : (
                <div className={styles.profileInitial}>
                  {profileData.displayName.charAt(0) || 'D'}
                </div>
              )}
              <div className={styles.editProfileBadge} title="Edit Profile">
                ✏️
              </div>
            </div>
          </div>
        </header>
        
        {/* Main dashboard grid layout */}
        <div className={styles.dashboardGrid}>
          {/* Left column */}
          <div className={styles.leftColumn}>
            {/* Affirmation card */}
            <div className={styles.affirmationCard}>
              <h2 className={styles.cardTitle}>Today's Affirmation</h2>
              <div className={`${styles.affirmationText} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
                {currentAffirmation}
              </div>
              <button 
                className={styles.refreshButton}
                onClick={handleNewAffirmation}
                disabled={isAnimating}
                aria-label="New affirmation"
              >
                <svg viewBox="0 0 24 24" className={styles.refreshIcon}>
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
              </button>
            </div>
            
            {/* Calendar widget */}
            <div className={styles.calendarCard}>
              <h2 className={styles.cardTitle}>Calendar</h2>
              <div className={styles.calendarGrid}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                  <div key={day} className={styles.calendarDay}>{day}</div>
                ))}
                
                {/* Generate a simple calendar for current month */}
                {(() => {
                  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                  
                  // Create array for calendar days
                  const days = [];
                  
                  // Add empty cells for days before the 1st of month
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
                  }
                  
                  // Add days of the month
                  for (let i = 1; i <= daysInMonth; i++) {
                    const date = new Date(currentYear, currentMonth, i);
                    const isActive = activeDates.some(d => d.getDate() === i);
                    const isToday = i === currentTime.getDate();
                    
                    days.push(
                      <div 
                        key={`day-${i}`} 
                        className={`${styles.calendarDay} ${isActive ? styles.activeDay : ''} ${isToday ? styles.today : ''}`}
                      >
                        {i}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>
          </div>
          
          {/* Center column */}
          <div className={styles.centerColumn}>
            {/* Quote of the day */}
            <div className={styles.quoteCard}>
              <h2 className={styles.cardTitle}>Inspirational Quote</h2>
              <blockquote className={styles.quoteText}>
                "{currentQuote.text}"
              </blockquote>
              <cite className={styles.quoteAuthor}>— {currentQuote.author}</cite>
              <button 
                className={styles.refreshButton}
                onClick={handleNewQuote}
                aria-label="New quote"
              >
                <svg viewBox="0 0 24 24" className={styles.refreshIcon}>
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
              </button>
            </div>
            
            {/* Stats Summary */}
            <div className={styles.statsCard}>
              <h2 className={styles.cardTitle}>Your Progress</h2>
              {isLoading ? (
                <div className={styles.loadingStats}>
                  <div className={styles.loadingIndicator}></div>
                  <p>Loading your data...</p>
                </div>
              ) : (
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{userStats.journalEntries}</span>
                    <span className={styles.statLabel}>Journal Entries</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{userStats.completedGoals}</span>
                    <span className={styles.statLabel}>Completed Goals</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{userStats.activeHabits}</span>
                    <span className={styles.statLabel}>Active Habits</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{userStats.booksInProgress}</span>
                    <span className={styles.statLabel}>Books Reading</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column */}
          <div className={styles.rightColumn}>
            {/* Quick links to major features */}
            <div className={styles.quickLinksCard}>
              <h2 className={styles.cardTitle}>Quick Access</h2>
              <div className={styles.quickLinksGrid}>
                <Link to="/goals" className={styles.quickLink}>
                  <div className={styles.quickLinkIcon}>🎯</div>
                  <div className={styles.quickLinkText}>
                    <h3>Goals</h3>
                    <p>Track your aspirations</p>
                  </div>
                </Link>
                
                <Link to="/habits" className={styles.quickLink}>
                  <div className={styles.quickLinkIcon}>🔄</div>
                  <div className={styles.quickLinkText}>
                    <h3>Habits</h3>
                    <p>Build strong routines</p>
                  </div>
                </Link>
                
                <Link to="/journal" className={styles.quickLink}>
                  <div className={styles.quickLinkIcon}>📓</div>
                  <div className={styles.quickLinkText}>
                    <h3>Journal</h3>
                    <p>Reflect on your journey</p>
                  </div>
                </Link>
                
                <Link to="/reading" className={styles.quickLink}>
                  <div className={styles.quickLinkIcon}>📚</div>
                  <div className={styles.quickLinkText}>
                    <h3>Reading</h3>
                    <p>Expand your knowledge</p>
                  </div>
                </Link>
                
                <Link to="/vision-board" className={styles.quickLink}>
                  <div className={styles.quickLinkIcon}>🖼️</div>
                  <div className={styles.quickLinkText}>
                    <h3>Vision Board</h3>
                    <p>Visualize your dreams</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoggedInDashboard;
