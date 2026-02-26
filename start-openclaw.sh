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

# If model doesn't already contain a slash (provider/model), map it
if [[ "$OPENCLAW_MODEL" != *"/"* ]]; then
  case "$OPENCLAW_MODEL" in
    claude-opus-4-20250514|claude-opus-4.5)
      OPENCLAW_MODEL="anthropic/claude-opus-4-20250514"
      ;;
    claude-sonnet-4-20250514|claude-sonnet-4.5)
      OPENCLAW_MODEL="anthropic/claude-sonnet-4-20250514"
      ;;
    claude-3-opus-20240229)
      OPENCLAW_MODEL="anthropic/claude-3-opus-20240229"
      ;;
    claude-3-sonnet-20240229)
      OPENCLAW_MODEL="anthropic/claude-3-sonnet-20240229"
      ;;
    claude-3-haiku-20240307)
      OPENCLAW_MODEL="anthropic/claude-3-haiku-20240307"
      ;;
    gpt-5|gpt-5.2)
      OPENCLAW_MODEL="openai/gpt-5.2"
      ;;
    gpt-4o)
      OPENCLAW_MODEL="openai/gpt-4o"
      ;;
    gpt-4-turbo)
      OPENCLAW_MODEL="openai/gpt-4-turbo"
      ;;
    gpt-3.5-turbo*)
      OPENCLAW_MODEL="openai/$OPENCLAW_MODEL"
      ;;
    gemini-2.0-flash-exp|gemini-3-flash)
      OPENCLAW_MODEL="google/gemini-2.0-flash-exp"
      ;;
    gemini-1.5-pro*)
      OPENCLAW_MODEL="google/$OPENCLAW_MODEL"
      ;;
    gemini-1.5-flash*)
      OPENCLAW_MODEL="google/$OPENCLAW_MODEL"
      ;;
    gemini-1.0-pro)
      OPENCLAW_MODEL="google/gemini-1.0-pro"
      ;;
    *)
      # Default: assume anthropic if starts with claude, openai if starts with gpt, google if starts with gemini
      if [[ "$OPENCLAW_MODEL" == claude* ]]; then
        OPENCLAW_MODEL="anthropic/$OPENCLAW_MODEL"
      elif [[ "$OPENCLAW_MODEL" == gpt* ]]; then
        OPENCLAW_MODEL="openai/$OPENCLAW_MODEL"
      elif [[ "$OPENCLAW_MODEL" == gemini* ]]; then
        OPENCLAW_MODEL="google/$OPENCLAW_MODEL"
      fi
      ;;
  esac
fi

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
