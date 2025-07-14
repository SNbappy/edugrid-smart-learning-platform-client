import React, { createContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    fetchSignInMethodsForEmail
} from "firebase/auth";
import { app } from '../firebase/firebase.config';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const auth = getAuth(app);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Google provider setup
    const googleProvider = new GoogleAuthProvider();

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    }

    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    }

    // Fixed resetPassword function
    const resetPassword = async (email) => {
        try {
            console.log('Checking user existence for:', email);

            // Check if user exists using fetchSignInMethodsForEmail
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);

            console.log('Sign-in methods found:', signInMethods);

            if (signInMethods.length === 0) {
                console.log('No sign-in methods found - user does not exist');
                throw new Error('auth/user-not-found');
            }

            console.log('User exists, sending password reset email');

            // User exists, send reset email
            const actionCodeSettings = {
                url: 'http://localhost:3000/login', // Update with your domain
                handleCodeInApp: false,
            };

            return sendPasswordResetEmail(auth, email, actionCodeSettings);

        } catch (error) {
            console.error('Password reset error:', error);

            // If it's fetchSignInMethodsForEmail error, user doesn't exist
            if (error.code === 'auth/user-not-found' || error.message === 'auth/user-not-found') {
                throw new Error('auth/user-not-found');
            }

            throw error;
        }
    }

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }

    const updateUserProfile = (name, photo) => {
        return updateProfile(auth.currentUser, {
            displayName: name,
            photoURL: photo
        });
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            console.log('current user', currentUser);
            setLoading(false);
        });
        return () => {
            return unsubscribe();
        }
    }, [])

    const authInfo = {
        user,
        loading,
        createUser,
        signIn,
        signInWithGoogle,
        resetPassword,
        logOut,
        updateUserProfile
    }

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
