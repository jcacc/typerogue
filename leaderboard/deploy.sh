#!/bin/bash
# Run this from your local machine to deploy the leaderboard API to lampPost.
# Usage: bash deploy.sh

set -e

echo "==> Copying files to lampPost..."
ssh lampPost "mkdir -p ~/leaderboard"
scp server.js package.json lampPost:~/leaderboard/

echo "==> Installing dependencies on lampPost..."
ssh lampPost "cd ~/leaderboard && npm install --omit=dev"

echo "==> Installing systemd service..."
scp leaderboard.service lampPost:/tmp/leaderboard.service
ssh lampPost "sudo mv /tmp/leaderboard.service /etc/systemd/system/leaderboard.service && sudo systemctl daemon-reload && sudo systemctl enable leaderboard && sudo systemctl restart leaderboard"

echo "==> Service status:"
ssh lampPost "sudo systemctl status leaderboard --no-pager"

echo ""
echo "==> Done. Now add this block to /etc/nginx/sites-available/comic-chat on lampPost:"
echo ""
cat <<'NGINX'
    location /leaderboard {
        proxy_pass         http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
NGINX
echo ""
echo "Then run: sudo nginx -t && sudo systemctl reload nginx"
