from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
import pyttsx3
import os
import tempfile
import uuid
import threading
import time
from gtts import gTTS
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TTS Server", description="Text-to-Speech API for News App", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory for audio files
TEMP_DIR = Path(tempfile.gettempdir()) / "tts_audio"
TEMP_DIR.mkdir(exist_ok=True)

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "default"
    speed: Optional[float] = 1.0
    engine: Optional[str] = "pyttsx3"  # "pyttsx3", "gtts"

class TTSResponse(BaseModel):
    audio_url: str
    file_id: str

class VoiceInfo(BaseModel):
    id: str
    name: str
    gender: Optional[str] = None
    age: Optional[str] = None

# Global TTS engine for pyttsx3
tts_engine = None
tts_lock = threading.Lock()

def init_pyttsx3():
    """Initialize pyttsx3 engine safely"""
    global tts_engine
    try:
        if tts_engine is None:
            tts_engine = pyttsx3.init()
            # Set default properties
            tts_engine.setProperty('rate', 200)    # Speed of speech
            tts_engine.setProperty('volume', 0.9)  # Volume level (0.0 to 1.0)
        return tts_engine
    except Exception as e:
        logger.error(f"Failed to initialize pyttsx3: {e}")
        return None

def cleanup_old_files():
    """Clean up audio files older than 1 hour"""
    try:
        current_time = time.time()
        for file_path in TEMP_DIR.glob("*.wav"):
            if current_time - file_path.stat().st_mtime > 3600:  # 1 hour
                file_path.unlink()
                logger.info(f"Cleaned up old file: {file_path}")
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")

@app.on_event("startup")
async def startup_event():
    """Initialize TTS engine on startup"""
    init_pyttsx3()
    cleanup_old_files()

@app.get("/")
async def root():
    return {"message": "TTS Server is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": time.time()}

@app.get("/voices", response_model=List[VoiceInfo])
async def get_voices():
    """Get available voices for TTS"""
    voices = []
    
    # Try to get pyttsx3 voices
    try:
        engine = init_pyttsx3()
        if engine:
            available_voices = engine.getProperty('voices')
            for i, voice in enumerate(available_voices):
                voices.append(VoiceInfo(
                    id=str(i),
                    name=voice.name,
                    gender=getattr(voice, 'gender', None),
                    age=getattr(voice, 'age', None)
                ))
    except Exception as e:
        logger.error(f"Error getting voices: {e}")
    
    # Add gTTS option
    voices.append(VoiceInfo(id="gtts", name="Google TTS (English)", gender="neutral"))
    
    return voices

@app.post("/synthesize", response_model=TTSResponse)
async def synthesize_speech(request: TTSRequest, background_tasks: BackgroundTasks):
    """Convert text to speech"""
    try:
        # Generate unique filename
        file_id = str(uuid.uuid4())
        audio_path = TEMP_DIR / f"{file_id}.wav"
        
        if request.engine == "gtts":
            # Use Google TTS
            try:
                tts = gTTS(text=request.text, lang='en', slow=False)
                # gTTS outputs mp3, we'll save as mp3 and convert if needed
                mp3_path = TEMP_DIR / f"{file_id}.mp3"
                tts.save(str(mp3_path))
                
                # For now, serve the mp3 directly
                audio_path = mp3_path
                
            except Exception as e:
                logger.error(f"gTTS error: {e}")
                raise HTTPException(status_code=500, detail=f"gTTS synthesis failed: {str(e)}")
                
        else:
            # Use pyttsx3
            try:
                engine = init_pyttsx3()
                if not engine:
                    raise HTTPException(status_code=500, detail="TTS engine not available")
                
                with tts_lock:
                    # Set voice if specified
                    if request.voice and request.voice != "default":
                        voices = engine.getProperty('voices')
                        try:
                            voice_index = int(request.voice)
                            if 0 <= voice_index < len(voices):
                                engine.setProperty('voice', voices[voice_index].id)
                        except (ValueError, IndexError):
                            logger.warning(f"Invalid voice index: {request.voice}")
                    
                    # Set speed
                    rate = int(200 * request.speed)  # Base rate 200 WPM
                    engine.setProperty('rate', rate)
                    
                    # Save to file
                    engine.save_to_file(request.text, str(audio_path))
                    engine.runAndWait()
                    
            except Exception as e:
                logger.error(f"pyttsx3 error: {e}")
                raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")
        
        # Check if file was created
        if not audio_path.exists():
            raise HTTPException(status_code=500, detail="Audio file was not generated")
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_old_files)
        
        return TTSResponse(
            audio_url=f"/audio/{file_id}{audio_path.suffix}",
            file_id=file_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in synthesize: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/audio/{file_id}")
async def get_audio(file_id: str):
    """Serve generated audio file"""
    try:
        # Try both wav and mp3 extensions
        for ext in ['.wav', '.mp3']:
            audio_path = TEMP_DIR / f"{file_id}{ext}"
            if audio_path.exists():
                media_type = "audio/wav" if ext == '.wav' else "audio/mpeg"
                return FileResponse(
                    path=str(audio_path),
                    media_type=media_type,
                    filename=f"speech{ext}"
                )
        
        raise HTTPException(status_code=404, detail="Audio file not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving audio: {e}")
        raise HTTPException(status_code=500, detail="Error serving audio file")

@app.delete("/audio/{file_id}")
async def delete_audio(file_id: str):
    """Delete generated audio file"""
    try:
        deleted = False
        for ext in ['.wav', '.mp3']:
            audio_path = TEMP_DIR / f"{file_id}{ext}"
            if audio_path.exists():
                audio_path.unlink()
                deleted = True
        
        if deleted:
            return {"message": "Audio file deleted"}
        else:
            raise HTTPException(status_code=404, detail="Audio file not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting audio: {e}")
        raise HTTPException(status_code=500, detail="Error deleting audio file")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")