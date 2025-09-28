import React, { useState, useEffect } from 'react';
import { ttsService, TTSConfig, TTSVoice } from '../services/ttsService';

interface TTSSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const TTSSettings: React.FC<TTSSettingsProps> = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState<TTSConfig>(ttsService.getConfig());
    const [voices, setVoices] = useState<TTSVoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    useEffect(() => {
        if (isOpen) {
            loadVoices();
            checkServerStatus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleConfigChange = (newConfig: TTSConfig) => {
            setConfig(newConfig);
        };

        ttsService.on('configChanged', handleConfigChange);
        return () => ttsService.off('configChanged', handleConfigChange);
    }, []);

    const loadVoices = async () => {
        setLoading(true);
        try {
            const availableVoices = await ttsService.getVoices();
            setVoices(availableVoices);
        } catch (error) {
            console.error('Failed to load voices:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkServerStatus = async () => {
        setServerStatus('checking');
        const isOnline = await ttsService.checkServerHealth();
        setServerStatus(isOnline ? 'online' : 'offline');
    };

    const handleEngineChange = (engine: TTSConfig['engine']) => {
        ttsService.updateConfig({ engine });
    };

    const handleVoiceChange = (voice: string) => {
        ttsService.updateConfig({ voice });
    };

    const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const speed = parseFloat(event.target.value);
        ttsService.updateConfig({ speed });
    };

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const volume = parseFloat(event.target.value);
        ttsService.setVolume(volume);
    };

    const handleAutoCleanupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        ttsService.updateConfig({ autoCleanup: event.target.checked });
    };

    const testTTS = async () => {
        try {
            await ttsService.speak('This is a test of the text to speech system.', {
                engine: config.engine,
                voice: config.voice,
                speed: config.speed
            });
        } catch (error) {
            console.error('TTS test failed:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">TTS Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label="Close settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Server Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Server Status
                        </label>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${serverStatus === 'online' ? 'bg-green-500' :
                                    serverStatus === 'offline' ? 'bg-red-500' :
                                        'bg-yellow-500 animate-pulse'
                                }`}></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {serverStatus === 'online' ? 'Python TTS Server Online' :
                                    serverStatus === 'offline' ? 'Python TTS Server Offline (Web Speech API will be used)' :
                                        'Checking server status...'}
                            </span>
                            <button
                                onClick={checkServerStatus}
                                className="text-blue-500 hover:text-blue-600 text-sm"
                                disabled={serverStatus === 'checking'}
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Engine Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            TTS Engine
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="engine"
                                    value="pyttsx3"
                                    checked={config.engine === 'pyttsx3'}
                                    onChange={() => handleEngineChange('pyttsx3')}
                                    disabled={serverStatus === 'offline'}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    pyttsx3 (Offline, Fast) {serverStatus === 'offline' && '- Unavailable'}
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="engine"
                                    value="gtts"
                                    checked={config.engine === 'gtts'}
                                    onChange={() => handleEngineChange('gtts')}
                                    disabled={serverStatus === 'offline'}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Google TTS (Online, High Quality) {serverStatus === 'offline' && '- Unavailable'}
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="engine"
                                    value="webspeech"
                                    checked={config.engine === 'webspeech'}
                                    onChange={() => handleEngineChange('webspeech')}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Web Speech API (Browser Native)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Voice Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Voice
                        </label>
                        {loading ? (
                            <div className="text-sm text-gray-500 dark:text-gray-400">Loading voices...</div>
                        ) : (
                            <select
                                value={config.voice}
                                onChange={(e) => handleVoiceChange(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                aria-label="Select voice"
                                title="Select voice for text-to-speech"
                            >
                                <option value="default">Default Voice</option>
                                {voices.map((voice) => (
                                    <option key={voice.id} value={voice.id}>
                                        {voice.name} {voice.gender && `(${voice.gender})`}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Speed Control */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Speech Speed: {config.speed}x
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={config.speed}
                            onChange={handleSpeedChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                            aria-label="Speech speed"
                            title="Adjust speech speed"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>0.5x (Slow)</span>
                            <span>1x (Normal)</span>
                            <span>2x (Fast)</span>
                        </div>
                    </div>

                    {/* Volume Control */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Volume: {Math.round(config.volume * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={config.volume}
                            onChange={handleVolumeChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                            aria-label="Volume"
                            title="Adjust volume"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* Auto Cleanup */}
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={config.autoCleanup}
                                onChange={handleAutoCleanupChange}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Automatically cleanup audio files after playback
                            </span>
                        </label>
                    </div>

                    {/* Test Button */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={testTTS}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Test TTS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TTSSettings;