import React from 'react';

function HabitItem({ habit, onToggle, onDelete }) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const isCompletedToday = habit.completions.includes(today);

  const handleToggle = () => {
    onToggle(habit.id);
  };

  const handleDelete = () => {
    onDelete(habit.id);
  };

  return (
    <div className="gradientCard" style={{ 
      padding: '1.5rem', 
      borderRadius: '15px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem',
      transition: 'transform 0.2s ease',
      cursor: 'pointer',
      ':hover': {
        transform: 'translateY(-2px)'
      }
    }}>
      <input
        type="checkbox"
        checked={isCompletedToday}
        onChange={handleToggle}
        style={{
          width: '20px',
          height: '20px',
          cursor: 'pointer',
          accentColor: '#ffb3c1'
        }}
      />
      <div style={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem'
      }}>
        <span style={{ 
          fontSize: '1.1rem',
          color: '#532e3b',
          textDecoration: isCompletedToday ? 'line-through' : 'none',
          opacity: isCompletedToday ? 0.7 : 1
        }}>
          {habit.name}
        </span>
        {habit.time && (
          <span style={{
            fontSize: '0.9rem',
            color: '#ff8da1',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ opacity: 0.8 }}>⏰</span>
            {new Date(`2000-01-01T${habit.time}`).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </span>
        )}
      </div>
      <button 
        onClick={handleDelete} 
        className="gradientButton"
        style={{ 
          padding: '0.5rem 1rem',
          borderRadius: '10px',
          fontSize: '0.9rem',
          background: 'linear-gradient(45deg, #ff8da1, #ffb3c1)'
        }}
      >
        Delete
      </button>
      {/* Streak and other info will go here later */}
    </div>
  );
}

export default HabitItem;