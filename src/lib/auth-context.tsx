"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// User role types
export type UserRole = "USER" | "ADMIN";

// Extended user data stored in Firestore
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  username: string;
  role: UserRole;
  emailVerified: boolean;
  collegeVerified: boolean;
  companyVerified: boolean;
  collegeName?: string;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to extract domain info for badge verification
const extractDomainInfo = (email: string) => {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  
  // Check for education domains
  const eduDomains = [".edu", ".ac.in", ".edu.in", ".ac.uk", ".edu.au"];
  const isCollegeEmail = eduDomains.some(ext => domain.endsWith(ext));
  
  // Known company domains (can be expanded)
  const companyDomains: Record<string, string> = {
    "google.com": "Google",
    "microsoft.com": "Microsoft",
    "amazon.com": "Amazon",
    "meta.com": "Meta",
    "apple.com": "Apple",
    "netflix.com": "Netflix",
    "uber.com": "Uber",
    "flipkart.com": "Flipkart",
    "razorpay.com": "Razorpay",
    "phonepe.com": "PhonePe",
    "swiggy.com": "Swiggy",
    "zomato.com": "Zomato",
  };
  
  const companyName = companyDomains[domain];
  
  return {
    isCollegeEmail,
    collegeName: isCollegeEmail ? domain.split(".")[0].toUpperCase() : undefined,
    isCompanyEmail: !!companyName,
    companyName,
  };
};

// Generate a random username
const generateUsername = () => {
  const adjectives = ["Swift", "Bright", "Calm", "Bold", "Keen", "Wise"];
  const nouns = ["Coder", "Dev", "Hacker", "Builder", "Maker", "Creator"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${num}`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: User) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      setUserData({
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserData);
    } else {
      // Create new user document
      const email = firebaseUser.email || "";
      const domainInfo = extractDomainInfo(email);
      
      const newUserData: Omit<UserData, "createdAt" | "updatedAt"> & {
        createdAt: ReturnType<typeof serverTimestamp>;
        updatedAt: ReturnType<typeof serverTimestamp>;
      } = {
        uid: firebaseUser.uid,
        email: email,
        displayName: firebaseUser.displayName,
        username: generateUsername(),
        role: "USER",
        emailVerified: firebaseUser.emailVerified,
        collegeVerified: domainInfo.isCollegeEmail,
        companyVerified: domainInfo.isCompanyEmail,
        collegeName: domainInfo.collegeName,
        companyName: domainInfo.companyName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(userRef, newUserData);
      
      setUserData({
        ...newUserData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserData);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Send email verification if not verified
      if (!result.user.emailVerified) {
        await sendEmailVerification(result.user);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserData(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        signInWithGoogle,
        signOut,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

