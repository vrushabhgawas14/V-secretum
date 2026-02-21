// src/app/(main)/add-password.tsx
import { useLocalSearchParams } from 'expo-router';

export default function AddPasswordScreen() {
    const { entryId } = useLocalSearchParams<{ entryId?: string }>();
    // if entryId exists, it's edit mode
}