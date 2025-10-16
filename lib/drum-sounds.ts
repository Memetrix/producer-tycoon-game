/**
 * Drum Sound Synthesizer using Web Audio API
 * Generates realistic drum sounds without external audio files
 */

export class DrumSynthesizer {
  private audioContext: AudioContext | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  async init() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume()
    }
  }

  /**
   * Kick Drum - Deep bass thump
   */
  playKick() {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const duration = 0.5

    // Oscillator for the punch
    const osc = this.audioContext.createOscillator()
    const oscGain = this.audioContext.createGain()

    osc.connect(oscGain)
    oscGain.connect(this.audioContext.destination)

    // Start high and pitch down for kick punch
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.05)
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.1)

    // Volume envelope
    oscGain.gain.setValueAtTime(1, now)
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    osc.start(now)
    osc.stop(now + duration)

    // Add noise for texture
    const noise = this.createNoise(0.05)
    if (noise) {
      const noiseGain = this.audioContext.createGain()
      noise.connect(noiseGain)
      noiseGain.connect(this.audioContext.destination)

      noiseGain.gain.setValueAtTime(0.3, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)

      noise.start(now)
      noise.stop(now + 0.05)
    }
  }

  /**
   * Snare Drum - Sharp crack with noise
   */
  playSnare() {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const duration = 0.2

    // Tone component (two oscillators for body)
    const osc1 = this.audioContext.createOscillator()
    const osc2 = this.audioContext.createOscillator()
    const oscGain = this.audioContext.createGain()

    osc1.type = "triangle"
    osc2.type = "triangle"

    osc1.frequency.setValueAtTime(180, now)
    osc2.frequency.setValueAtTime(330, now)

    osc1.connect(oscGain)
    osc2.connect(oscGain)
    oscGain.connect(this.audioContext.destination)

    oscGain.gain.setValueAtTime(0.3, now)
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + duration)
    osc2.stop(now + duration)

    // Noise component (snare rattle)
    const noise = this.createNoise(duration)
    if (noise) {
      const noiseFilter = this.audioContext.createBiquadFilter()
      const noiseGain = this.audioContext.createGain()

      noiseFilter.type = "highpass"
      noiseFilter.frequency.setValueAtTime(1000, now)

      noise.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(this.audioContext.destination)

      noiseGain.gain.setValueAtTime(1, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration)

      noise.start(now)
      noise.stop(now + duration)
    }
  }

  /**
   * Hi-Hat - Crisp metallic sound
   */
  playHiHat() {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const duration = 0.1

    // Use multiple oscillators for metallic sound
    const fundamental = 40
    const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21]

    const gainNode = this.audioContext.createGain()
    gainNode.connect(this.audioContext.destination)

    ratios.forEach((ratio) => {
      const osc = this.audioContext!.createOscillator()
      osc.type = "square"
      osc.frequency.setValueAtTime(fundamental * ratio, now)
      osc.connect(gainNode)
      osc.start(now)
      osc.stop(now + duration)
    })

    // High-pass filter for brightness
    const filter = this.audioContext.createBiquadFilter()
    filter.type = "highpass"
    filter.frequency.setValueAtTime(7000, now)

    const filterGain = this.audioContext.createGain()
    gainNode.connect(filter)
    filter.connect(filterGain)
    filterGain.connect(this.audioContext.destination)

    // Volume envelope - quick attack and decay
    gainNode.gain.setValueAtTime(0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)
  }

  /**
   * Tom - Mid-pitched drum
   */
  playTom() {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const duration = 0.3

    const osc = this.audioContext.createOscillator()
    const oscGain = this.audioContext.createGain()

    osc.type = "sine"
    osc.connect(oscGain)
    oscGain.connect(this.audioContext.destination)

    // Tom pitch sweep
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.08)
    osc.frequency.exponentialRampToValueAtTime(80, now + duration)

    // Volume envelope
    oscGain.gain.setValueAtTime(0.8, now)
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    osc.start(now)
    osc.stop(now + duration)

    // Add slight noise for texture
    const noise = this.createNoise(0.05)
    if (noise) {
      const noiseGain = this.audioContext.createGain()
      noise.connect(noiseGain)
      noiseGain.connect(this.audioContext.destination)

      noiseGain.gain.setValueAtTime(0.2, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)

      noise.start(now)
      noise.stop(now + 0.05)
    }
  }

  /**
   * Play sound by name
   */
  play(sound: string) {
    switch (sound.toLowerCase()) {
      case "kick":
      case "d":
        this.playKick()
        break
      case "snare":
      case "f":
        this.playSnare()
        break
      case "hihat":
      case "hat":
      case "j":
        this.playHiHat()
        break
      case "tom":
      case "k":
        this.playTom()
        break
      default:
        console.warn("[DrumSynth] Unknown sound:", sound)
    }
  }

  /**
   * Create white noise buffer
   */
  private createNoise(duration: number): AudioBufferSourceNode | null {
    if (!this.audioContext) return null

    const bufferSize = this.audioContext.sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = this.audioContext.createBufferSource()
    noise.buffer = buffer
    return noise
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close()
    }
  }
}
