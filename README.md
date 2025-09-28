<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# News App with Text-to-Speech

<<<<<<< Updated upstream
[![Deploy to GitHub Pages](https://github.com/KamoLovesCode/news/actions/workflows/deploy.yml/badge.svg)](https://github.com/KamoLovesCode/news/actions/workflows/deploy.yml)

This contains everything you need to run your app locally.
=======
A modern news application that aggregates news from multiple sources and provides text-to-speech functionality for accessibility and convenience.
>>>>>>> Stashed changes

View your app in AI Studio: https://ai.studio/apps/drive/1iQKAYuin2elQQfeoRRfEq1u5fcLgqZyk

## Features

- 📰 **Multi-source News Aggregation**: Fetches news from NewsData.io and NewsAPI.org
- 🔊 **Text-to-Speech**: Listen to articles with advanced TTS functionality
- 🌙 **Dark/Light Mode**: Automatic theme switching with user preference
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🎯 **Category Filtering**: Browse news by categories (Technology, Business, Sports, etc.)
- 🔍 **Search Functionality**: Find specific news topics
- 🚀 **Fast Loading**: Optimized performance with modern React

## Text-to-Speech Features

- **Multiple TTS Engines**: Python-based (pyttsx3, Google TTS) + Web Speech API fallback
- **Voice Selection**: Choose from available system voices
- **Speed & Volume Control**: Customizable speech rate and volume
- **Smart Fallback**: Automatically switches to browser TTS when server is unavailable
- **Persistent Settings**: User preferences saved locally

## Run Locally

**Prerequisites:** Node.js and Python 3.7+

### 1. Install and run the React app:
```bash
npm install
# Set the GEMINI_API_KEY in .env.local to your Gemini API key
npm run dev
```

<<<<<<< Updated upstream
1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy (GitHub Pages)

This project is configured to deploy automatically to **GitHub Pages** using GitHub Actions.

### Production URL

Once enabled in repository settings, your app will be available at:

`https://kamolovescode.github.io/news/`

### How it works

The workflow at `.github/workflows/deploy.yml`:

1. Triggers on pushes to `main`.
2. Installs dependencies with `npm ci` (from the committed `package-lock.json`).
3. Builds the site using Vite (output in `dist`).
4. Uploads the `dist` folder as a Pages artifact.
5. Deploys using the official `actions/deploy-pages` action.

### One-time setup steps

1. Go to: Repository Settings → Pages
2. Set Source to: GitHub Actions (if not already)
3. Add the secret `GEMINI_API_KEY` under Settings → Secrets and variables → Actions → New repository secret

### Development vs Production base path

The Vite config sets `base: '/news/'` in `vite.config.ts` so assets resolve correctly on Pages. When running locally (`npm run dev`) this still works transparently.

### Troubleshooting

- 404 on refresh: Ensure `base` matches the repository name and you access the site via the full path.
- Stale assets: Hard refresh or invalidate cache (Pages can cache aggressively for a few minutes).
- Empty page: Check the Actions logs for the build job.
- Missing API key behavior: Ensure `GEMINI_API_KEY` secret is set; it is injected only during the build step.

---
Deployment status appears in the Actions tab after each push to `main`.
=======
### 2. (Optional) Start the Python TTS Server for enhanced audio quality:
```bash
cd python-tts-server
# Windows:
start.bat
# macOS/Linux:
chmod +x start.sh && ./start.sh
```

The app will work with browser-based TTS even without the Python server.

## TTS Setup & Usage

See [TTS_INTEGRATION.md](TTS_INTEGRATION.md) for detailed setup instructions and troubleshooting.

### Quick Start:
1. Open any article
2. Click the speaker icon next to the article metadata
3. Use the settings gear to configure voice, speed, and volume
4. Enjoy hands-free news reading!

## Browser Compatibility

- ✅ Chrome 71+ (Full TTS support)
- ✅ Edge 79+ (Full TTS support) 
- ✅ Safari 14+ (Full TTS support)
- ⚠️ Firefox 62+ (Limited TTS features)

## API Keys Required

1. **Gemini API Key**: Set in `.env.local` as `GEMINI_API_KEY`
2. **News APIs**: Pre-configured in the app (NewsData.io and NewsAPI.org)
>>>>>>> Stashed changes
