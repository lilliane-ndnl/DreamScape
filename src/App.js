import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Journal from './components/Journal/Journal';
import VisionBoard from './components/VisionBoard/VisionBoard';
import About from './components/About/About';
import Footer from './components/Footer/Footer';
import Sidebar from './components/SideBar/SideBar';
import GuestDashboard from './components/Dashboard/GuestDashboard';
import LoggedInDashboard from './components/Dashboard/LoggedInDashboard';
import GoalList from './components/GoalList/GoalList';
import HabitList from './components/HabitList/HabitList';
import ReadingList from './components/ReadingList/ReadingList';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import AuthLanding from './components/Auth/AuthLanding';
import { UserAuthContextProvider, useUserAuth } from './contexts/UserAuthContext';
import './App.css';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', margin: '20px', border: '1px solid #f5c6cb', backgroundColor: '#f8d7da', color: '#721c24' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>View error details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ 
              marginTop: '20px', 
              padding: '10px 15px', 
              backgroundColor: '#721c24', 
              color: 'white', 
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Go to Home Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '5px solid rgba(255, 141, 161, 0.3)',
      borderRadius: '50%',
      borderTop: '5px solid #ff8da1',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ marginTop: '20px', color: '#532e3b' }}>Loading DreamScape...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Private route component
const PrivateRoute = ({ element }) => {
  const { user, loading } = useUserAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  console.log("PrivateRoute check:", { user: !!user, loading });
  return user ? element : <Navigate to="/login" replace />;
};

function AppContent() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { user, loading } = useUserAuth();

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.pageYOffset / totalHeight) * 100;
      setProgress(progress);
      
      // Show/hide button based on scroll position
      setIsVisible(window.pageYOffset > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Add logging to check auth state
  console.log('AppContent: Rendering with auth state:', { 
    isAuthenticated: !!user,
    userExists: user ? 'Yes' : 'No',
    loading
  });

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <div className="App">
      <Sidebar />
      
      <div className="appContent">
        <nav className="topNav">
          <div className="navLinks">
            <Link to="/vision-board">Vision Board</Link>
            <Link to="/journal">Journal</Link>
            {!user && <Link to="/auth" className="joinButton">Join Us</Link>}
            {user && <Link to="/dashboard" className="dashboardButton">Dashboard</Link>}
            <Link to="/about">About</Link>
          </div>
          <Link to="/" className="logoLink">
            <img src="/images/dreamscape-logo.png" alt="DreamScape" className="logo" />
          </Link>
        </nav>

        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={user ? <LoggedInDashboard /> : <GuestDashboard />} />
              <Route path="/dashboard" element={<PrivateRoute element={<LoggedInDashboard />} />} />
              <Route path="/vision-board" element={<VisionBoard />} />
              <Route path="/goals" element={<PrivateRoute element={<GoalList />} />} />
              <Route path="/habits" element={<PrivateRoute element={<HabitList />} />} />
              <Route path="/reading" element={<PrivateRoute element={<ReadingList />} />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthLanding />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
              <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <h2>Page Not Found</h2>
                  <p>The page you are looking for doesn't exist.</p>
                  <Link to="/" style={{ color: '#ff8da1', textDecoration: 'none' }}>Go to Home</Link>
                </div>
              } />
            </Routes>
          </Suspense>
        </ErrorBoundary>

        <Footer />

        <div className={`progress-wrap ${isVisible ? 'active-progress' : ''}`} onClick={scrollToTop}>
          <svg className="progress-circle" width="100%" height="100%" viewBox="-1 -1 102 102">
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"/>
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" 
                  style={{strokeDashoffset: `${316 - (316 * progress) / 100}`}}/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserAuthContextProvider>
      <AppContent />
    </UserAuthContextProvider>
  );
}

export default App;