# Environment Variables Setup

## API Key Configuration

### Round-Robin API Key Allocation

The platform now supports **multiple API keys per provider** with automatic round-robin allocation. This distributes users across different API keys to avoid rate limits and improve reliability.

### Configuration Format

Add comma-separated API keys to your `.env.local` file:

```bash
# Anthropic (Claude) API Keys - Multiple keys for load balancing
PLATFORM_ANTHROPIC_API_KEYS=sk-ant-key1,sk-ant-key2,sk-ant-key3,sk-ant-key4,sk-ant-key5

# OpenAI (GPT) API Keys - Multiple keys for load balancing
PLATFORM_OPENAI_API_KEYS=sk-proj-key1,sk-proj-key2,sk-proj-key3,sk-proj-key4,sk-proj-key5

# Google (Gemini) API Keys - Multiple keys for load balancing
PLATFORM_GOOGLE_API_KEYS=AIza-key1,AIza-key2,AIza-key3,AIza-key4,AIza-key5
```

### How It Works

1. **User-based allocation**: Each user gets assigned to a specific API key based on their user ID
2. **Consistent assignment**: The same user always gets the same key (using hash-based allocation)
3. **Even distribution**: Keys are distributed evenly across all users
4. **Automatic fallback**: If only one key is provided, all users share that key

### Example Configurations

**Single key per provider** (old format - still works):
```bash
PLATFORM_ANTHROPIC_API_KEYS=sk-ant-api03-your-single-key
PLATFORM_OPENAI_API_KEYS=sk-proj-your-single-key
PLATFORM_GOOGLE_API_KEYS=AIza-your-single-key
```

**Multiple keys per provider** (recommended):
```bash
PLATFORM_ANTHROPIC_API_KEYS=sk-ant-key1,sk-ant-key2,sk-ant-key3
PLATFORM_OPENAI_API_KEYS=sk-proj-key1,sk-proj-key2,sk-proj-key3
PLATFORM_GOOGLE_API_KEYS=AIza-key1,AIza-key2,AIza-key3
```

**Mixed configuration** (some providers with multiple keys):
```bash
PLATFORM_ANTHROPIC_API_KEYS=sk-ant-key1,sk-ant-key2,sk-ant-key3,sk-ant-key4,sk-ant-key5
PLATFORM_OPENAI_API_KEYS=sk-proj-single-key
PLATFORM_GOOGLE_API_KEYS=AIza-key1,AIza-key2
```

### Benefits

- **Rate limit avoidance**: Distribute API calls across multiple keys
- **Better reliability**: If one key hits limits, other users continue working
- **Cost management**: Track usage per key more easily
- **Scalability**: Add more keys as your user base grows

### Monitoring

The system logs which key is allocated to each user:
```
🔑 Allocated anthropic key #3/5 for user abc12345...
```

This helps you monitor key distribution and usage patterns.
