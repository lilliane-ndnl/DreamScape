 # DreamScape: Your Personal Growth Companion
 
 ## Overview
 
 DreamScape is a web application designed to help you visualize your dreams, set achievable goals, track your progress, cultivate positive habits, and reflect on your journey.  It combines a customizable vision board, a SMART goal-setting system, a prompted reflection journal (with mood tracking), a habit tracker, a reading list manager, and daily affirmations – all in one place.  DreamScape is built with React and Firebase, providing a responsive and engaging user experience.
 
 This project was created by Lilliane Nguyen as a personal project, drawing inspiration from personal experiences and a desire to create a tool for self-improvement and reflection.
 
 ## Features
 
 *   **Vision Board:**
     *   Create a dynamic digital vision board with images (upload and URL support) and text.
     *   Drag-and-drop functionality for easy customization.
     *   Persistence of layout and content.
 
 *   **Goal Setting:**
     *   Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound).
     *   Break down goals into actionable steps.
     *   Track progress with visual indicators.
     *   Edit and delete goals/steps.
 
 *   **Reflection Journal:**
     *   Write journal entries with a clean, distraction-free interface.
     *   Guided writing prompts to encourage reflection.
     *   Track your mood with an interactive mood slider.
     *   View past entries with date/time stamps.
     *   Delete entries.
 
 *   **Habit Tracker:**
     *   Track daily or weekly habits.
     *   Mark habits as complete.
     *   Visualize streaks (consecutive days of completion).
     *   Delete habits
 
 *   **Reading List:**
     *   Organize books into "Want to Read," "Currently Reading," and "Finished" lists.
     *   Add book cover images (via URL).
     *   Add links to Goodreads pages.
     *   Track reading progress.
     *   Add and manage favorite quotes from books.
     *   Add rating and review for finished books.
 
 *   **Daily Affirmations (Dashboard):**
     *   Receive a new daily affirmation.
     *   (Future: Customize affirmations.)
 
 *   **User Authentication:**
     *   Secure signup and login using Firebase Authentication (email/password).
 
 *   **Data Persistence:**
     *   User data (vision board, goals, journal entries, habits, reading list, profile information) is stored securely using Firebase Firestore.
     *   Data persists across sessions and devices (after login).
 
 *   **Responsive Design:** The application is fully responsive and works well on desktop, tablet, and mobile devices.
 
 *   **Sidebar Navigation:** Easy navigation between different sections of the app.
 
 ## Technologies Used
 
 *   **Frontend:**
     *   React (with Create React App)
     *   React Router (`react-router-dom`) for client-side routing.
     *   @dnd-kit/core and @dnd-kit/sortable for drag-and-drop functionality.
     *   CSS Modules for component-scoped styling.
 
 *   **Backend:**
     *   Firebase Authentication (for user accounts)
     *   Firebase Cloud Firestore (for NoSQL database)
     *   Firebase Cloud Storage (if you implement profile picture uploads, mention it here)
 
 * **Deployment**
     * Netlify
 
 ## Usage
 
 1. **Sign Up/Log In:** If not logged, Sign up for a new account or log in with an existing account.
 2. Explore the app.
 
 ## Contributing
 
 Currently, contributions are not being accepted, as this is a personal project. 
 
 ## License
 
 Copyright © 2024 Lilliane Nguyen. All rights reserved.
 
 This project is not open source.
 
 ## Future Enhancements
 
 *   User profiles with customizable settings.
 *   Advanced goal-setting features (recurring goals, sub-goals).
 *   Improved journal prompts and organization.
 *   Integration with external services (calendar, music).
 *   Mobile app version (potential future development).
 *   ...
