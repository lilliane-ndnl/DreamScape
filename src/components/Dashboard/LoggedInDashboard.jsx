import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Line } from 'react-chartjs-2';
import styles from './LoggedInDashboard.module.css';
import affirmationsData from '../../data/affirmations.json';
import quotesData from '../../data/quotes.json';

function LoggedInDashboard() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [books, setBooks] = useState([]);
  const [visionBoardItems, setVisionBoardItems] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [currentQuote, setCurrentQuote] = useState({ text: '', author: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get random item from array
  const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

  // Helper functions for affirmations and quotes
  const getAllAffirmations = () => Object.values(affirmationsData.categories).flat();
  const getAllQuotes = () => Object.values(quotesData.categories).flat();

  const handleNewAffirmation = () => {
    const allAffirmations = getAllAffirmations();
    const newAffirmation = getRandomItem(allAffirmations);
    setCurrentAffirmation(`${newAffirmation.text} ${newAffirmation.emoji}`);
  };

  const handleNewQuote = () => {
    const allQuotes = getAllQuotes();
    const newQuote = getRandomItem(allQuotes);
    setCurrentQuote(newQuote);
  };

  // Profile picture upload handler
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      // Update user document with new profile picture URL
      await db.collection('users').doc(currentUser.uid).update({
        profilePicture: url
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  // Bio update handler
  const handleBioUpdate = async () => {
    try {
      await db.collection('users').doc(currentUser.uid).update({
        bio: tempBio
      });
      setIsEditingBio(false);
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  // Calculate age from birthday
  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = birthday.toDate();
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Fetch user data and set up real-time listeners
  useEffect(() => {
    if (!currentUser) return;

    // Fetch user data
    const unsubscribeUser = onSnapshot(
      collection(db, 'users').doc(currentUser.uid),
      (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
          setTempBio(doc.data().bio || '');
        }
      }
    );

    // Fetch goals
    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', currentUser.uid)
    );
    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch habits
    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', currentUser.uid)
    );
    const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch reading list
    const booksQuery = query(
      collection(db, 'readingList'),
      where('userId', '==', currentUser.uid)
    );
    const unsubscribeBooks = onSnapshot(booksQuery, (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch vision board items (limited to 4)
    const visionBoardQuery = query(
      collection(db, 'visionBoard'),
      where('userId', '==', currentUser.uid)
    );
    const unsubscribeVisionBoard = onSnapshot(visionBoardQuery, (snapshot) => {
      setVisionBoardItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 4));
    });

    // Fetch mood data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const moodQuery = query(
      collection(db, 'moodEntries'),
      where('userId', '==', currentUser.uid),
      where('date', '>=', sevenDaysAgo)
    );
    const unsubscribeMood = onSnapshot(moodQuery, (snapshot) => {
      setMoodData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Get initial affirmation and quote
    handleNewAffirmation();
    handleNewQuote();
    setIsLoading(false);

    // Cleanup subscriptions
    return () => {
      unsubscribeUser();
      unsubscribeGoals();
      unsubscribeHabits();
      unsubscribeBooks();
      unsubscribeVisionBoard();
      unsubscribeMood();
    };
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Prepare mood chart data
  const moodChartData = {
    labels: moodData.map(entry => {
      const date = new Date(entry.date.toDate());
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [{
      label: 'Mood Rating',
      data: moodData.map(entry => entry.rating),
      borderColor: '#ff8da1',
      backgroundColor: 'rgba(255, 141, 161, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: 'rgba(255, 141, 161, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Left Column - User Information */}
      <div className={styles.leftColumn}>
        <div className={styles.profileSection}>
          <div className={styles.profilePictureContainer}>
            {userData?.profilePicture ? (
              <img 
                src={userData.profilePicture} 
                alt="Profile" 
                className={styles.profilePicture}
              />
            ) : (
              <div className={styles.profilePlaceholder} />
            )}
            <label className={styles.uploadButton}>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ display: 'none' }}
              />
              Update Photo
            </label>
          </div>
          
          <h2 className={styles.userName}>{userData?.name || 'User'}</h2>
          {userData?.birthday && (
            <p className={styles.userAge}>{calculateAge(userData.birthday)} years old</p>
          )}
          
          <div className={styles.bioSection}>
            {isEditingBio ? (
              <>
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className={styles.bioTextarea}
                  placeholder="Write something about yourself..."
                />
                <div className={styles.bioButtons}>
                  <button onClick={handleBioUpdate} className={styles.saveButton}>
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditingBio(false);
                      setTempBio(userData?.bio || '');
                    }} 
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.bio}>{userData?.bio || 'No bio yet'}</p>
                <button 
                  onClick={() => setIsEditingBio(true)} 
                  className={styles.editButton}
                >
                  Edit Bio
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Middle Column - Activity Summaries */}
      <div className={styles.middleColumn}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Goals</h3>
            <p className={styles.statNumber}>{goals.length}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Habits</h3>
            <p className={styles.statNumber}>{habits.length}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Books</h3>
            <p className={styles.statNumber}>{books.length}</p>
          </div>
        </div>

        <div className={styles.miniVisionBoard}>
          <h3>Vision Board Preview</h3>
          <div className={styles.visionBoardGrid}>
            {visionBoardItems.map(item => (
              <div key={item.id} className={styles.visionBoardItem}>
                <img src={item.imageUrl} alt={item.description} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.moodChart}>
          <h3>Mood Trends (Last 7 Days)</h3>
          <div className={styles.chartContainer}>
            <Line data={moodChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Right Column - Affirmation and Quote */}
      <div className={styles.rightColumn}>
        <div className={styles.affirmationCard}>
          <h3>Daily Affirmation</h3>
          <p className={styles.affirmationText}>{currentAffirmation}</p>
          <button onClick={handleNewAffirmation} className={styles.newButton}>
            New Affirmation ✦
          </button>
        </div>

        <div className={styles.quoteCard}>
          <h3>Quote of the Day</h3>
          <blockquote className={styles.quote}>
            {currentQuote.text}
            <footer>- {currentQuote.author}</footer>
          </blockquote>
          <button onClick={handleNewQuote} className={styles.newButton}>
            New Quote ✦
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoggedInDashboard; 