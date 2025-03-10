import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  async function signup(email, password) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(firestore, 'users', result.user.uid), {
        email: result.user.email,
        createdAt: new Date().toISOString(),
        isNewUser: true
      });
      
      setIsNewUser(true);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is new
      const userDoc = await getDoc(doc(firestore, 'users', result.user.uid));
      if (userDoc.exists()) {
        setIsNewUser(userDoc.data().isNewUser || false);
        
        // If user was new, update the flag
        if (userDoc.data().isNewUser) {
          await setDoc(doc(firestore, 'users', result.user.uid), {
            ...userDoc.data(),
            isNewUser: false
          });
        }
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          setIsNewUser(userDoc.data().isNewUser || false);
        }
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isNewUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 