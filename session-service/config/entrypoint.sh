#!/bin/sh

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --legacy-peer-deps
fi

exec npm run dev