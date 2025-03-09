import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './About.module.css';

function About() {
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowBackground(true), 500);
  }, []);

  return (
    <div className={`pageContainer ${showBackground ? 'showBackground' : ''}`}>
      <div className="floatingShapes">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`shape shape${i + 1}`} />
        ))}
      </div>

      <h1 className={`${styles.pageTitle}`}>
        <span>About</span>
        <img src="/images/dreamscape-logo.png" alt="DreamScape" className={styles.titleLogo} />
      </h1>
      
      <div className="wideContainer">
        <div className="gradientCard" style={{ padding: '2.5rem', borderRadius: '20px', position: 'relative', zIndex: 1 }}>
          <div className={styles.contentWrapper}>
            <img 
              src="/images/Lilliane-profilephoto.jpg" 
              alt="Lilliane NDN" 
              className={styles.profilePhoto} 
            />

            <div className={styles.textContent}>
              <p className={styles.aboutText}>
                <span className={styles.dropCap}>L</span>illiane Nguyen – a student, writer, designer, and illustrator – created DreamScape from a deeply personal place. Having faced struggles with anxiety, sleep, and eating disorders, she knows what it means to feel unmoored, caught between the weight of the past and the uncertainty of the future. Yet, in the midst of that turbulence, she discovered the quiet power of reflection – not as a way to dwell on what was, but as a path to understanding, grounding, and dreaming forward.
              </p>
              <p className={styles.aboutText}>
                Progress doesn't always arrive in bold, sweeping moments. Sometimes, it's a whisper – a single completed task, a habit kept for one more day, a dream sketched into something tangible. During her hardest moments, she found that tracking even the smallest victories became a beacon – a way to remind herself that growth is never absent, only sometimes unseen. DreamScape was born from this realization: a space to collect, honor, and transform those small but mighty steps into momentum.
              </p>
            </div>
          </div>
          <h2 className={styles.whyTitle}>
            Why DreamScape?
          </h2>
          <p className={styles.aboutText}>
            The name reflects the purpose: this place is a landscape of dreams, where aspirations aren't just fleeting thoughts but living, evolving realities, shaped by action and intention.
          </p>
          <p className={styles.aboutText}>
            With this vision in mind, DreamScape was designed to be more than just a productivity tool. It is a safe, inspiring space where users can:
          </p>
          <ul className={styles.featureList}>
            <li>
              <Link to="/vision">
                <span>Visualize dreams:</span> Create a personal vision board with images and words that bring aspirations to life ✨
              </Link>
            </li>
            <li>
              <Link to="/goals">
                <span>Set and achieve goals:</span> Break big dreams into small, actionable steps, track progress, and celebrate wins 📍
              </Link>
            </li>
            <li>
              <Link to="/habits">
                <span>Build positive habits:</span> Stay consistent with meaningful routines 🔄
              </Link>
            </li>
            <li>
              <Link to="/reading">
                <span>Manage a reading list:</span> Keep track of books being read, completed, and planned for the future 📚
              </Link>
            </li>
            <li>
              <Link to="/journal">
                <span>Reflect on personal growth:</span> Journal thoughts, emotions, and milestones with guided prompts 📝
              </Link>
            </li>
            <li>
              <Link to="/">
                <span>Find daily inspiration:</span> Start each day with an uplifting affirmation 💬
              </Link>
            </li>
          </ul>

          <p className={styles.aboutText}>
            More than anything, DreamScape is a reminder that every small step forward is still progress. It empowers you to shape your life at your own pace, in your own way – one dream at a time.
          </p>
          <p className={styles.finalText}>✨ Start building your DreamScape today. 💫</p>
        </div>
      </div>
    </div>
  );
}

export default About;
