"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase-config";

/**
 * A custom hook to manage user authentication and session data.
 * It centralizes logic for logging in, logging out, fetching user profiles,
 * and handling role-based page access.
 */
export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to log the user out
  const logout = useCallback(() => {
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
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    setRole(userRole);

    let userProfile = null;
    try {
        if (userRole === "customer" && userId) {
            const docRef = doc(db, "customers", userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                userProfile = docSnap.data();
                // Cache profile in local storage for faster loads
                localStorage.setItem("customerProfile", JSON.stringify(userProfile));
            }
        } else if (userRole === "admin") {
            // Admin profile is static for this app
            userProfile = JSON.parse(localStorage.getItem('adminProfile')) || { fullName: "Admin User", username: "admin", email: "admin@gason.com" };
        }
    } catch(e) {
        console.error("Failed to fetch user profile:", e);
        // If there's an error (e.g., network), log out to be safe
        logout();
    }
    
    setUser(userProfile);

    // Page access rules based on role
    const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
    if (!userRole && !isAuthPage) {
      // If not logged in and not on an auth page, redirect to login
      router.push("/login");
    } else if (userRole === "customer" && pathname.startsWith("/admin")) {
      // Customers cannot access admin pages
      router.push("/");
    } else if (userRole === "admin" && !pathname.startsWith("/admin") && pathname !== '/profile') {
      // Admins are redirected to their dashboard from customer pages
      router.push("/admin");
    }

    setIsLoading(false);
  }, [pathname, router, logout]);


  useEffect(() => {
    // Load user data on initial component mount and on route changes.
    loadUserAndVerifyAuth();

    // Also reload data if profile is updated elsewhere in the app.
    const handleProfileUpdate = () => loadUserAndVerifyAuth();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [pathname, loadUserAndVerifyAuth]); // Rerun when path changes

  return { user, role, logout, isLoading };
}
