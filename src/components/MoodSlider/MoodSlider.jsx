import React, { useState, useEffect } from 'react';
import styles from './MoodSlider.module.css';

const MoodSlider = ({ initialMood = 5, onMoodChange }) => {
  const [mood, setMood] = useState(initialMood);
  const moodLabels = ["Awful", "Terrible", "Very Bad", "Bad", "Meh", "Okay", "Good", "Very Good", "Great", "Awesome"];

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
    <div className={styles.moodSliderContainer}>
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
      </div>
      <p className={styles.moodLabel}>{moodLabels[mood - 1]}</p>
    </div>
  );
};

export default MoodSlider;
