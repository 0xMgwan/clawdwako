# API Keys Configuration Format

Use this format in your `.env` file to add multiple API keys for each AI provider.

## Format

```bash
# Anthropic API Keys (Claude)
# Separate multiple keys with commas
ANTHROPIC_API_KEY="sk-ant-api03-xxx,sk-ant-api03-yyy,sk-ant-api03-zzz"

# OpenAI API Keys (GPT)
# Separate multiple keys with commas
OPENAI_API_KEY="sk-proj-xxx,sk-proj-yyy,sk-proj-zzz"

# Google AI API Keys (Gemini)
# Separate multiple keys with commas
GOOGLE_AI_API_KEY="AIzaSyxxx,AIzaSyyyy,AIzaSyzzz"
```

## Example with Multiple Keys

```bash
# AI API Keys (for deployed bots)

# Anthropic - Add as many keys as you want, separated by commas
ANTHROPIC_API_KEY="sk-ant-api03-rEEbltgWqwNTpS,sk-ant-api03-anotherkey123,sk-ant-api03-thirdkey456"

# OpenAI - Add as many keys as you want, separated by commas
OPENAI_API_KEY="sk-proj-GY14tbhayCL6ReTh3mI7x2,sk-proj-anotherkey789,sk-proj-thirdkey012"

# Google AI - Add as many keys as you want, separated by commas
GOOGLE_AI_API_KEY="AIzaSyDxxx,AIzaSyDyyy,AIzaSyDzzz"
```

## How It Works

The system will:
1. **Parse** the comma-separated keys
2. **Rotate** through them automatically
3. **Load balance** API requests across all keys
4. **Fallback** to next key if one fails or hits rate limits

## Benefits

✅ **Load Balancing** - Distribute requests across multiple keys  
✅ **Rate Limit Protection** - Automatically switch keys when limits hit  
✅ **High Availability** - If one key fails, others take over  
✅ **Cost Distribution** - Spread costs across multiple accounts  
✅ **Scalability** - Add more keys as your platform grows  

## Adding New Keys

Just append to the existing list:

```bash
# Before
ANTHROPIC_API_KEY="sk-ant-api03-key1"

# After (add key2 and key3)
ANTHROPIC_API_KEY="sk-ant-api03-key1,sk-ant-api03-key2,sk-ant-api03-key3"
```

## Important Notes

- **No spaces** between keys and commas
- **Keep quotes** around the entire string
- **Test each key** individually before adding to production
- **Rotate keys regularly** for security
- **Monitor usage** across all keys in your provider dashboards

## Security Best Practices

1. Never commit `.env` files to Git
2. Use different keys for development and production
3. Set up billing alerts for each API key
4. Rotate keys every 90 days
5. Revoke unused keys immediately
