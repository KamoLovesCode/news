# Python TTS Server for News App

This is a FastAPI-based Text-to-Speech server that provides TTS functionality for the news web application.

## Features

- Multiple TTS engines: pyttsx3 (offline) and Google TTS (online)
- Voice selection and speech rate control
- RESTful API with automatic cleanup of temporary files
- CORS support for web application integration
- Health check endpoint

## Installation

1. Navigate to the python-tts-server directory:
```bash
cd python-tts-server
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

Start the server with:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will be available at `http://localhost:8000`

## API Endpoints

### GET /
- Returns server info and version

### GET /health
- Health check endpoint

### GET /voices
- Returns list of available voices

### POST /synthesize
- Converts text to speech
- Body: `{"text": "Hello world", "voice": "0", "speed": 1.0, "engine": "pyttsx3"}`
- Returns: `{"audio_url": "/audio/file_id", "file_id": "uuid"}`

### GET /audio/{file_id}
- Serves the generated audio file

### DELETE /audio/{file_id}
- Deletes the generated audio file

## Configuration

The server supports two TTS engines:

1. **pyttsx3** (default): Offline TTS engine
   - Faster for short texts
   - No internet required
   - Platform-dependent voices

2. **gtts**: Google Text-to-Speech
   - Higher quality voices
   - Requires internet connection
   - Supports multiple languages

## Notes

- Audio files are automatically cleaned up after 1 hour
- The server uses temporary directory for storing audio files
- CORS is configured to allow requests from localhost:3000