#!/bin/bash
set -e

echo "=== OpenClaw Startup Script ==="
echo "TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:0:10}..."
echo "PORT: ${PORT:-8080}"
echo "MODEL: ${MODEL:-anthropic/claude-sonnet-4-20250514}"
echo "ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:0:10}..."
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}..."
echo "GOOGLE_API_KEY: ${GOOGLE_API_KEY:0:10}..."

# Map user-friendly model names to OpenClaw provider/model format
OPENCLAW_MODEL="${MODEL:-anthropic/claude-sonnet-4-20250514}"

# If model doesn't contain a slash, try to map it
case "$OPENCLAW_MODEL" in
  claude-opus-4-20250514|claude-opus-4.5)
    OPENCLAW_MODEL="anthropic/claude-opus-4-20250514"
    ;;
  claude-sonnet-4-20250514|claude-sonnet-4.5)
    OPENCLAW_MODEL="anthropic/claude-sonnet-4-20250514"
    ;;
  gpt-5|gpt-5.2)
    OPENCLAW_MODEL="openai/gpt-5.2"
    ;;
  gpt-4o)
    OPENCLAW_MODEL="openai/gpt-4o"
    ;;
  gemini-2.0-flash-exp|gemini-3-flash)
    OPENCLAW_MODEL="google/gemini-2.0-flash-exp"
    ;;
esac

echo "Resolved OpenClaw model: $OPENCLAW_MODEL"

# Create .env file for API keys (OpenClaw reads from ~/.openclaw/.env)
cat > /root/.openclaw/.env <<EOF
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
OPENAI_API_KEY=${OPENAI_API_KEY}
GOOGLE_API_KEY=${GOOGLE_API_KEY}
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
EOF

# Generate OpenClaw config
# Note: We use literal values here, not ${} substitution (which OpenClaw would try to resolve)
cat > /root/.openclaw/openclaw.json <<ENDOFCONFIG
{
  "gateway": {
    "mode": "local",
    "controlUi": {
      "allowedOrigins": ["*"],
      "dangerouslyAllowHostHeaderOriginFallback": true
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "${OPENCLAW_MODEL}"
      },
      "workspace": "/openclaw/workspace"
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
ENDOFCONFIG

echo "=== Config generated ==="
cat /root/.openclaw/openclaw.json
echo ""
echo "=== Starting OpenClaw Gateway ==="

# Create workspace directory
mkdir -p /openclaw/workspace

exec openclaw gateway --bind lan --port ${PORT:-8080}
