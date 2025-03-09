import React, { useState, useEffect, useRef } from 'react';
import styles from './Journal.module.css';
import promptsData from '../../data/prompts.json';
import MoodTrends from '../MoodTrends/MoodTrends';
import MoodSlider from '../MoodSlider/MoodSlider';
import '../../styles/shared.css';

// Common emojis for moods - organized by categories
const commonEmojis = [
    // Happy/Positive
    '😊', '😃', '😄', '😁', '🥰', '😍', '🤗', '😌', '😎', '🥳',
    // Love/Hearts
    '💖', '💝', '💕', '💓', '💗', '💞', '💘', '💟',
    // Sad/Negative
    '😢', '😭', '😔', '😕', '😟', '🥺', '😩', '😫',
    // Angry/Frustrated
    '😠', '😡', '🤬', '😤', '😣', '😖', '😫', '😒',
    // Tired/Sick
    '😪', '😴', '🤒', '😷', '🤢', '🤮', '🥴', '😵',
    // Worried/Scared
    '😨', '😰', '😱', '😓', '😥', '😧', '😦', '😮',
    // Neutral/Thoughtful
    '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😌',
    // Silly/Fun
    '🤪', '😜', '😝', '😛', '🤓', '🥸', '🤡', '😎',
    // Nature/Weather Moods
    '🌞', '🌤️', '🌧️', '⛈️', '🌈', '✨', '⭐', '🌙',
    // Activity Moods
    '💪', '🧘', '🎮', '📚', '🎨', '🎵', '🎬', '🍽️'
];

// Expanded color options (16 colors)
const colorOptions = [
    // Warm & Happy Colors
    '#FFCACA', // soft pink (slightly deeper)
    '#FFD6B8', // soft peach (more saturated)
    '#FFE99B', // soft yellow (more vibrant)
    '#FFD6E5', // baby pink (deeper)

    // Cool & Calm Colors
    '#C1D8FF', // soft blue (more saturated)
    '#D6E5FF', // lighter blue
    '#C1FFD6', // mint green (more vibrant)
    '#D6E8D6', // sage green (more saturated)

    // Gentle & Sweet Colors
    '#E6D6FF', // soft purple (deeper)
    '#FFD6E8', // light rose (more saturated)
    '#D6FFF2', // aqua mint (more vibrant)
    '#FFE1D6', // soft coral (deeper)

    // Negative Emotion Colors
    '#DBDBDB', // soft gray (deeper)
    '#D6C7B8', // soft brown (more saturated)
    '#C9C5BE', // stone gray (deeper)
    '#D6D0C4'  // taupe gray (more saturated)
];

