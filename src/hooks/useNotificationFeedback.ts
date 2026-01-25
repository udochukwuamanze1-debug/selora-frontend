import { useCallback, useRef } from "react";

// Create a simple notification sound using Web Audio API
const createNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Pleasant notification tone
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1); // C#6
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2); // A5
    
    oscillator.type = "sine";
    
    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    return true;
  } catch (error) {
    console.warn("Could not play notification sound:", error);
    return false;
  }
};

// Vibration pattern for notifications
const vibrateDevice = () => {
  try {
    if ("vibrate" in navigator) {
      // Short double vibration pattern
      navigator.vibrate([100, 50, 100]);
      return true;
    }
  } catch (error) {
    console.warn("Vibration not supported:", error);
  }
  return false;
};

export function useNotificationFeedback() {
  const lastFeedbackTime = useRef(0);
  const soundEnabled = useRef(true);
  const vibrationEnabled = useRef(true);

  // Load preferences from localStorage
  const loadPreferences = useCallback(() => {
    soundEnabled.current = localStorage.getItem("selora_notification_sound") !== "false";
    vibrationEnabled.current = localStorage.getItem("selora_notification_vibration") !== "false";
  }, []);

  const triggerFeedback = useCallback(() => {
    loadPreferences();
    
    // Debounce to prevent multiple rapid triggers
    const now = Date.now();
    if (now - lastFeedbackTime.current < 1000) {
      return;
    }
    lastFeedbackTime.current = now;

    // Play sound if enabled
    if (soundEnabled.current) {
      createNotificationSound();
    }

    // Vibrate if enabled and on mobile
    if (vibrationEnabled.current) {
      vibrateDevice();
    }
  }, [loadPreferences]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundEnabled.current = enabled;
    localStorage.setItem("selora_notification_sound", enabled.toString());
  }, []);

  const setVibrationEnabled = useCallback((enabled: boolean) => {
    vibrationEnabled.current = enabled;
    localStorage.setItem("selora_notification_vibration", enabled.toString());
  }, []);

  const testFeedback = useCallback(() => {
    createNotificationSound();
    vibrateDevice();
  }, []);

  return {
    triggerFeedback,
    setSoundEnabled,
    setVibrationEnabled,
    testFeedback,
    isSoundEnabled: () => localStorage.getItem("selora_notification_sound") !== "false",
    isVibrationEnabled: () => localStorage.getItem("selora_notification_vibration") !== "false",
  };
}
