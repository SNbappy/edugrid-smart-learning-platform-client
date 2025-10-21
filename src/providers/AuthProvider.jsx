import { createContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebase/firebase.config';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const updateUserProfile = async (name, photoURL = '') => {
        try {
            if (!auth.currentUser) {
                throw new Error('No user is currently signed in');
            }

            await updateProfile(auth.currentUser, {
                displayName: name,
                photoURL: photoURL
            });

            setUser(prevUser => ({
                ...prevUser,
                displayName: name,
                photoURL: photoURL
            }));

            // console.log('User profile updated successfully');
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

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

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    };

    const sendVerificationEmail = async () => {
        try {
            if (!auth.currentUser) {
                throw new Error('No user is currently signed in');
            }
            await sendEmailVerification(auth.currentUser);
            // console.log('✅ Verification email sent successfully');
            return true;
        } catch (error) {
            console.error('❌ Send verification email error:', error);
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // console.log('Auth state changed:', currentUser?.email || 'No user');
            setUser(currentUser);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const authInfo = {
        user,
        loading,
        createUser,
        signIn,
        updateUserProfile,
        logOut,
        resetPassword,
        sendVerificationEmail
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
