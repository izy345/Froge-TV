import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';

/**
 * 
 * A custom hook to manage keyboard focus state while respecting hardware keyboard events.
 * 
 *  @returns {,isFocused, setIsFocused, keyboardOpen}
 */
export default function useKeyboardFocus() {
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const handleKeyboardDidShow = () => {
            setKeyboardOpen(true);
            setIsFocused(true);
        };
        const handleKeyboardDidHide = () => {
            if (keyboardOpen && isFocused) {
                setIsFocused(false);
            }
            setKeyboardOpen(false);
        };

        const showListener = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
        const hideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);

        return () => {
            showListener.remove();
            hideListener.remove();
        };
    }, [keyboardOpen, isFocused]);

    return { isFocused, setIsFocused, keyboardOpen };
}