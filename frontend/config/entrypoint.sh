#!/bin/sh

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Copy every static file in dist/ to be served by nginx
cp public/favicon.ico dist/favicon.ico
echo copy done

echo "Launching in $NODE_ENV mode"

if env | grep -q "^NODE_ENV=development"; then
	exec npm run dev
else
	exec npm run build
fi
