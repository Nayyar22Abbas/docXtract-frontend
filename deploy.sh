#!/bin/bash
set -e

echo "📥 Pulling latest code from GitHub..."
cd ~/DocXtract/DocXtract/frontend

git fetch origin
git reset --hard origin/main

echo "🌐 Rebuilding and restarting frontend..."
sudo docker-compose down
sudo docker-compose up -d --build

echo "✅ Frontend deployment complete!"
