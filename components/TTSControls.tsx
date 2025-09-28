import React, { useState, useEffect } from 'react';
import { ttsService, TTSStatus } from '../services/ttsService';
import TTSSettings from './TTSSettings';

interface TTSControlsProps {
    text: string;
    className?: string;
}

const TTSControls: React.FC<TTSControlsProps> = ({ text, className = '' }) => {
    const [status, setStatus] = useState<TTSStatus>(ttsService.getStatus());
    const [volume, setVolume] = useState(ttsService.getVolume());
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleStatusChange = (newStatus: TTSStatus) => {
            setStatus(newStatus);
            if (newStatus !== TTSStatus.ERROR) {
                setError(null);
            }
        };

        const handleVolumeChange = (newVolume: number) => {
            setVolume(newVolume);
        };

        const handleError = (error: any) => {
            setError(error.message || 'An error occurred');
        };

        ttsService.on('statusChanged', handleStatusChange);
        ttsService.on('volumeChanged', handleVolumeChange);
        ttsService.on('error', handleError);

        return () => {
            ttsService.off('statusChanged', handleStatusChange);
            ttsService.off('volumeChanged', handleVolumeChange);
            ttsService.off('error', handleError);
        };
    }, []);

    const handlePlay = async () => {
        try {
            if (status === TTSStatus.PAUSED) {
                ttsService.play();
            } else {
                await ttsService.speak(text);
            }
        } catch (error) {
            console.error('TTS play error:', error);
        }
    };

    const handlePause = () => {
        ttsService.pause();
    };

    const handleStop = () => {
        ttsService.stop();
    };

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(event.target.value);
        ttsService.setVolume(newVolume);
    };

    const getPlayButtonIcon = () => {
        switch (status) {
            case TTSStatus.LOADING:
                return (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                );
            case TTSStatus.PLAYING:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15a2 2 0 002-2V9a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293L10.293 4.293A1 1 0 009.586 4H8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
        }
    };

    const isActive = status === TTSStatus.PLAYING || status === TTSStatus.PAUSED || status === TTSStatus.LOADING;

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            {/* Main play/pause button */}
            <button
                onClick={status === TTSStatus.PLAYING ? handlePause : handlePlay}
                disabled={status === TTSStatus.LOADING}
                className={`flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200 ${isActive
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    } ${status === TTSStatus.LOADING ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                title={status === TTSStatus.PLAYING ? 'Pause' : 'Play'}
            >
                {getPlayButtonIcon()}
            </button>

            {/* Stop button - only show when playing/paused */}
            {(status === TTSStatus.PLAYING || status === TTSStatus.PAUSED) && (
                <button
                    onClick={handleStop}
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    title="Stop"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9V10z" />
                    </svg>
                </button>
            )}

            {/* Volume control */}
            <div className="relative">
                <button
                    onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    title="Volume"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.343 6.343A8.014 8.014 0 004 12a8.014 8.014 0 002.343 5.657L9 15a4 4 0 000-6l-2.657-2.657z" />
                    </svg>
                </button>

                {/* Volume slider */}
                {showVolumeSlider && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col items-center space-y-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Volume</span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                                aria-label="Volume control"
                                title="Adjust volume"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(volume * 100)}%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Settings button */}
            <button
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="TTS Settings"
                aria-label="TTS Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {/* Status indicator */}
            <div className="flex items-center min-w-0">
                {status === TTSStatus.LOADING && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Loading...</span>
                )}
                {status === TTSStatus.PLAYING && (
                    <span className="text-xs text-blue-500 dark:text-blue-400 whitespace-nowrap">Playing</span>
                )}
                {status === TTSStatus.PAUSED && (
                    <span className="text-xs text-orange-500 dark:text-orange-400 whitespace-nowrap">Paused</span>
                )}
                {error && (
                    <span className="text-xs text-red-500 dark:text-red-400 whitespace-nowrap" title={error}>
                        Error
                    </span>
                )}
            </div>

            {/* Settings Modal */}
            <TTSSettings
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </div>
    );
};

export default TTSControls;