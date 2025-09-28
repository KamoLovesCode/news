// TTS Service interfaces
export interface TTSVoice {
    id: string;
    name: string;
    gender?: string;
    age?: string;
}

export interface TTSRequest {
    text: string;
    voice?: string;
    speed?: number;
    engine?: 'pyttsx3' | 'gtts' | 'webspeech';
}

export interface TTSResponse {
    audio_url: string;
    file_id: string;
}

export interface TTSConfig {
    engine: 'pyttsx3' | 'gtts' | 'webspeech';
    voice: string;
    speed: number;
    volume: number;
    autoCleanup: boolean;
}

export enum TTSStatus {
    IDLE = 'idle',
    LOADING = 'loading',
    PLAYING = 'playing',
    PAUSED = 'paused',
    ERROR = 'error'
}

export class TTSService {
    private readonly serverUrl: string;
    private currentAudio: HTMLAudioElement | null = null;
    private currentFileId: string | null = null;
    private status: TTSStatus = TTSStatus.IDLE;
    private listeners: Map<string, Function[]> = new Map();
    private config: TTSConfig;

    constructor(serverUrl: string = 'http://localhost:8000') {
        this.serverUrl = serverUrl;
        this.config = this.loadConfig();
        this.setupAudioEventListeners();
    }

    // Event handling
    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    off(event: string, callback: Function) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    private emit(event: string, data?: any) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    // Configuration management
    private loadConfig(): TTSConfig {
        try {
            const saved = localStorage.getItem('tts-config');
            if (saved) {
                return { ...this.getDefaultConfig(), ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load TTS config:', error);
        }
        return this.getDefaultConfig();
    }

    private getDefaultConfig(): TTSConfig {
        return {
            engine: 'pyttsx3',
            voice: 'default',
            speed: 1.0,
            volume: 0.8,
            autoCleanup: true
        };
    }

    private saveConfig() {
        try {
            localStorage.setItem('tts-config', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Failed to save TTS config:', error);
        }
    }

    // Public configuration methods
    getConfig(): TTSConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<TTSConfig>) {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
        this.emit('configChanged', this.config);
    }

    // Server health and voices
    async checkServerHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.serverUrl}/health`);
            return response.ok;
        } catch (error) {
            console.warn('TTS server health check failed:', error);
            return false;
        }
    }

    async getVoices(): Promise<TTSVoice[]> {
        try {
            const response = await fetch(`${this.serverUrl}/voices`);
            if (!response.ok) {
                throw new Error(`Failed to fetch voices: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to get voices:', error);
            // Return web speech voices as fallback
            return this.getWebSpeechVoices();
        }
    }

    private getWebSpeechVoices(): TTSVoice[] {
        if ('speechSynthesis' in window) {
            const voices = speechSynthesis.getVoices();
            return voices.map((voice, index) => ({
                id: index.toString(),
                name: voice.name,
                gender: voice.lang.includes('female') ? 'female' : 'male'
            }));
        }
        return [];
    }

    // Audio setup
    private setupAudioEventListeners() {
        // We'll set up event listeners when audio is created
    }

    private createAudioElement(src: string): HTMLAudioElement {
        const audio = new Audio(src);
        audio.volume = this.config.volume;

        audio.addEventListener('loadstart', () => {
            this.setStatus(TTSStatus.LOADING);
        });

        audio.addEventListener('canplay', () => {
            if (this.status === TTSStatus.LOADING) {
                this.setStatus(TTSStatus.IDLE);
            }
        });

        audio.addEventListener('play', () => {
            this.setStatus(TTSStatus.PLAYING);
        });

        audio.addEventListener('pause', () => {
            this.setStatus(TTSStatus.PAUSED);
        });

        audio.addEventListener('ended', () => {
            this.setStatus(TTSStatus.IDLE);
            this.cleanup();
        });

        audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.setStatus(TTSStatus.ERROR);
            this.emit('error', e);
        });

        return audio;
    }

    // Status management
    private setStatus(status: TTSStatus) {
        if (this.status !== status) {
            this.status = status;
            this.emit('statusChanged', status);
        }
    }

    getStatus(): TTSStatus {
        return this.status;
    }

    // Main TTS methods
    async speak(text: string, options: Partial<TTSRequest> = {}): Promise<void> {
        try {
            // Stop any current playback
            this.stop();

            const request: TTSRequest = {
                text,
                voice: options.voice || this.config.voice,
                speed: options.speed || this.config.speed,
                engine: options.engine || this.config.engine
            };

            // Use Web Speech API as fallback
            if (request.engine === 'webspeech' || !(await this.checkServerHealth())) {
                return this.speakWithWebSpeech(text, request);
            }

            // Use Python backend
            return this.speakWithServer(request);

        } catch (error) {
            console.error('TTS speak error:', error);
            this.setStatus(TTSStatus.ERROR);
            this.emit('error', error);
            throw error;
        }
    }

    private async speakWithServer(request: TTSRequest): Promise<void> {
        this.setStatus(TTSStatus.LOADING);

        const response = await fetch(`${this.serverUrl}/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`TTS synthesis failed: ${response.statusText}`);
        }

        const result: TTSResponse = await response.json();
        this.currentFileId = result.file_id;

        // Create and play audio
        const audioUrl = `${this.serverUrl}${result.audio_url}`;
        this.currentAudio = this.createAudioElement(audioUrl);

        await this.currentAudio.play();
    }

    private async speakWithWebSpeech(text: string, request: TTSRequest): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!('speechSynthesis' in window)) {
                reject(new Error('Web Speech API not supported'));
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = request.speed || 1.0;
            utterance.volume = this.config.volume;

            // Set voice if specified
            if (request.voice && request.voice !== 'default') {
                const voices = speechSynthesis.getVoices();
                const voiceIndex = parseInt(request.voice);
                if (voiceIndex >= 0 && voiceIndex < voices.length) {
                    utterance.voice = voices[voiceIndex];
                }
            }

            utterance.onstart = () => {
                this.setStatus(TTSStatus.PLAYING);
            };

            utterance.onend = () => {
                this.setStatus(TTSStatus.IDLE);
                resolve();
            };

            utterance.onerror = (event) => {
                this.setStatus(TTSStatus.ERROR);
                reject(new Error(`Speech synthesis error: ${event.error}`));
            };

            this.setStatus(TTSStatus.LOADING);
            speechSynthesis.speak(utterance);
        });
    }

    // Playback control
    play(): void {
        if (this.currentAudio && this.status === TTSStatus.PAUSED) {
            this.currentAudio.play();
        }
    }

    pause(): void {
        if (this.currentAudio && this.status === TTSStatus.PLAYING) {
            this.currentAudio.pause();
        }
        if ('speechSynthesis' in window && speechSynthesis.speaking) {
            speechSynthesis.pause();
            this.setStatus(TTSStatus.PAUSED);
        }
    }

    stop(): void {
        // Stop audio playback
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }

        // Stop web speech
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }

        this.setStatus(TTSStatus.IDLE);
        this.cleanup();
    }

    // Volume control
    setVolume(volume: number): void {
        this.config.volume = Math.max(0, Math.min(1, volume));
        this.saveConfig();

        if (this.currentAudio) {
            this.currentAudio.volume = this.config.volume;
        }

        this.emit('volumeChanged', this.config.volume);
    }

    getVolume(): number {
        return this.config.volume;
    }

    // Cleanup
    private async cleanup(): void {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        if (this.currentFileId && this.config.autoCleanup) {
            try {
                await fetch(`${this.serverUrl}/audio/${this.currentFileId}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.warn('Failed to cleanup audio file:', error);
            }
            this.currentFileId = null;
        }
    }

    // Utility methods
    isPlaying(): boolean {
        return this.status === TTSStatus.PLAYING;
    }

    isPaused(): boolean {
        return this.status === TTSStatus.PAUSED;
    }

    isLoading(): boolean {
        return this.status === TTSStatus.LOADING;
    }

    destroy(): void {
        this.stop();
        this.cleanup();
        this.listeners.clear();
    }
}

// Export singleton instance
export const ttsService = new TTSService();