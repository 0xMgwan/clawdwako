#!/bin/bash
set -e

echo "=== OpenClaw Startup Script ==="
echo "Generating OpenClaw configuration..."
echo "TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:0:10}..."
echo "PORT: ${PORT:-8080}"
echo "MODEL: ${MODEL:-anthropic/claude-sonnet-4-20250514}"

# Generate OpenClaw config with Telegram channel
cat > /root/.openclaw/openclaw.json <<EOF
{
  "gateway": {
    "mode": "local",
    "controlUi": {
      "allowedOrigins": ["*"],
      "dangerouslyAllowHostHeaderOriginFallback": true
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "${TELEGRAM_BOT_TOKEN}",
      "dmPolicy": "open",
      "allowFrom": ["*"],
      "groups": {
        "*": {
          "requireMention": true
        }
      }
    }
  }
}
EOF

echo "=== Config generated ==="
cat /root/.openclaw/openclaw.json | head -5
echo "..."
echo "=== Starting OpenClaw Gateway ==="

exec openclaw gateway --bind lan --port ${PORT:-8080}
