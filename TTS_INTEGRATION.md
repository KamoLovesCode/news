# Text-to-Speech Integration for News App

This document describes how to set up and use the Text-to-Speech (TTS) functionality in the news web application.

## Features

- **Multiple TTS Engines**: Supports Python-based TTS (pyttsx3, Google TTS) and Web Speech API fallback
- **Voice Selection**: Choose from available system voices or Google TTS voices
- **Speed & Volume Control**: Adjustable speech rate and volume with user preferences
- **Smart Fallback**: Automatically switches to Web Speech API when Python server is unavailable
- **Auto-Cleanup**: Automatically removes temporary audio files after playback
- **Persistent Settings**: User preferences are saved in localStorage

## Installation & Setup

### 1. Start the Python TTS Server

Navigate to the `python-tts-server` directory and run:

#### Windows:
```cmd
cd python-tts-server
start.bat
```

#### macOS/Linux:
```bash
cd python-tts-server
chmod +x start.sh
./start.sh
```

#### Manual Setup:
```bash
cd python-tts-server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The server will start at `http://localhost:8000`

### 2. Start the React App

In the main news directory:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

### Reading Articles
1. Open any article in the news app
2. Look for the TTS controls next to the article metadata (source and trending info)
3. Click the play button (speaker icon) to start reading the article
4. Use pause/stop buttons to control playback
5. Adjust volume using the volume control

### Settings
1. Click the settings gear icon in the TTS controls
2. Configure:
   - **TTS Engine**: Choose between pyttsx3, Google TTS, or Web Speech API
   - **Voice**: Select from available voices
   - **Speed**: Adjust speech rate (0.5x to 2x)
   - **Volume**: Control playback volume
   - **Auto-cleanup**: Enable/disable automatic file cleanup

### Fallback Behavior
- If the Python TTS server is offline, the app automatically uses the Web Speech API
- Server status is shown in the settings panel
- Green dot = Python server online
- Red dot = Python server offline (using Web Speech API)

## Troubleshooting

### Python Server Issues
1. **Server won't start**: 
   - Ensure Python 3.7+ is installed
   - Check if port 8000 is available
   - Try running `python main.py` directly to see error messages

2. **pyttsx3 not working**:
   - On Linux: Install `espeak` or `festival`
   - On Windows: Should work out of the box
   - On macOS: Uses built-in speech synthesis

3. **Google TTS not working**:
   - Requires internet connection
   - Check firewall/proxy settings

### Web App Issues
1. **TTS controls not visible**:
   - Ensure the TTS service is imported in ArticleDetail component
   - Check browser console for errors

2. **Web Speech API not working**:
   - Some browsers require HTTPS for speech synthesis
   - Try a different browser (Chrome/Edge work best)

3. **No sound**:
   - Check browser audio settings
   - Ensure volume is not muted
   - Try adjusting volume in TTS settings

## Browser Compatibility

### Fully Supported:
- Chrome 71+ (Windows, macOS, Android)
- Edge 79+ (Windows, macOS)
- Safari 14+ (macOS, iOS)

### Partially Supported:
- Firefox 62+ (Web Speech API may have limitations)
- Chrome on iOS (limited voice selection)

### Web Speech API Notes:
- Voice quality varies by platform
- Some voices may require initial download
- Mobile devices may have different voice sets

## Performance Optimization

The TTS system includes several optimizations:

1. **Audio Caching**: Server-generated audio files are cached temporarily
2. **Auto-cleanup**: Old audio files are automatically removed
3. **Connection Pooling**: Reuses HTTP connections for better performance
4. **Fallback Detection**: Fast server health checks with minimal overhead
5. **Memory Management**: Audio objects are properly disposed after use

## API Endpoints (Python Server)

- `GET /health` - Server health check
- `GET /voices` - List available voices
- `POST /synthesize` - Generate speech from text
- `GET /audio/{file_id}` - Serve generated audio file
- `DELETE /audio/{file_id}` - Delete audio file

## Configuration

### Default Settings:
- Engine: pyttsx3
- Voice: Default system voice
- Speed: 1.0x (normal)
- Volume: 80%
- Auto-cleanup: Enabled

### Environment Variables (Python Server):
- `TTS_HOST`: Server host (default: 0.0.0.0)
- `TTS_PORT`: Server port (default: 8000)
- `TTS_CLEANUP_INTERVAL`: File cleanup interval in seconds (default: 3600)

## Security Considerations

1. **CORS**: Server is configured to accept requests from localhost:3000
2. **File Cleanup**: Temporary files are automatically cleaned up
3. **Input Validation**: Text input is validated and sanitized
4. **Rate Limiting**: Consider implementing rate limiting for production use

## Future Enhancements

Potential improvements for the TTS system:

1. **SSML Support**: Add Speech Synthesis Markup Language support
2. **Voice Cloning**: Integration with voice cloning services
3. **Batch Processing**: Process multiple articles at once
4. **Offline Mode**: Download voices for offline use
5. **Reading Progress**: Visual indicator showing reading progress
6. **Bookmarks**: Remember position in long articles