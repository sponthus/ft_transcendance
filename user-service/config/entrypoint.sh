#!/bin/sh

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

if env | grep -q "^NODE_ENV=development"; then
  echo "Running in development mode"
  exec npm run dev
else
  echo "Running in production mode"
  exec npm run start
fi