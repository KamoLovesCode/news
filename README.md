<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1iQKAYuin2elQQfeoRRfEq1u5fcLgqZyk

## Run Locally

**Prerequisites:**  Node.js


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

### Manual deployment (optional)

Although automated deployment is preferred, you can still publish manually (not required):

```
npm run build
npm run deploy
```

That uses the `gh-pages` package to push the `dist` folder to a `gh-pages` branch. This is separate from the Actions-based Pages flow—use one approach consistently to avoid confusion. Recommended: keep using the GitHub Actions workflow.

### Troubleshooting

- 404 on refresh: Ensure `base` matches the repository name and you access the site via the full path.
- Stale assets: Hard refresh or invalidate cache (Pages can cache aggressively for a few minutes).
- Empty page: Check the Actions logs for the build job.
- Missing API key behavior: Ensure `GEMINI_API_KEY` secret is set; it is injected only during the build step.

---
Deployment status appears in the Actions tab after each push to `main`.
