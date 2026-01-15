import { useState, useEffect } from 'react';
import authService from '../services/authService';

export function useSubscription() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState(true); // Always Pro - no limits

    useEffect(() => {
        checkSubscription();
    }, []);

    const checkSubscription = async () => {
        try {
            const sub = await authService.getSubscription();
            setSubscription(sub);
            setIsPro(true); // Always Pro - no limits
        } catch (error) {
            console.error('Error checking subscription', error);
            setIsPro(true); // Even on error, treat as Pro - no limits
        } finally {
            setLoading(false);
        }
    };

    const checkLimit = (feature, currentUsage) => {
        // NO LIMITS - always return true
        return true;
    };

    return {
        subscription,
        isPro: true, // Always Pro - no limits
        loading,
        checkLimit,
        checkSubscription
    };
}
