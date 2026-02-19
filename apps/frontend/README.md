# Frontend - IoT E-Commerce Platform

React + Vite + Tailwind CSS frontend for the IoT E-Commerce Platform.

## Requirements
- Node.js 18+
- npm or yarn

## Setup

```bash
cd apps/frontend
npm install
```

## Running the Application

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Development

- The Vite dev server is configured with a proxy to the backend API
- API calls to `/api/*` will be proxied to `http://localhost:8080`

## Build

```bash
npm run build
```

The production build will be in the `dist/` directory.
