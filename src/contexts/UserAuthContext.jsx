import { createContext, useContext, useEffect, useState } from 'react';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const UserAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);

    async function createUser(email, password) {
        // Set persistence to LOCAL before creating user
        await setPersistence(auth, browserLocalPersistence);
        return createUserWithEmailAndPassword(auth, email, password);
    }

    async function signIn(email, password) {
        // Set persistence to LOCAL before signing in
        await setPersistence(auth, browserLocalPersistence);
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        console.log("Auth listener set up");
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
        });
        return () => unsubscribe();
    }, []);

    const value = {
        user,
        loading,
        isNewUser,
        createUser,
        signIn,
        logout
    };

    return (
        <UserAuthContext.Provider value={value}>
            {!loading && children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth() {
    return useContext(UserAuthContext);
} 