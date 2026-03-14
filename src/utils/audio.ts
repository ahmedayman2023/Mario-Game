export const playChime = async (type: 'start' | 'complete' | 'mandatory', volume: number = 0.5) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const context = new AudioContext();
    
    // Resume context if suspended (browser restriction)
    if (context.state === 'suspended') {
      await context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    const now = context.currentTime;
    // Base gain multiplier - the original values were very low (0.1 max)
    // We'll scale the user's 0-1 volume to a reasonable range.
    const masterGain = volume;

    if (type === 'start') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, now);
      oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gainNode.gain.setValueAtTime(0.2 * masterGain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } else if (type === 'complete') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(523.25, now); // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gainNode.gain.setValueAtTime(0.3 * masterGain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      oscillator.start(now);
      oscillator.stop(now + 0.4);
    } else if (type === 'mandatory') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(220, now);
      gainNode.gain.setValueAtTime(0.15 * masterGain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    }
  } catch (e) {
    console.warn("Audio chime failed", e);
  }
};
