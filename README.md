# Online Job Frontend

## Deploy to Vercel

1. Set env var in Vercel Project Settings → Environment Variables:
   - `VITE_API_BASE_URL` = your backend base URL (e.g. `https://your-backend.example.com`)

2. Build & Output settings
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. SPA Rewrites
   - Included `vercel.json` with a catch-all route to `index.html`.

## Local Development

```
npm install
npm run dev
```

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
