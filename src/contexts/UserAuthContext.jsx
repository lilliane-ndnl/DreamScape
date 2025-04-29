import { createContext, useContext, useEffect, useState } from 'react';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const UserAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const [error, setError] = useState(null);

    // Retry logic for failed operations
    const retryOperation = async (operation, maxRetries = 3) => {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                console.warn(`Operation failed (attempt ${i + 1}/${maxRetries}):`, error);
                lastError = error;
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
        throw lastError;
    };

    async function createUser(email, password) {
        console.log("Setting persistence to LOCAL in createUser");
        try {
            setError(null);
            // Set persistence to LOCAL before creating user
            await setPersistence(auth, browserLocalPersistence);
            const userCredential = await retryOperation(() => 
                createUserWithEmailAndPassword(auth, email, password)
            );
            console.log("User created successfully with LOCAL persistence");
            return userCredential;
        } catch (error) {
            console.error("Error in createUser:", error);
            setError(error.message);
            throw error;
        }
    }

    async function signIn(email, password) {
        console.log("Setting persistence to LOCAL in signIn");
        try {
            setError(null);
            // Set persistence to LOCAL before signing in
            await setPersistence(auth, browserLocalPersistence);
            const userCredential = await retryOperation(() => 
                signInWithEmailAndPassword(auth, email, password)
            );
            console.log("User signed in successfully with LOCAL persistence");
            return userCredential;
        } catch (error) {
            console.error("Error in signIn:", error);
            setError(error.message);
            throw error;
        }
    }

    async function logout() {
        console.log("Logging out user");
        try {
            setError(null);
            await retryOperation(() => signOut(auth));
            console.log("User logged out successfully");
        } catch (error) {
            console.error("Error logging out:", error);
            setError(error.message);
            throw error;
        }
    }

    async function setUserAsNotNew(uid) {
        console.log("Setting user as not new:", uid);
        try {
            setError(null);
            const userDocRef = doc(db, "users", uid);
            await retryOperation(() => updateDoc(userDocRef, {
                isNewUser: false
            }));
            setIsNewUser(false);
            console.log("User marked as not new");
        } catch (error) {
            console.error("Error setting user as not new:", error);
            setError(error.message);
        }
    }

    useEffect(() => {
        console.log("Auth listener set up");
        setLoading(true);
        setError(null);
        
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("Auth state changed:", currentUser ? currentUser.email : "No user");
            
            if (currentUser) {
                setUser(currentUser);
                
                // Check if user is new from Firestore
                try {
                    const userDoc = await retryOperation(() => 
                        getDoc(doc(db, "users", currentUser.uid))
                    );
                    if (userDoc.exists()) {
                        console.log("User data fetched:", userDoc.data());
                        setIsNewUser(userDoc.data().isNewUser || false);
                    } else {
                        console.log("No user document found");
                        setIsNewUser(false);
                    }
                } catch (error) {
                    console.error("Error checking if user is new:", error);
                    setError(error.message);
                    setIsNewUser(false);
                }
            } else {
                setUser(null);
                setIsNewUser(false);
            }
            
            setLoading(false);
            setAuthReady(true);
        });
        
        return () => {
            console.log("Unsubscribing from auth listener");
            unsubscribe();
        };
    }, []);

    const value = {
        user,
        loading,
        isNewUser,
        authReady,
        error,
        createUser,
        signIn,
        logout,
        setUserAsNotNew
    };

    return (
        <UserAuthContext.Provider value={value}>
            {children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth() {
    return useContext(UserAuthContext);
} 