function Journal() {
    const [entries, setEntries] = useState([]);
    const [newEntryText, setNewEntryText] = useState('');
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [moodRating, setMoodRating] = useState(5); // Default to middle rating
    const [moodDescription, setMoodDescription] = useState('');
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const [showBackground, setShowBackground] = useState(false);

    // Load entries from localStorage on component mount
    useEffect(() => {
        const savedEntries = localStorage.getItem('journalEntries');
        if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
        }
        getRandomPrompt();
    }, []);

    // Save entries to localStorage whenever entries change
    useEffect(() => {
        localStorage.setItem('journalEntries', JSON.stringify(entries));
    }, [entries]);

    useEffect(() => {
        // Show background with delay
        setTimeout(() => setShowBackground(true), 500);
    }, []);

    const getRandomPrompt = () => {
        const allPrompts = Object.values(promptsData.categories).flat();
        const randomIndex = Math.floor(Math.random() * allPrompts.length);
        setCurrentPrompt(allPrompts[randomIndex]);
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        
        const filePromises = validFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        url: reader.result,
                        name: file.name,
                        type: file.type
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(filePromises).then(newAttachments => {
            setAttachments(prev => [...prev, ...newAttachments].slice(0, 4)); // Limit to 4 images
        });
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddEntry = () => {
        if (newEntryText.trim() !== '') {
            const newEntry = {
                id: Date.now(),
                date: new Date().toISOString(),
                text: newEntryText,
                mood: {
                    rating: moodRating,
                    description: moodDescription.trim() || null
                },
                attachments: attachments
            };
            setEntries([newEntry, ...entries]);
            setNewEntryText('');
            setMoodRating(5); // Reset to middle rating
            setMoodDescription('');
            setAttachments([]);
            getRandomPrompt();
        }
    };

    const handleDeleteEntry = (entryId) => {
        setEntries(entries.filter(entry => entry.id !== entryId));
    };

    const handleMoodChange = (newMoodValue) => {
        setMoodRating(newMoodValue);
    };

    return (
        <div className={`pageContainer ${showBackground ? 'showBackground' : ''}`}>
            <div className="floatingShapes">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`shape shape${i + 1}`} />
                ))}
            </div>

            <h1 className="pageTitle">My Reflection Journal</h1>
            
            <div className="wideContainer">
                <div className="gradientCard" style={{ padding: '2rem', borderRadius: '20px', position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '2rem',
                        marginBottom: '2rem'
                    }}>
                        {/* Column 1 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Prompt Section */}
                            <div className="gradientCard" style={{ padding: '1.5rem', borderRadius: '15px' }}>
                                <h3 style={{ 
                                    color: '#532e3b', 
                                    marginBottom: '1rem',
                                    fontFamily: 'Playfair Display, serif',
                                    fontWeight: 500
                                }}>Today's Prompt</h3>
                                {currentPrompt && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{currentPrompt.emoji}</span>
                                        <p style={{ 
                                            color: '#532e3b', 
                                            fontSize: '1.1rem', 
                                            lineHeight: '1.6', 
                                            margin: 0,
                                            fontFamily: 'Playfair Display, serif',
                                            fontStyle: 'italic'
                                        }}>
                                            {currentPrompt.text}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Photo Upload Section */}
                            <div className="gradientCard" style={{ padding: '1.5rem', borderRadius: '15px' }}>
                                <h3 style={{ 
                                    color: '#532e3b', 
                                    marginBottom: '1rem',
                                    fontFamily: 'Playfair Display, serif',
                                    fontWeight: 500
                                }}>Add Photos (Max 4)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                        multiple
                                        style={{ display: 'none' }}
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="gradientButton"
                                        style={{ 
                                            padding: '0.8rem',
                                            borderRadius: '10px',
                                            fontSize: '0.9rem'
                                        }}
                                        disabled={attachments.length >= 4}
                                    >
                                        {attachments.length >= 4 ? 'Maximum photos reached' : 'Choose Photos'}
                                    </button>
                                    {attachments.length > 0 && (
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: '0.5rem'
                                        }}>
                                            {attachments.map((file, index) => (
                                                <div key={index} style={{ position: 'relative' }}>
                                                    <img 
                                                        src={file.url} 
                                                        alt={`Attachment ${index + 1}`}
                                                        style={{ 
                                                            width: '100%',
                                                            height: '80px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px',
                                                            opacity: 0.9
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => removeAttachment(index)}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '2px',
                                                            right: '2px',
                                                            background: 'rgba(255, 255, 255, 0.9)',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '20px',
                                                            height: '20px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#ff8da1',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Column 2 - Mood Tracker */}
                        <div className="gradientCard" style={{ padding: '1.5rem', borderRadius: '15px' }}>
                            <h3 style={{ 
                                color: '#532e3b', 
                                marginBottom: '1rem',
                                fontFamily: 'Playfair Display, serif',
                                fontWeight: 500
                            }}>How are you feeling?</h3>
                            <MoodSlider 
                                initialMood={moodRating} 
                                onMoodChange={handleMoodChange} 
                            />
                            <div style={{ marginTop: '1rem' }}>
                                <input
                                    type="text"
                                    value={moodDescription}
                                    onChange={(e) => setMoodDescription(e.target.value)}
                                    placeholder="Optional: Describe your mood..."
                                    className="gradientInput"
                                    style={{ 
                                        width: '100%',
                                        padding: '0.8rem',
                                        borderRadius: '10px'
                                    }}
                                    maxLength={30}
                                />
                            </div>
                        </div>

                        {/* Column 3 - Mood Trends */}
                        <div style={{ height: '100%' }}>
                            <MoodTrends entries={entries} />
                        </div>
                    </div>

                    {/* Journal Entry Text - Full Width */}
                    <div style={{ marginTop: '2rem' }}>
                        <textarea
                            value={newEntryText}
                            onChange={(e) => setNewEntryText(e.target.value)}
                            placeholder="Write your thoughts here..."
                            className="gradientInput"
                            style={{ 
                                width: '100%',
                                minHeight: '200px',
                                padding: '1rem',
                                borderRadius: '15px',
                                resize: 'vertical',
                                fontFamily: 'VT323, monospace',
                                fontSize: '1.1rem',
                                lineHeight: '1.6'
                            }}
                        />
                        <button 
                            onClick={handleAddEntry}
                            className="gradientButton"
                            style={{ 
                                marginTop: '1rem',
                                padding: '1rem 2rem',
                                borderRadius: '15px',
                                fontSize: '1rem',
                                fontFamily: 'Playfair Display, serif',
                                fontWeight: 500
                            }}
                        >
                            Save Entry
                        </button>
                    </div>
                </div>

                {/* Entries Section */}
                <div className="gradientCard" style={{ padding: '2rem', borderRadius: '20px', marginTop: '2rem', position: 'relative', zIndex: 1 }}>
                    <div className={styles.entriesContainer}>
                        {entries.map(entry => (
                            <div key={entry.id} className={styles.entry}>
                                <div className={styles.entryHeader}>
                                    <div className={styles.entryInfo}>
                                        <p className={styles.entryDate}>
                                            {new Date(entry.date).toLocaleString()}
                                        </p>
                                        {entry.mood && (
                                            <div className={styles.entryMood}>
                                                <span className={styles.moodRating}>Mood: {entry.mood.rating}/10</span>
                                                {entry.mood.description && (
                                                    <span className={styles.moodDescription}> - {entry.mood.description}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteEntry(entry.id)} 
                                        className={styles.deleteButton}
                                    >
                                        Delete
                                    </button>
                                </div>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 200px',
                                    gap: '1.5rem',
                                    marginTop: '1rem'
                                }}>
                                    <p className={styles.entryText}>{entry.text}</p>
                                    {entry.attachments && entry.attachments.length > 0 && (
                                        <div style={{
                                            width: '200px',
                                            height: '200px',
                                            display: 'grid',
                                            gridTemplateColumns: entry.attachments.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                                            gap: '4px',
                                            borderRadius: '12px',
                                            overflow: 'hidden'
                                        }}>
                                            {entry.attachments.map((file, index) => (
                                                <div key={index} style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: entry.attachments.length === 1 ? '200px' : '98px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <img 
                                                        src={file.url} 
                                                        alt={`Attachment ${index + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            opacity: 0.9
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Journal;
