import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();
  console.log(location.pathname, isAuthenticated);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAuthChecked(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking authentication
  if (!isAuthChecked) {
    return <div>Loading authentication...</div>;
  }

  if (location.pathname === "/shop/phonepe-return" && !location.search.includes('transactionId')) {
    return <Navigate to="/shop/payment-failed" />;
  }

  // Special case for PhonePe return page
  if (location.pathname === "/shop/phonepe-return") {
    return children; // Allow access even if not authenticated yet
  }

  if (location.pathname === "/") {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" />;
    } else {
      return user?.role === "admin" 
        ? <Navigate to="/admin/dashboard" /> 
        : <Navigate to="/shop/home" />;
    }
  }

  if (!isAuthenticated && !["/login", "/register"].some(path => location.pathname.includes(path))) {
    // Preserve intended redirect for post-payment login
    const redirect = location.pathname.startsWith("/shop/phonepe-return")
      ? "/shop/phonepe-return"
      : location.pathname;
    
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(redirect)}`} />;
  }

  if (
    isAuthenticated &&
    (location.pathname.includes("/login") ||
      location.pathname.includes("/register"))
  ) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/shop/home" />;
    }
  }

  if (
    isAuthenticated &&
    user?.role !== "admin" &&
    location.pathname.includes("admin")
  ) {
    return <Navigate to="/unauth-page" />;
  }

  if (
    isAuthenticated &&
    user?.role === "admin" &&
    location.pathname.includes("shop")
  ) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <>{children}</>;
}

export default CheckAuth;
