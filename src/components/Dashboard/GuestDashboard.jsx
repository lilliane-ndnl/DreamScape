import React, { useState, useEffect, useCallback } from 'react';
import styles from './GuestDashboard.module.css';
import affirmationsData from '../../data/affirmations.json';
import quotesData from '../../data/quotes.json';

function GuestDashboard() {
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [currentQuote, setCurrentQuote] = useState({ text: '', author: '' });
  const [isAffirmationAnimating, setIsAffirmationAnimating] = useState(false);
  const [isQuoteAnimating, setIsQuoteAnimating] = useState(false);
  const [showBackground, setShowBackground] = useState(false);

  // Helper function to get random item from array
  const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

  // Helper functions for affirmations and quotes
  const getAllAffirmations = () => Object.values(affirmationsData.categories).flat();
  const getAllQuotes = () => Object.values(quotesData.categories).flat();

  const handleNewAffirmation = useCallback(() => {
    setIsAffirmationAnimating(true);
    setTimeout(() => {
      const allAffirmations = getAllAffirmations();
      const newAffirmation = getRandomItem(allAffirmations);
      setCurrentAffirmation(`${newAffirmation.text} ${newAffirmation.emoji}`);
      setIsAffirmationAnimating(false);
    }, 500);
  }, []);

  const handleNewQuote = useCallback(() => {
    setIsQuoteAnimating(true);
    setTimeout(() => {
      const allQuotes = getAllQuotes();
      const newQuote = getRandomItem(allQuotes);
      setCurrentQuote(newQuote);
      setIsQuoteAnimating(false);
    }, 500);
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
          <div className={`${styles.affirmationText} ${isAffirmationAnimating ? styles.fadeOut : styles.fadeIn}`}>
            {currentAffirmation}
          </div>
          
          <button 
            className={styles.newAffirmationButton}
            onClick={handleNewAffirmation}
            disabled={isAffirmationAnimating}
          >
            New Affirmation ✦
          </button>
        </div>

        <div className={styles.inspirationalQuote}>
          <div className={`${styles.quoteText} ${isQuoteAnimating ? styles.fadeOut : styles.fadeIn}`}>
            "{currentQuote.text}"
            <span className={styles.quoteAuthor}>- {currentQuote.author}</span>
          </div>
          <button 
            className={styles.newAffirmationButton}
            onClick={handleNewQuote}
            disabled={isQuoteAnimating}
            style={{ marginTop: '1rem' }}
          >
            New Quote ✦
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuestDashboard; 
