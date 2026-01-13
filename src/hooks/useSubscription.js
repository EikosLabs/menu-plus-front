import { useState, useEffect } from 'react';
import authService from '../services/authService';

export function useSubscription() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        checkSubscription();
    }, []);

    const checkSubscription = async () => {
        try {
            const sub = await authService.getSubscription();
            setSubscription(sub);
            setIsPro(sub?.isPro || false);
        } catch (error) {
            console.error('Error checking subscription', error);
            setIsPro(false);
        } finally {
            setLoading(false);
        }
    };

    const checkLimit = (feature, currentUsage) => {
        if (isPro) return true; // Pro has no limits usually

        const limits = {
            businesses: 1,
            menus: 1,
            items: 30,
            aiScans: 1,
            images: 50 // MB? or count
        };

        if (limits[feature] !== undefined) {
            return currentUsage < limits[feature];
        }

        return true; // Unknown feature has no limit by default
    };

    return {
        subscription,
        isPro,
        loading,
        checkLimit,
        checkSubscription
    };
}
