import React, { useState, useEffect, useRef } from 'react';
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
  const getRandomAffirmation = () => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return affirmations[randomIndex];
  };

  // Function to get a random quote
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
        await fetchGoals(currentUser.uid);
        await fetchHabits(currentUser.uid);
        await fetchReadingList(currentUser.uid);
        await fetchJournalEntries(currentUser.uid);
        
        // Set initial affirmation and quote
        setCurrentAffirmation(getRandomAffirmation());
        setCurrentQuote(getRandomQuote());
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

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
    }
  };

  const fetchReadingList = async (userId) => {
    try {
      let collections = ['readingList', 'books', 'reading'];
      let readingData = [];
      
      for (let collectionName of collections) {
        try {
          const readingQuery = query(
            collection(db, collectionName),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(readingQuery);
          if (!querySnapshot.empty) {
            readingData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            console.log(`Fetched reading list from ${collectionName}:`, readingData);
            break;
          }
        } catch (e) {
          console.log(`No data in ${collectionName} collection`);
        }
      }
      
      setReadingList(readingData);
    } catch (error) {
      console.error('Error fetching reading list:', error);
    }
  };

  const fetchJournalEntries = async (userId) => {
    try {
      let collections = ['journalEntries', 'journal', 'entries'];
      let journalData = [];
      
      for (let collectionName of collections) {
        try {
          const journalQuery = query(
            collection(db, collectionName),
            where('userId', '==', userId),
            orderBy('date', 'desc'),
            limit(30)
          );
          const querySnapshot = await getDocs(journalQuery);
          if (!querySnapshot.empty) {
            journalData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            console.log(`Fetched journal entries from ${collectionName}:`, journalData);
            break;
          }
        } catch (e) {
          console.log(`No data in ${collectionName} collection`);
        }
      }
      
      setJournalEntries(journalData);
      
      // Prepare mood chart data
      if (journalData.length > 0) {
        const labels = journalData.slice(0, 7).reverse().map(entry => {
          const date = new Date(entry.date.toDate ? entry.date.toDate() : entry.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const moodValues = journalData.slice(0, 7).reverse().map(entry => entry.mood || 3);
        
        setMoodData({
          labels,
          datasets: [
            {
              label: 'Mood Rating',
              data: moodValues,
              borderColor: '#ff8fab',
              backgroundColor: 'rgba(255, 194, 209, 0.2)',
              tension: 0.3,
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImageURL(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value,
    });
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setUsernameError('');
    
    try {
      if (!user) {
        console.error('No user found');
        return;
      }
      
      if (profileForm.username !== userData.username) {
        if (lastUsernameChange) {
          const lastChange = new Date(lastUsernameChange.toDate ? lastUsernameChange.toDate() : lastUsernameChange);
          const daysSinceChange = Math.floor((new Date() - lastChange) / (1000 * 60 * 60 * 24));
          
          if (daysSinceChange < 14) {
            setUsernameError(`You can change your username again in ${14 - daysSinceChange} days.`);
            return;
          }
        }
        
        const usernameQuery = query(collection(db, 'users'), where('username', '==', profileForm.username));
        const usernameSnapshot = await getDocs(usernameQuery);
        
        if (!usernameSnapshot.empty && usernameSnapshot.docs[0].id !== user.uid) {
          setUsernameError('This username is already taken.');
          return;
        }
      }

      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        ...profileForm,
      };
      
      if (profileForm.username !== userData.username) {
        updateData.lastUsernameChange = new Date();
      }

      // Upload profile image if changed
      if (profileImage) {
        try {
          console.log('Uploading profile image:', profileImage);
          
          // Create a reference with a timestamp to avoid caching issues
          const timestamp = new Date().getTime();
          const storageRef = ref(storage, `profileImages/${user.uid}_${timestamp}`);
          
          // Upload the file
          await uploadBytes(storageRef, profileImage);
          console.log('Image uploaded successfully');
          
          // Get the download URL
          const downloadURL = await getDownloadURL(storageRef);
          console.log('Image URL:', downloadURL);
          
          // Add to update data
          updateData.profileImageURL = downloadURL;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('Failed to upload profile image. Please try again.');
        }
      }

      console.log('Updating user data:', updateData);
      
      // Update the Firestore document
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUserData({ ...userData, ...updateData });
      
      // Close edit form
      setShowEditProfile(false);
      
      // Update last username change time
      setLastUsernameChange(updateData.lastUsernameChange || lastUsernameChange);
      
      // Refresh user data to ensure changes are reflected
      await fetchUserData(user.uid);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile. Please try again.');
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardWrapper}>
        {/* div1: Profile Area */}
        <div className={styles.profileSection}>
          <div className={styles.profileImageContainer} onClick={!showEditProfile ? null : handleProfileImageClick}>
            {profileImageURL ? (
              <img src={profileImageURL} alt="Profile" className={styles.profileImage} />
            ) : (
              <div className={styles.profileImagePlaceholder}>
                {userData.displayName ? userData.displayName.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            {showEditProfile && (
              <div className={styles.profileImageOverlay}>
                <span>Change Photo</span>
              </div>
            )}
          </div>

          {showEditProfile ? (
            <form onSubmit={handleSubmitProfile} className={styles.editProfileForm}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                style={{ display: 'none' }}
              />
              
              <div className={styles.formGroup}>
                <label htmlFor="displayName">Name</label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={profileForm.displayName}
                  onChange={handleProfileFormChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={profileForm.username}
                  onChange={handleProfileFormChange}
                  required
                />
                {usernameError && <p className={styles.errorText}>{usernameError}</p>}
                <small>Can change once every 14 days</small>
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
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  value={profileForm.birthdate}
                  onChange={handleProfileFormChange}
                />
              </div>
              
              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>Save Changes</button>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowEditProfile(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.profileInfo}>
              <h2>{userData.displayName || 'No Name Set'}</h2>
              <p className={styles.username}>@{userData.username || 'username'}</p>
              <p className={styles.bio}>{userData.bio || 'No bio yet'}</p>
              
              {userData.birthdate && (
                <div className={styles.birthdateInfo}>
                  <p className={styles.birthdate}>
                    <span className={styles.birthdateLabel}>Birthday:</span> {formatDate(userData.birthdate)}
                  </p>
                  {userData.birthdate && (
                    <p className={styles.age}>
                      <span className={styles.ageLabel}>Age:</span> {calculateAge(userData.birthdate)} years old
                    </p>
                  )}
                </div>
              )}
              
              <button 
                className={styles.editProfileButton}
                onClick={() => setShowEditProfile(true)}
              >
                Edit Profile
              </button>
              
              <button 
                onClick={handleLogout} 
                className={styles.logoutButton}
              >
                Log Out
              </button>
            </div>
          )}
        </div>

        {/* New Affirmation and Quote Section */}
        <div className={styles.inspirationContainer}>
          {/* Affirmation Section */}
          <div className={styles.affirmationBox}>
            <div className={styles.affirmationHeader}>
              <h3>Daily Affirmation</h3>
              <button 
                className={styles.refreshButton} 
                onClick={() => setCurrentAffirmation(getRandomAffirmation())}
                aria-label="Get new affirmation"
              >
                Refresh
              </button>
            </div>
            <div className={styles.affirmationContent}>
              <p className={styles.affirmationText}>{currentAffirmation}</p>
            </div>
          </div>

          {/* Quote Section */}
          <div className={styles.quoteBox}>
            <div className={styles.quoteHeader}>
              <h3>Inspiring Quote</h3>
              <button 
                className={styles.refreshButton} 
                onClick={() => setCurrentQuote(getRandomQuote())}
                aria-label="Get new quote"
              >
                Refresh
              </button>
            </div>
            <div className={styles.quoteContent}>
              <div className={styles.quoteTextContainer}>
                <p className={styles.quoteText}>{currentQuote.text}</p>
                <p className={styles.quoteAuthor}>— {currentQuote.author}</p>
              </div>
            </div>
          </div>
        </div>

        {/* div2-div5: Summary Boxes */}
        <div className={styles.summaryGrid}>
          {/* div2: Goals Summary */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryHeader}>
              <h3>Your Goals</h3>
              <Link to="/goals" className={styles.viewAllLink}>View All</Link>
            </div>
            <div className={styles.summaryContent}>
              {goals.length === 0 ? (
                <p className={styles.emptyStateText}>No goals created yet. Start by creating your first goal!</p>
              ) : (
                <ul className={styles.summaryList}>
                  {goals.slice(0, 3).map(goal => (
                    <li key={goal.id} className={styles.summaryItem}>
                      <div className={styles.summaryItemTitle}>{goal.title}</div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${(goal.progress || 0)}%` }}
                        ></div>
                      </div>
                      <span className={styles.progressText}>{goal.progress || 0}% Complete</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* div3: Habits Summary */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryHeader}>
              <h3>Your Habits</h3>
              <Link to="/habits" className={styles.viewAllLink}>View All</Link>
            </div>
            <div className={styles.summaryContent}>
              {habits.length === 0 ? (
                <p className={styles.emptyStateText}>No habits tracked yet. Start building consistent routines!</p>
              ) : (
                <ul className={styles.summaryList}>
                  {habits.slice(0, 3).map(habit => (
                    <li key={habit.id} className={styles.summaryItem}>
                      <div className={styles.summaryItemTitle}>{habit.name}</div>
                      <div className={styles.habitStreak}>
                        <span className={styles.streakCount}>{habit.currentStreak || 0}</span>
                        <span className={styles.streakLabel}>day streak</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* div4: Reading List Summary */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryHeader}>
              <h3>Your Reading List</h3>
              <Link to="/reading" className={styles.viewAllLink}>View All</Link>
            </div>
            <div className={styles.summaryContent}>
              {readingList.length === 0 ? (
                <p className={styles.emptyStateText}>Your reading list is empty. Add books you want to read!</p>
              ) : (
                <ul className={styles.summaryList}>
                  {readingList.slice(0, 3).map(book => (
                    <li key={book.id} className={styles.summaryItem}>
                      <div className={styles.summaryItemTitle}>{book.title}</div>
                      <div className={styles.bookDetails}>
                        <span className={styles.bookAuthor}>{book.author}</span>
                        <span className={styles.bookStatus}>{book.status || 'To Read'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* div5: Journal Summary */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryHeader}>
              <h3>Your Journal</h3>
              <Link to="/journal" className={styles.viewAllLink}>View All</Link>
            </div>
            <div className={styles.summaryContent}>
              {journalEntries.length === 0 ? (
                <p className={styles.emptyStateText}>No journal entries yet. Start documenting your thoughts!</p>
              ) : (
                <ul className={styles.summaryList}>
                  {journalEntries.slice(0, 3).map(entry => (
                    <li key={entry.id} className={styles.summaryItem}>
                      <div className={styles.entryDate}>
                        {formatDate(entry.date.toDate ? entry.date.toDate() : entry.date)}
                      </div>
                      <div className={styles.entryPreview}>
                        {entry.content.length > 60 
                          ? `${entry.content.substring(0, 60)}...` 
                          : entry.content}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom row with mood chart and calendar */}
        <div className={styles.bottomRow}>
          {/* div6: Mini Mood Chart */}
          <div className={styles.moodChartContainer}>
            <h3>Mood Tracker</h3>
            {moodData ? (
              <div className={styles.chartWrapper}>
                <Chart 
                  type="line" 
                  data={moodData}
                  options={{
                    scales: {
                      y: {
                        min: 1,
                        max: 5,
                        ticks: {
                          stepSize: 1,
                          callback: (value) => {
                            const labels = ['', 'Very Bad', 'Bad', 'Neutral', 'Good', 'Excellent'];
                            return labels[value];
                          }
                        }
                      }
                    },
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <p className={styles.emptyStateText}>No mood data recorded yet. Start tracking in your journal!</p>
            )}
          </div>

          {/* div7: Mini Calendar */}
          <div className={styles.calendarContainer}>
            <h3>Calendar</h3>
            <div className="custom-calendar-container">
              <Calendar 
                locale="en-US"
                value={new Date()} 
                tileClassName={({ date, view }) => {
                  if (view === 'month') {
                    const hasEntry = journalEntries.some(entry => {
                      const entryDate = new Date(entry.date.toDate ? entry.date.toDate() : entry.date);
                      return entryDate.getDate() === date.getDate() && 
                             entryDate.getMonth() === date.getMonth() && 
                             entryDate.getFullYear() === date.getFullYear();
                    });
                    return hasEntry ? 'has-entry' : null;
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate age from birthdate
const calculateAge = (birthdate) => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export default LoggedInDashboard; 