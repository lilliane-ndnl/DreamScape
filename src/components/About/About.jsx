import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { register } from 'swiper/element/bundle';
import styles from './About.module.css';

// Register Swiper custom elements
register();

function About() {
  const [showBackground, setShowBackground] = useState(false);

  const features = [
    {
      title: "Vision Board",
      description: "Create a personal vision board with images and words that bring aspirations to life",
      icon: "✨",
      path: "/vision-board"
    },
    {
      title: "Journal",
      description: "Reflect on personal growth with guided prompts for thoughts and emotions",
      icon: "📝",
      path: "/journal"
    },
    {
      title: "Goal Tracking",
      description: "Break big dreams into small, actionable steps, track progress, and celebrate wins",
      icon: "📍",
      path: "/goals"
    },
    {
      title: "Habit Building",
      description: "Stay consistent with meaningful routines and build lasting positive habits",
      icon: "🔄",
      path: "/habits"
    },
    {
      title: "Reading List",
      description: "Keep track of books being read, completed, and planned for the future",
      icon: "📚",
      path: "/reading"
    },
    {
      title: "Daily Inspiration",
      description: "Start each day with an uplifting affirmation to boost your motivation",
      icon: "💬",
      path: "/"
    }
  ];

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
          
          <div className={styles.featureSliderContainer}>
            <swiper-container
              slides-per-view="auto"
              centered-slides="true"
              space-between="30"
              grab-cursor="true"
              class={styles.featureSlider}
            >
              {features.map((feature, index) => (
                <swiper-slide key={index}>
                  <Link to={feature.path} className={styles.featureCard}>
                    <div className={styles.featureIcon}>{feature.icon}</div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDescription}>{feature.description}</p>
                  </Link>
                </swiper-slide>
              ))}
            </swiper-container>
          </div>

          <p className={styles.aboutText}>
            More than anything, DreamScape is a reminder that every small step forward is still progress. It empowers you to shape your life at your own pace, in your own way – one dream at a time.
          </p>
          <p className={styles.finalText}>
            <span style={{ color: '#FF69B4' }}>✨</span> 
            Start building your DreamScape today. 
            <span style={{ color: '#FF69B4' }}>💫</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
