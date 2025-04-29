<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import styles from './MoodSlider.module.css';

const MoodSlider = ({ initialMood = 5, onMoodChange, size = 'default' }) => {
  const [mood, setMood] = useState(initialMood);
  const moodLabels = [
    "Awful",
    "Terrible", 
    "Drained",
    "Bad",
    "Meh",
    "Could be better",
    "Fine",
    "Good",
    "Happy",
    "Ecstatic"
  ];

  useEffect(() => {
    if (onMoodChange) {
      onMoodChange(mood);
    }
  }, [mood, onMoodChange]);

  const handleMoodChange = (e) => {
    const newMood = parseInt(e.target.value, 10);
    setMood(newMood);
  };

  return (
    <div className={`${styles.moodSliderContainer} ${size === 'small' ? styles.small : ''}`}>
      <div className={styles.sliderContainer}>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={mood}
          onChange={handleMoodChange}
          className={styles.slider}
        />
        <div className={styles.cloudIcon} style={{ left: `calc(${((mood - 1) / 9) * 100}%)` }}>
          <FontAwesomeIcon icon={faCloud} style={{color: "#ffffff"}} />
        </div>
      </div>
      <p className={styles.moodLabel}>{moodLabels[mood - 1]}</p>
    </div>
  );
};

=======
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import styles from './MoodSlider.module.css';

const MoodSlider = ({ initialMood = 5, onMoodChange, size = 'default' }) => {
  const [mood, setMood] = useState(initialMood);
  const moodLabels = [
    "Awful",
    "Terrible", 
    "Drained",
    "Bad",
    "Meh",
    "Could be better",
    "Fine",
    "Good",
    "Happy",
    "Ecstatic"
  ];

  useEffect(() => {
    if (onMoodChange) {
      onMoodChange(mood);
    }
  }, [mood, onMoodChange]);

  const handleMoodChange = (e) => {
    const newMood = parseInt(e.target.value, 10);
    setMood(newMood);
  };

  return (
    <div className={`${styles.moodSliderContainer} ${size === 'small' ? styles.small : ''}`}>
      <div className={styles.sliderContainer}>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={mood}
          onChange={handleMoodChange}
          className={styles.slider}
        />
        <div className={styles.cloudIcon} style={{ left: `calc(${((mood - 1) / 9) * 100}%)` }}>
          <FontAwesomeIcon icon={faCloud} style={{color: "#ffffff"}} />
        </div>
      </div>
      <p className={styles.moodLabel}>{moodLabels[mood - 1]}</p>
    </div>
  );
};

>>>>>>> cc4f2e5ce7656da7211be821500e8d5c8b91a5b1
export default MoodSlider;