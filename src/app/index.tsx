import { useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';

export default function Index() {
    const { user } = useAuthStore();

    useEffect(() => {
        const redirect = async () => {
            if (!user) {
                router.replace('/(auth)/login');
                return;
            }
            const pin = await SecureStore.getItemAsync('app_pin');
            if (pin) {
                router.replace('/(auth)/pin-lock');
            } else {
                router.replace('/(auth)/pin-setup');
            }
        };
        redirect();
    }, []);

    return null; // renders nothing, just redirects
}