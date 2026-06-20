<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1b9b1d99-89cd-410d-8b37-4e13dcbeaa83

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GROQ_API_KEY` in `.env` to your Groq API key (see `.env.example`).
3. Run the app:
   `npm run dev`

## Deploying to Vercel

This project is fully configured for deployment on Vercel. Vercel will automatically build the Vite frontend and host the Express backend as a Serverless Function.

### Required Environment Variables
You must configure the following environment variable in your Vercel Dashboard for the dynamic AI challenge generation and validation features to work correctly:
- `GROQ_API_KEY`: Your API key from [Groq Console](https://console.groq.com/keys).

### Deployment Checklist
1. Ensure your code is pushed to a GitHub, GitLab, or Bitbucket repository.
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** -> **Project**.
3. Import your repository.
4. In the **Configure Project** step:
   - **Framework Preset**: Vercel should automatically detect **Vite**.
   - **Environment Variables**: Add `GROQ_API_KEY` with your actual secret key.
5. Click **Deploy**.

Vercel will execute the `npm run build` script, host your static frontend from `dist`, and automatically route all `/api/*` traffic to the Express server running as a Serverless function (configured via `vercel.json` and `api/index.ts`).
