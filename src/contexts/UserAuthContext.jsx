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

    async function createUser(email, password) {
        console.log("Setting persistence to LOCAL in createUser");
        try {
            // Set persistence to LOCAL before creating user
            await setPersistence(auth, browserLocalPersistence);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User created successfully with LOCAL persistence");
            return userCredential;
        } catch (error) {
            console.error("Error in createUser:", error);
            throw error;
        }
    }

    async function signIn(email, password) {
        console.log("Setting persistence to LOCAL in signIn");
        try {
            // Set persistence to LOCAL before signing in
            await setPersistence(auth, browserLocalPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("User signed in successfully with LOCAL persistence");
            return userCredential;
        } catch (error) {
            console.error("Error in signIn:", error);
            throw error;
        }
    }

    async function logout() {
        console.log("Logging out user");
        try {
            await signOut(auth);
            console.log("User logged out successfully");
        } catch (error) {
            console.error("Error logging out:", error);
            throw error;
        }
    }

    async function setUserAsNotNew(uid) {
        console.log("Setting user as not new:", uid);
        try {
            const userDocRef = doc(db, "users", uid);
            await updateDoc(userDocRef, {
                isNewUser: false
            });
            setIsNewUser(false);
            console.log("User marked as not new");
        } catch (error) {
            console.error("Error setting user as not new:", error);
        }
    }

    useEffect(() => {
        console.log("Auth listener set up");
        setLoading(true);
        
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("Auth state changed:", currentUser ? currentUser.email : "No user");
            
            if (currentUser) {
                setUser(currentUser);
                
                // Check if user is new from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        console.log("User data fetched:", userDoc.data());
                        setIsNewUser(userDoc.data().isNewUser || false);
                    } else {
                        console.log("No user document found");
                        setIsNewUser(false);
                    }
                } catch (error) {
                    console.error("Error checking if user is new:", error);
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