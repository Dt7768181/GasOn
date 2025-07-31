"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "../../firebase-config.js";

interface UserProfile extends DocumentData {
  fullName: string;
  email: string;
  phone?: string;
  username?: string;
}

/**
 * A custom hook to manage user authentication and session data.
 * It centralizes logic for logging in, logging out, fetching user profiles,
 * and handling role-based page access.
 */
export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to log the user out
  const logout = useCallback(() => {
    if (typeof window === "undefined") return;

    const userRole = localStorage.getItem("userRole");
    
    // Clear all session data
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("customerProfile");
    localStorage.removeItem("adminProfile");

    // Reset state and redirect to the appropriate login page
    setUser(null);
    setRole(null);
    if (userRole === "admin") {
      router.push("/admin/login");
    } else {
      router.push("/login");
    }
  }, [router]);
  
  // This function is the single source of truth for loading user data and enforcing auth rules.
  const loadUserAndVerifyAuth = useCallback(async () => {
    setIsLoading(true);
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    };

    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    setRole(userRole);

    let userProfile: UserProfile | null = null;
    try {
        if (userRole === "customer" && userId) {
            const cachedProfile = localStorage.getItem("customerProfile");
            if (cachedProfile) {
                userProfile = JSON.parse(cachedProfile);
            } else {
                const docRef = doc(db, "customers", userId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    userProfile = docSnap.data() as UserProfile;
                    localStorage.setItem("customerProfile", JSON.stringify(userProfile));
                }
            }
        } else if (userRole === "admin") {
            // Admin profile is static for this app
            const cachedAdminProfile = localStorage.getItem('adminProfile');
            userProfile = cachedAdminProfile ? JSON.parse(cachedAdminProfile) : { fullName: "Admin User", username: "admin", email: "admin@gason.com" };
        }
    } catch(e) {
        console.error("Failed to fetch user profile:", e);
        logout(); // Logout on error to be safe
    }
    
    setUser(userProfile);

    // Page access rules based on role
    const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
    if (!userRole && !isAuthPage) {
      router.push("/login");
    } else if (userRole === "customer" && pathname.startsWith("/admin")) {
      router.push("/");
    } else if (userRole === "admin" && !pathname.startsWith("/admin") && pathname !== '/profile') {
      router.push("/admin");
    }

    setIsLoading(false);
  }, [pathname, router, logout]);


  useEffect(() => {
    loadUserAndVerifyAuth();

    const handleProfileUpdate = () => loadUserAndVerifyAuth();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [pathname, loadUserAndVerifyAuth]); // Rerun on path changes

  return { user, role, logout, isLoading };
}
