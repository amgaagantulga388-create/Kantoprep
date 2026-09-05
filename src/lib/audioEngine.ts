// Pure Web Audio API Ambient Sound Engine for KantoPrep Focus Sprints
// Zero external audio files required — 100% synthesized in-browser.

export type SoundType = 'rain' | 'library' | 'cafe' | 'off';

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private activeSound: SoundType = 'off';
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create 5-second loopable noise buffer
  private createNoiseBuffer(type: 'brown' | 'pink' | 'cafe'): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not initialized');
    const bufferSize = this.ctx.sampleRate * 5; // 5 seconds
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    if (type === 'brown') {
      // Brown noise: warm, deep rumble ideal for quiet library atmosphere
      let lastL = 0.0;
      let lastR = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        const whiteR = Math.random() * 2 - 1;
        lastL = (lastL + 0.02 * whiteL) / 1.02;
        lastR = (lastR + 0.02 * whiteR) / 1.02;
        left[i] = lastL * 3.5;
        right[i] = lastR * 3.5;
      }
    } else if (type === 'pink') {
      // Pink noise: balanced 1/f noise perfect for rainfall
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const sample = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
        left[i] = sample;
        right[i] = sample * (0.85 + Math.random() * 0.3); // slight stereo variance
      }
    } else {
      // Cafe ambience: warm low-pass murmur with subtle modulation
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.04 * white) / 1.04;
        const modulation = Math.sin(i / 12000) * 0.15 + 1;
        left[i] = last * 2.2 * modulation;
        right[i] = last * 2.2 * (Math.cos(i / 15000) * 0.15 + 1);
      }
    }
    return buffer;
  }

  public play(sound: SoundType, volume: number = 0.5) {
    if (typeof window === 'undefined') return;
    this.stop();

    if (sound === 'off') {
      this.activeSound = 'off';
      return;
    }

    try {
      this.initContext();
      if (!this.ctx) return;

      this.volume = volume;
      this.activeSound = sound;

      const bufferType = sound === 'rain' ? 'pink' : sound === 'library' ? 'brown' : 'cafe';
      const buffer = this.createNoiseBuffer(bufferType);

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      // Filter to soften the acoustics
      const filter = this.ctx.createBiquadFilter();
      if (sound === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 1400; // gentle patter of raindrops
      } else if (sound === 'library') {
        filter.type = 'lowpass';
        filter.frequency.value = 550; // deep, velvety silent library rumble
      } else {
        filter.type = 'bandpass';
        filter.frequency.value = 750;
        filter.Q.value = 0.8;
      }

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.01, volume * 0.4), this.ctx.currentTime + 0.8);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      source.start();
      this.currentSource = source;
      this.gainNode = gain;
    } catch {
      this.activeSound = 'off';
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
    }
  }

  public stop() {
    if (this.currentSource) {
      try {
        if (this.gainNode && this.ctx) {
          this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
          this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
        }
        setTimeout(() => {
          try {
            (this.currentSource as AudioBufferSourceNode)?.stop();
            this.currentSource?.disconnect();
            this.currentSource = null;
          } catch {
            // Already stopped
          }
        }, 300);
      } catch {
        this.currentSource = null;
      }
    }
    this.activeSound = 'off';
  }

  public getActiveSound(): SoundType {
    return this.activeSound;
  }
}

export const ambientAudio = new AmbientSoundEngine();
