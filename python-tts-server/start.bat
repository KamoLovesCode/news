@echo off
REM Start TTS server script for Windows

echo Starting Python TTS Server...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Start server
echo Starting server on http://localhost:8000
python main.py