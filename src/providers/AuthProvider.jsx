import { createContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase/firebase.config'; // Adjust path as needed

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Google Auth Provider
    const googleProvider = new GoogleAuthProvider();

    // Configure Google provider for better user experience
    googleProvider.setCustomParameters({
        prompt: 'select_account'
    });

    // Create user with email and password
    const createUser = async (email, password) => {
        setLoading(true);
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            return result;
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Sign in with email and password
    const signIn = async (email, password) => {
        setLoading(true);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);

            // Validate the result
            if (!result || !result.user) {
                throw new Error('Google sign-in failed - no user data received');
            }

            if (!result.user.email) {
                throw new Error('Google sign-in failed - no email provided');
            }

            console.log('Google sign-in successful:', result.user);
            return result;
        } catch (error) {
            console.error('Google sign-in error:', error);

            // Handle specific Google Auth errors
            if (error.code === 'auth/popup-closed-by-user') {
                throw new Error('Sign-in was cancelled. Please try again.');
            } else if (error.code === 'auth/popup-blocked') {
                throw new Error('Popup was blocked by browser. Please allow popups and try again.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                throw new Error('Sign-in request was cancelled. Please try again.');
            } else if (error.code === 'auth/network-request-failed') {
                throw new Error('Network error. Please check your connection and try again.');
            } else if (error.code === 'auth/internal-error') {
                throw new Error('An internal error occurred. Please try again later.');
            }

            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Update user profile
    const updateUserProfile = async (name, photoURL = '') => {
        try {
            if (!auth.currentUser) {
                throw new Error('No user is currently signed in');
            }

            await updateProfile(auth.currentUser, {
                displayName: name,
                photoURL: photoURL
            });

            // Update local user state
            setUser(prevUser => ({
                ...prevUser,
                displayName: name,
                photoURL: photoURL
            }));

            console.log('User profile updated successfully');
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

    // Sign out
    const logOut = async () => {
        setLoading(true);
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Reset password
    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    };

    // Monitor auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('Auth state changed:', currentUser?.email || 'No user');
            setUser(currentUser);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Auth info object
    const authInfo = {
        user,
        loading,
        createUser,
        signIn,
        signInWithGoogle,
        updateUserProfile,
        logOut,
        resetPassword
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
