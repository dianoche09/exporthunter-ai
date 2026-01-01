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
