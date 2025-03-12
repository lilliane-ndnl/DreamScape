import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { useUserAuth } from '../../contexts/UserAuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function LoggedInDashboard() {
  const [showBackground, setShowBackground] = useState(false);
  const { user } = useUserAuth();
  const navigate = useNavigate();
  
  // User profile state
  const [profileData, setProfileData] = useState({
    displayName: '',
    username: '',
    bio: '',
    birthday: '',
    age: '',
    photoURL: '',
    lastUsernameUpdate: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const fileInputRef = useRef(null);
  
  // Dashboard data state
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [books, setBooks] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [date, setDate] = useState(new Date());
  
  // Time calculations for GMT+7
  const getGMT7Time = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 7)); // GMT+7
  };
  
  useEffect(() => {
    // Show background with delay
    const backgroundTimer = setTimeout(() => setShowBackground(true), 500);
    
    // Load user profile data
    const loadUserProfile = async () => {
      if (user?.uid) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileData({
              displayName: user.displayName || userData.displayName || 'Dreamer',
              username: userData.username || '',
              bio: userData.bio || '',
              birthday: userData.birthday || '',
              age: userData.age || '',
              photoURL: user.photoURL || userData.photoURL || '',
              lastUsernameUpdate: userData.lastUsernameUpdate || null
            });
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    };
    
    // Load data from localStorage
    const loadLocalData = () => {
      // Load goals
      const savedGoals = localStorage.getItem('goals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
      
      // Load habits
      const savedHabits = localStorage.getItem('habits');
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
      
      // Load reading list
      const savedBooks = localStorage.getItem('readingList');
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks));
      }
      
      // Load journal entries
      const savedEntries = localStorage.getItem('journalEntries');
      if (savedEntries) {
        setJournalEntries(JSON.parse(savedEntries));
      }
    };
    
    loadUserProfile();
    loadLocalData();
    
    return () => clearTimeout(backgroundTimer);
  }, [user]);
  
  const handleNavigate = (path) => {
    navigate(path);
  };
  
  const handleEditProfile = () => {
    setEditFormData({...profileData});
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile_photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const photoURL = await getDownloadURL(storageRef);
      
      // Update editFormData
      setEditFormData(prev => ({
        ...prev,
        photoURL
      }));
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    
    // Check if username is being changed and if allowed
    const canChangeUsername = !profileData.lastUsernameUpdate || 
      (new Date() - new Date(profileData.lastUsernameUpdate)) > (14 * 24 * 60 * 60 * 1000);
    
    if (editFormData.username !== profileData.username && !canChangeUsername) {
      alert("You can only change your username once every 14 days.");
      return;
    }
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      
      const updateData = {
        ...editFormData,
        lastUsernameUpdate: editFormData.username !== profileData.username ? 
          new Date().toISOString() : profileData.lastUsernameUpdate
      };
      
      await updateDoc(userDocRef, updateData);
      setProfileData(updateData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  
  // Calculate mood data for the chart
  const getMoodData = () => {
    if (!journalEntries.length) return [];
    
    // Sort entries by date
    const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get last 7 entries with mood data
    return sortedEntries
      .filter(entry => entry.mood !== undefined)
      .slice(0, 7)
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString(),
        mood: entry.mood
      }))
      .reverse();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate completion percentage
  const calculateGoalProgress = (goal) => {
    if (!goal.steps || goal.steps.length === 0) return 0;
    const completedSteps = goal.steps.filter(step => step.completed).length;
    return Math.round((completedSteps / goal.steps.length) * 100);
  };
  
  // Get habit streak
  const getHabitStreak = (habit) => {
    if (!habit.completions || habit.completions.length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      if (habit.completions.includes(dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  // Get recent books
  const getRecentBooks = () => {
    const currentlyReading = books.filter(book => book.status === "Currently Reading");
    if (currentlyReading.length) return currentlyReading.slice(0, 3);
    
    return books.slice(0, 3);
  };
  
  // Get recent journal entries
  const getRecentEntries = () => {
    return [...journalEntries]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  };
  
  // Calculate mood colors
  const getMoodColor = (moodValue) => {
    if (moodValue >= 8) return '#77dd77'; // Happy - green
    if (moodValue >= 6) return '#b0c2f2'; // Content - light blue
    if (moodValue >= 4) return '#fdfd96'; // Neutral - yellow
    if (moodValue >= 2) return '#ffb347'; // Sad - orange
    return '#ff6961'; // Very sad - red
  };
  
  // GMT+7 time display
  const gmt7Time = getGMT7Time();
  const timeString = gmt7Time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'UTC'
  });
  
  const moodData = getMoodData();
  const recentGoals = goals.slice(0, 3);
  const recentHabits = habits.slice(0, 3);
  const recentBooks = getRecentBooks();
  const recentEntries = getRecentEntries();
  
  return (
    <div className={`pageContainer ${showBackground ? 'showBackground' : ''}`}>
      <div className="floatingShapes">
        {[...Array(11)].map((_, i) => (
          <div key={i} className={`shape shape${i + 1}`} />
        ))}
      </div>

      <div className={styles.dashboardContainer}>
        <h1 className={styles.welcomeTitle}>Welcome, {profileData.displayName || 'Dreamer'}!</h1>
        
        <div className={styles.dashboardLayout}>
          {/* Profile Area - div1 */}
          <div className={styles.profileSection}>
            {!isEditing ? (
              <>
                <div className={styles.profilePhotoContainer}>
                  {profileData.photoURL ? (
                    <img 
                      src={profileData.photoURL} 
                      alt="Profile" 
                      className={styles.profilePhoto} 
                    />
                  ) : (
                    <div className={styles.profilePhotoPlaceholder}>
                      {profileData.displayName ? profileData.displayName[0].toUpperCase() : 'D'}
                    </div>
                  )}
                </div>
                <h2 className={styles.profileName}>{profileData.displayName}</h2>
                {profileData.username && <p className={styles.profileUsername}>@{profileData.username}</p>}
                
                {profileData.bio && (
                  <div className={styles.profileBio}>
                    <h3>Bio</h3>
                    <p>{profileData.bio}</p>
                  </div>
                )}
                
                {(profileData.birthday || profileData.age) && (
                  <div className={styles.profileDetail}>
                    {profileData.birthday && <p><strong>Birthday:</strong> {profileData.birthday}</p>}
                    {profileData.age && <p><strong>Age:</strong> {profileData.age}</p>}
                  </div>
                )}
                
                <button 
                  className={styles.editProfileButton}
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <div className={styles.editProfileForm}>
                <h2>Edit Profile</h2>
                
                <div className={styles.profilePhotoEdit}>
                  {editFormData.photoURL ? (
                    <img 
                      src={editFormData.photoURL} 
                      alt="Profile" 
                      className={styles.profilePhoto} 
                    />
                  ) : (
                    <div className={styles.profilePhotoPlaceholder}>
                      {editFormData.displayName ? editFormData.displayName[0].toUpperCase() : 'D'}
                    </div>
                  )}
                  
                  <button 
                    type="button" 
                    className={styles.changePhotoButton}
                    onClick={() => fileInputRef.current.click()}
                  >
                    Change Photo
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePhotoChange}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="displayName">Name</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={editFormData.displayName || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="username">Username {!canChangeUsername && '(Changes limited to once every 14 days)'}</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={editFormData.username || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={editFormData.bio || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="birthday">Birthday</label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={editFormData.birthday || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={editFormData.age || ''}
                    onChange={handleInputChange}
                    min="1"
                    max="120"
                  />
                </div>
                
                <div className={styles.editProfileButtons}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className={styles.saveButton}
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Goals Summary - div2 */}
          <div className={styles.summaryCard}>
            <h3>Your Goals</h3>
            {goals.length === 0 ? (
              <p>No goals created yet. Start by creating your first goal!</p>
            ) : (
              <div className={styles.summaryList}>
                {recentGoals.map(goal => (
                  <div key={goal.id} className={styles.summaryItem}>
                    <div className={styles.summaryItemHeader}>
                      <h4>{goal.title}</h4>
                      <span className={styles.progressLabel}>
                        {calculateGoalProgress(goal)}%
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${calculateGoalProgress(goal)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {goals.length > 3 && (
                  <p className={styles.moreItemsNote}>
                    +{goals.length - 3} more goals
                  </p>
                )}
              </div>
            )}
            <button 
              className={styles.actionButton}
              onClick={() => handleNavigate('/goals')}
            >
              {goals.length === 0 ? 'Create Goal' : 'View All Goals'}
            </button>
          </div>
          
          {/* Habits Summary - div3 */}
          <div className={styles.summaryCard}>
            <h3>Your Habits</h3>
            {habits.length === 0 ? (
              <p>No habits created yet. Start tracking your daily habits!</p>
            ) : (
              <div className={styles.summaryList}>
                {recentHabits.map(habit => {
                  const streak = getHabitStreak(habit);
                  return (
                    <div key={habit.id} className={styles.summaryItem}>
                      <h4>{habit.name}</h4>
                      <div className={styles.habitMeta}>
                        <span className={styles.streakBadge}>
                          🔥 {streak} day streak
                        </span>
                        {habit.time && (
                          <span className={styles.habitTime}>⏰ {habit.time}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {habits.length > 3 && (
                  <p className={styles.moreItemsNote}>
                    +{habits.length - 3} more habits
                  </p>
                )}
              </div>
            )}
            <button 
              className={styles.actionButton}
              onClick={() => handleNavigate('/habits')}
            >
              {habits.length === 0 ? 'Add Habit' : 'View All Habits'}
            </button>
          </div>
          
          {/* Reading List Summary - div4 */}
          <div className={styles.summaryCard}>
            <h3>Reading List</h3>
            {books.length === 0 ? (
              <p>Your reading list is empty. Add books you want to read!</p>
            ) : (
              <div className={styles.summaryList}>
                {recentBooks.map(book => (
                  <div key={book.id} className={styles.summaryItem}>
                    <div className={styles.bookInfo}>
                      {book.coverURL ? (
                        <img 
                          src={book.coverURL} 
                          alt={book.title} 
                          className={styles.bookCover} 
                        />
                      ) : (
                        <div className={styles.bookCoverPlaceholder}>
                          {book.title[0]}
                        </div>
                      )}
                      <div>
                        <h4>{book.title}</h4>
                        <p className={styles.bookAuthor}>{book.author}</p>
                        <span className={styles.bookStatus}>{book.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {books.length > 3 && (
                  <p className={styles.moreItemsNote}>
                    +{books.length - 3} more books
                  </p>
                )}
              </div>
            )}
            <button 
              className={styles.actionButton}
              onClick={() => handleNavigate('/reading')}
            >
              {books.length === 0 ? 'Add Books' : 'View Reading List'}
            </button>
          </div>
          
          {/* Journal Summary - div5 */}
          <div className={styles.summaryCard}>
            <h3>Journal</h3>
            {journalEntries.length === 0 ? (
              <p>No journal entries yet. Start capturing your thoughts!</p>
            ) : (
              <div className={styles.summaryList}>
                {recentEntries.map(entry => (
                  <div key={entry.id} className={styles.summaryItem}>
                    <div className={styles.entryHeader}>
                      <span className={styles.entryDate}>
                        {formatDate(entry.date)}
                      </span>
                      {entry.mood !== undefined && (
                        <div 
                          className={styles.moodIndicator}
                          style={{ backgroundColor: getMoodColor(entry.mood) }}
                          title={`Mood: ${entry.mood}/10`}
                        />
                      )}
                    </div>
                    <p className={styles.entryPreview}>
                      {entry.content.length > 80 
                        ? `${entry.content.substring(0, 80)}...` 
                        : entry.content}
                    </p>
                  </div>
                ))}
                {journalEntries.length > 3 && (
                  <p className={styles.moreItemsNote}>
                    +{journalEntries.length - 3} more entries
                  </p>
                )}
              </div>
            )}
            <button 
              className={styles.actionButton}
              onClick={() => handleNavigate('/journal')}
            >
              {journalEntries.length === 0 ? 'Write Entry' : 'View Journal'}
            </button>
          </div>
          
          {/* Mood Chart - div6 */}
          <div className={styles.moodChartCard}>
            <h3>Mood Trends</h3>
            {moodData.length === 0 ? (
              <p>Track your mood in journal entries to see trends here!</p>
            ) : (
              <div className={styles.moodChart}>
                <div className={styles.chartLabels}>
                  <span>10</span>
                  <span>5</span>
                  <span>0</span>
                </div>
                <div className={styles.chartBars}>
                  {moodData.map((item, index) => (
                    <div key={index} className={styles.chartBarContainer}>
                      <div 
                        className={styles.chartBar} 
                        style={{ 
                          height: `${(item.mood / 10) * 100}%`,
                          backgroundColor: getMoodColor(item.mood)
                        }}
                        title={`${item.date}: ${item.mood}/10`}
                      />
                      <span className={styles.chartDate}>
                        {item.date.split('/')[1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button 
              className={styles.actionButton}
              onClick={() => handleNavigate('/journal')}
            >
              Record Mood
            </button>
          </div>
          
          {/* Calendar - div7 */}
          <div className={styles.calendarCard}>
            <h3>Calendar (GMT+7)</h3>
            <div className={styles.timeDisplay}>
              <span>{timeString}</span>
              <span>{gmt7Time.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'UTC'
              })}</span>
            </div>
            <div className={styles.calendarWrapper}>
              <Calendar 
                value={date}
                onChange={setDate}
                className={styles.reactCalendar}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoggedInDashboard; 