# Qiushui Platformer (final)

## Local
```bash
npm i
npm run dev
```

## Deploy to GitHub Pages (quick)
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main

npm run build
npx gh-pages -d dist -t true
```
Then in GitHub → Settings → Pages:
- Source: Deploy from a branch
- Branch: gh-pages / (root)
