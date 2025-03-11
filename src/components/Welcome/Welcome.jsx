import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from 'swiper/element/bundle';
import Confetti from 'react-confetti';
import styles from './Welcome.module.css';
import { useUserAuth } from '../../contexts/UserAuthContext';

// Register Swiper custom elements
register();

function Welcome() {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const navigate = useNavigate();
  const { user, setUserAsNotNew } = useUserAuth();

  const features = [
    {
      title: "Dashboard",
      description: "Track your DreamScape progress, get daily motivation, and see your growth journey unfold. Your personal command center for dreams and goals.",
      icon: "🎯",
      path: "/dashboard"
    },
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
    }
  ];

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // Stop confetti after 8 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 8000);

    // Mark user as not new after they've seen the welcome page
    const markUserTimer = setTimeout(() => {
      if (user && user.uid) {
        console.log("Marking user as not new after welcome page view");
        setUserAsNotNew(user.uid);
      }
    }, 10000); // Give them time to see the welcome page

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      clearTimeout(markUserTimer);
    };
  }, [user, setUserAsNotNew]);

  const handleContinueToDashboard = () => {
    if (user && user.uid) {
      setUserAsNotNew(user.uid);
    }
    navigate('/dashboard');
  };

  return (
    <div className={styles.welcomeContainer}>
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={true}
          numberOfPieces={200}
          colors={['#ffb3c1', '#ffd6e0', '#6B85A1', '#532e3b', '#f79f9f']}
        />
      )}

      <div className={styles.welcomeContent}>
        <div className={styles.logoContainer}>
          <img src="/images/dreamscape-logo.png" alt="DreamScape" className={styles.welcomeLogo} />
        </div>

        <div className={styles.messageContainer}>
          <p className={styles.welcomeMessage}>
            You've just stepped into a space designed just for you—a place where dreams take shape, 
            reflections find meaning, and small steps lead to big changes.
          </p>
          
          <p className={styles.welcomeMessage}>
            Whether you're here to gain clarity, build new habits, or simply carve out a moment of peace 
            in your day, DreamScape is your personal sanctuary. There's no rush, no pressure—just a 
            gentle invitation to grow at your own pace.
          </p>

          <h2 className={styles.exploreTitle}>Let's explore what you can do in DreamScape:</h2>
        </div>

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

        <div className={styles.footerMessage}>
          <p className={styles.reminder}>
            🌿 Remember: Growth isn't about being perfect—it's about showing up for yourself, 
            one reflection at a time.
          </p>
          <p className={styles.finalMessage}>
            Take a deep breath. This is your space. 
            <span className={styles.sparkle}>✨</span> 
            Start building your DreamScape today. 
            <span className={styles.sparkle}>💫</span>
          </p>
          
          <button onClick={handleContinueToDashboard} className={styles.dashboardButton}>
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Welcome; 