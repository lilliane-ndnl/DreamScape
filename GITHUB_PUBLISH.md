# GitHub Publish Guide for DreamScape

This document provides instructions for publishing the DreamScape app to GitHub Pages.

## Prerequisites

- Node.js and npm installed
- Git installed and configured
- GitHub account
- Repository access

## Publishing Steps

1. **Update package.json**

   Ensure your package.json has the correct homepage field:
   ```json
   "homepage": "https://{username}.github.io/{repository-name}"
   ```

2. **Install GitHub Pages package**

   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add deploy scripts**

   Add these scripts to your package.json:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

4. **Deploy the app**

   ```bash
   npm run deploy
   ```

5. **Configure GitHub Pages**

   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Select the gh-pages branch as the source
   - Save the settings

## Troubleshooting

If you encounter issues during deployment:

- Check if your repository is public
- Verify branch names and settings
- Check for build errors in GitHub Actions

## Automated Deployment

You can set up GitHub Actions for automatic deployment on commits to main branch. Create a workflow file in `.github/workflows/deploy.yml`. 