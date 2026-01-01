#!/bin/bash

echo "🚀 ExportHunter AI - Tüm Dosyaları Oluşturuyor..."

# .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
coverage/
.vscode/
.idea/
EOF

# docker-compose.yml
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

echo "✅ Root dosyalar oluşturuldu"
echo "✅ Docker yapılandırması hazır"
echo ""
echo "📦 Şimdi şu komutları çalıştır:"
echo ""
echo "  npm install"
echo "  docker-compose up -d"
echo "  cp .env.example .env"
echo "  # .env dosyasını düzenle"
echo "  npm run dev"
echo ""
echo "🎉 BAŞARILI! Proje çalışmaya hazır!"
