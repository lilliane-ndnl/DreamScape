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

      <h1 className="pageTitle">My Habits</h1>
      
      <div className="wideContainer">
        <div className="gradientCard" style={{ padding: '2rem', borderRadius: '20px', position: 'relative', zIndex: 1 }}>
          <div className="inputArea" style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter a new habit..."
              className="gradientInput"
              style={{ 
                flex: '1 1 300px',
                padding: '0.8rem', 
                borderRadius: '15px', 
                fontSize: '1rem' 
              }}
            />
            <input
              type="time"
              value={newHabitTime}
              onChange={(e) => setNewHabitTime(e.target.value)}
              className="gradientInput"
              style={{ 
                padding: '0.8rem', 
                borderRadius: '15px', 
                fontSize: '1rem',
                minWidth: '150px'
              }}
            />
            <button 
              onClick={handleAddHabit} 
              className="gradientButton" 
              style={{ 
                padding: '0.8rem 1.5rem', 
                borderRadius: '15px', 
                fontSize: '1rem',
                whiteSpace: 'nowrap'
              }}
            >
              Add Habit
            </button>
          </div>

          <div className="gridLayout" style={{ gap: '1.5rem' }}>
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
