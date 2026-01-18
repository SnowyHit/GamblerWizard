
class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setEnabled(val: boolean) {
    this.enabled = val;
    if (val && this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playClick() { this.playTone(400, 'square', 0.1, 0.05); }
  playDice() { this.playTone(150, 'sawtooth', 0.15, 0.05); }
  playLevelUp() {
    this.playTone(440, 'sine', 0.2, 0.1);
    setTimeout(() => this.playTone(880, 'sine', 0.4, 0.1), 100);
  }
  playHit() { this.playTone(100, 'sawtooth', 0.2, 0.15); }
  playSpell() { this.playTone(600, 'square', 0.3, 0.05); }
  playGold() { this.playTone(1200, 'sine', 0.05, 0.05); }
  playHeal() { this.playTone(800, 'triangle', 0.4, 0.1); }
}

export const soundManager = new SoundManager();
