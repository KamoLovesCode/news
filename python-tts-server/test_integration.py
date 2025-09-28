#!/usr/bin/env python3
"""
Test script for TTS server functionality
"""

import requests
import time
import sys

def test_server_health():
    """Test if TTS server is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server health check passed")
            return True
        else:
            print(f"❌ Server health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Server health check failed: {e}")
        return False

def test_voices_endpoint():
    """Test voices endpoint"""
    try:
        response = requests.get("http://localhost:8000/voices", timeout=10)
        if response.status_code == 200:
            voices = response.json()
            print(f"✅ Voices endpoint works, found {len(voices)} voices")
            for voice in voices[:3]:  # Show first 3 voices
                print(f"   - {voice['name']} (ID: {voice['id']})")
            return True
        else:
            print(f"❌ Voices endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Voices endpoint failed: {e}")
        return False

def test_synthesis(engine="pyttsx3"):
    """Test TTS synthesis"""
    try:
        test_text = "Hello, this is a test of the text to speech system."
        
        payload = {
            "text": test_text,
            "engine": engine,
            "speed": 1.0,
            "voice": "default"
        }
        
        print(f"Testing {engine} synthesis...")
        response = requests.post("http://localhost:8000/synthesize", 
                               json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {engine} synthesis successful")
            print(f"   Audio URL: {result['audio_url']}")
            print(f"   File ID: {result['file_id']}")
            
            # Test audio file access
            audio_response = requests.get(f"http://localhost:8000{result['audio_url']}", 
                                        timeout=10)
            if audio_response.status_code == 200:
                print(f"✅ Audio file accessible ({len(audio_response.content)} bytes)")
                
                # Test cleanup
                cleanup_response = requests.delete(f"http://localhost:8000/audio/{result['file_id']}")
                if cleanup_response.status_code == 200:
                    print("✅ Audio cleanup successful")
                else:
                    print(f"⚠️  Audio cleanup failed: {cleanup_response.status_code}")
                    
                return True
            else:
                print(f"❌ Audio file not accessible: {audio_response.status_code}")
                return False
        else:
            print(f"❌ {engine} synthesis failed: {response.status_code}")
            if response.headers.get('content-type', '').startswith('application/json'):
                print(f"   Error: {response.json()}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ {engine} synthesis failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing TTS Server Integration")
    print("=" * 40)
    
    tests_passed = 0
    total_tests = 0
    
    # Test 1: Server Health
    total_tests += 1
    if test_server_health():
        tests_passed += 1
    
    # Test 2: Voices endpoint
    total_tests += 1
    if test_voices_endpoint():
        tests_passed += 1
    
    # Test 3: pyttsx3 synthesis
    total_tests += 1
    if test_synthesis("pyttsx3"):
        tests_passed += 1
    
    # Test 4: gTTS synthesis (requires internet)
    total_tests += 1
    print("\n⚠️  Testing gTTS (requires internet connection)...")
    if test_synthesis("gtts"):
        tests_passed += 1
    else:
        print("   (This is normal if offline or if gTTS is not working)")
    
    # Results
    print("\n" + "=" * 40)
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed >= 3:  # Allow gTTS to fail
        print("🎉 TTS integration is working properly!")
        return 0
    else:
        print("💥 TTS integration has issues that need attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())