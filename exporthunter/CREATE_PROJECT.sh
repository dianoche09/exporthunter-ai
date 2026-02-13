#!/bin/bash

# ExportHunter AI - Complete Project Generator
# Bu script TÜÜÜM projeyi sıfırdan oluşturur!

echo "🚀 ExportHunter AI - Proje Oluşturuluyor..."
echo ""

# Klasör yapısı
mkdir -p exporthunter-ai/{backend/src/{routes,controllers,models,services/{ai,email,scraper},middleware,utils,config},frontend/src/{pages,components,contexts,services,hooks,types}}

cd exporthunter-ai

# ===========================================
# ROOT FILES
# ===========================================

cat > package.json << 'EOF'
{
  "name": "exporthunter-ai",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["frontend", "backend"],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:backend": "npm run dev --workspace=backend",
    "install:all": "npm install && npm install --workspace=frontend && npm install --workspace=backend"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF

cat > .env.example << 'EOF'
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/exporthunter

JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h

ANTHROPIC_API_KEY=sk-ant-your-key-here
RESEND_API_KEY=re_your-key-here
EOF

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: exporthunter
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
EOF

cat > .gitignore << 'EOF'
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
coverage/
EOF

cat > README.md << 'EOF'
# ExportHunter AI

AI-Powered B2B Sales CRM for Turkish Exporters

## Quick Start

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Setup environment:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. Start MongoDB:
   ```bash
   docker-compose up -d
   ```

4. Run development servers:
   ```bash
   npm run dev
   ```

Visit: http://localhost:3000

## Tech Stack

- Frontend: React + TypeScript + Tailwind + Vite
- Backend: Node.js + Express + MongoDB
- AI: Claude API (Anthropic)
- Email: Resend
EOF

# ===========================================
# BACKEND
# ===========================================

cat > backend/package.json << 'EOF'
{
  "name": "exporthunter-backend",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1",
    "zod": "^3.22.4",
    "axios": "^1.6.2",
    "resend": "^3.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  }
}
EOF

cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Backend server.ts (temel yapı)
cat > backend/src/server.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
EOF

# ===========================================
# FRONTEND
# ===========================================

cat > frontend/package.json << 'EOF'
{
  "name": "exporthunter-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "@tanstack/react-query": "^5.17.9",
    "axios": "^1.6.5",
    "zustand": "^4.4.7",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.303.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33"
  }
}
EOF

cat > frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
EOF

cat > frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
EOF

cat > frontend/tailwind.config.js << 'EOF'
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        }
      }
    }
  },
  plugins: []
}
EOF

cat > frontend/postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

cat > frontend/index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ExportHunter AI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > frontend/src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

cat > frontend/src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
EOF

cat > frontend/src/App.tsx << 'EOF'
function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 ExportHunter AI
        </h1>
        <p className="text-xl text-gray-600">
          AI-Powered B2B Sales CRM
        </p>
        <p className="text-sm text-gray-500 mt-4">
          System is running! Frontend ready ✅
        </p>
      </div>
    </div>
  )
}

export default App
EOF

echo ""
echo "✅ Proje oluşturuldu!"
echo ""
echo "📦 Şimdi şunları çalıştır:"
echo ""
echo "  cd exporthunter-ai"
echo "  npm run install:all"
echo "  docker-compose up -d"
echo "  cp .env.example .env"
echo "  # .env dosyasını düzenle"
echo "  npm run dev"
echo ""
echo "🎉 BAŞARILI! http://localhost:3000 adresinden erişebilirsin!"
