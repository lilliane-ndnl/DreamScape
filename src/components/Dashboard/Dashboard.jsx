import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import affirmationsData from '../../data/affirmations.json';
import quotesData from '../../data/quotes.json';

function Dashboard() {
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

  const handleNewAffirmation = () => {
    setIsAnimating(true);
    const allAffirmations = getAllAffirmations();
    const newAffirmation = getRandomItem(allAffirmations);
    const affirmationText = `${newAffirmation.text} ${newAffirmation.emoji}`;
    
    setTimeout(() => {
      setCurrentAffirmation(affirmationText);
      localStorage.setItem('currentAffirmation', affirmationText);
      setIsAnimating(false);
    }, 500);
  };

  const handleNewQuote = () => {
    const allQuotes = getAllQuotes();
    const newQuote = getRandomItem(allQuotes);
    setCurrentQuote(newQuote);
    localStorage.setItem('currentQuote', JSON.stringify(newQuote));
  };

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
  }, [currentAffirmation, currentQuote.text]);

  return (
    <div className={`pageContainer ${showBackground ? 'showBackground' : ''}`}>
      <div className="floatingShapes">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`shape shape${i + 1}`} />
        ))}
      </div>

      <div className={styles.logoContainer}>
        <img src="/images/dreamscape-logo.png" alt="DreamScape" className={styles.mainLogo} />
      </div>

      <div className={styles.dashboardContainer}>
        <h2 className={styles.dashboardTitle}>Daily Affirmation</h2>
        
        <div className={styles.affirmationCard}>
          <div className={`${styles.affirmationText} ${isAnimating ? styles.fadeOut : styles.fadeIn}`} style={{ fontSize: '1.2rem' }}>
            {currentAffirmation}
          </div>
          
          <button 
            className={styles.newAffirmationButton}
            onClick={handleNewAffirmation}
            disabled={isAnimating}
          >
            New Affirmation ✦
          </button>
        </div>

        <div className={styles.inspirationalQuote}>
          "{currentQuote.text}"
          <span className={styles.quoteAuthor}>- {currentQuote.author}</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
