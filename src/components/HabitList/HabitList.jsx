import React, { useState, useEffect } from 'react';
import HabitItem from '../HabitItem/HabitItem';
import styles from './HabitList.module.css';
import '../../styles/shared.css';

function HabitList() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitTime, setNewHabitTime] = useState('');
  const [showBackground, setShowBackground] = useState(false);

  // Load habits from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  // Save habits to localStorage
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    // Show background with delay
    setTimeout(() => setShowBackground(true), 500);
  }, []);

  const handleAddHabit = () => {
    if (newHabitName.trim() !== '') {
      const newHabit = {
        id: Date.now() + Math.random(),
        name: newHabitName,
        time: newHabitTime || null,
        completions: [], // Array to store completion dates
      };
      setHabits([...habits, newHabit]);
      setNewHabitName('');
      setNewHabitTime('');
    }
  };

  const handleToggleHabit = (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const isCompletedToday = habit.completions.includes(today);
        const updatedCompletions = isCompletedToday
          ? habit.completions.filter(date => date !== today)
          : [...habit.completions, today];

        return { ...habit, completions: updatedCompletions };
      }
      return habit;
    }));
  };

  const handleDeleteHabit = (habitId) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
  };

  return (
    <div className={`pageContainer ${showBackground ? 'showBackground' : ''}`}>
      <div className="floatingShapes">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`shape shape${i + 1}`} />
        ))}
      </div>

      <h1 className={`pageTitle ${styles.habitTitle}`}>My Habits</h1>
      
      <div className={`wideContainer ${styles.habitContainer}`}>
        <div className={`gradientCard ${styles.habitCard}`}>
          <div className={styles.inputArea}>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter a new habit..."
              className={`gradientInput ${styles.habitInput}`}
            />
            <input
              type="time"
              value={newHabitTime}
              onChange={(e) => setNewHabitTime(e.target.value)}
              className={`gradientInput ${styles.timeInput}`}
            />
            <button 
              onClick={handleAddHabit} 
              className={`gradientButton ${styles.addButton}`}
            >
              Add Habit
            </button>
          </div>

          <div className={styles.habitsGrid}>
            {habits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onToggle={handleToggleHabit}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HabitList;