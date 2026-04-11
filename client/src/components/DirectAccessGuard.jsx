import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * DirectAccessGuard - Prevents direct access to sensitive pages
 * 
 * Usage: Wrap sensitive routes that should only be accessed
 * through internal navigation (not direct URL entry)
 * 
 * Examples: /checkout, /payment, /hotel/:hotelId
 */
const DirectAccessGuard = ({ children }) => {
    const location = useLocation();
    const [isValidAccess, setIsValidAccess] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // Check if user came from internal navigation
        // location.state will exist if navigated via Link or navigate()
        const hasNavigationState = location.state !== null;
        
        // Also allow if there's a referrer from same origin (client-side check)
        const hasReferrer = document.referrer && document.referrer.includes(window.location.origin);
        
        // Check sessionStorage for a flag set during internal navigation
        const sessionNavFlag = sessionStorage.getItem('internalNavigation');
        
        // Valid if any of these conditions are true
        const valid = hasNavigationState || hasReferrer || sessionNavFlag === 'true';
        
        setIsValidAccess(valid);
        setChecked(true);
        
        // Clean up session flag if it exists
        if (sessionNavFlag) {
            sessionStorage.removeItem('internalNavigation');
        }
    }, [location]);

    // Show nothing while checking to prevent flash
    if (!checked) {
        return null;
    }

    // Redirect to home if accessed directly
    if (!isValidAccess) {
        return <Navigate to="/" replace />;
    }

    return children;
};

/**
 * Helper function to use with navigation
 * Call this before navigating to sensitive pages
 * 
 * Usage: 
 * import { setInternalNavigation } from './components/DirectAccessGuard';
 * 
 * // Before navigating:
 * setInternalNavigation();
 * navigate('/checkout', { state: { fromInternal: true } });
 */
export const setInternalNavigation = () => {
    sessionStorage.setItem('internalNavigation', 'true');
};

export default DirectAccessGuard;
