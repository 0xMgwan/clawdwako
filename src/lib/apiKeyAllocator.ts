/**
 * API Key Allocator - Round-Robin Distribution
 * 
 * Distributes platform API keys across users using a consistent hash-based allocation.
 * Each user gets assigned to a specific key based on their user ID, ensuring:
 * - Same user always gets the same key (consistency)
 * - Keys are distributed evenly across users (load balancing)
 * - No database changes required
 */

type Provider = 'anthropic' | 'openai' | 'google';

/**
 * Allocate an API key for a specific provider and user
 * @param provider - The AI provider (anthropic, openai, google)
 * @param userId - The user's unique ID
 * @returns The allocated API key
 */
export function allocateApiKey(provider: Provider, userId: string): string {
  const envKey = getEnvKeyName(provider);
  const keysString = process.env[envKey] || '';
  
  // Parse comma-separated keys
  const keys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
  
  if (keys.length === 0) {
    throw new Error(`No ${provider} API keys configured. Please set ${envKey} in your environment.`);
  }
  
  // If only one key, return it
  if (keys.length === 1) {
    return keys[0];
  }
  
  // Use consistent hashing to assign user to a key
  const userHash = hashString(userId);
  const keyIndex = userHash % keys.length;
  
  console.log(`🔑 Allocated ${provider} key #${keyIndex + 1}/${keys.length} for user ${userId.substring(0, 8)}...`);
  
  return keys[keyIndex];
}

/**
 * Get all available API keys for a provider (for testing/admin purposes)
 * @param provider - The AI provider
 * @returns Array of API keys
 */
export function getAllKeys(provider: Provider): string[] {
  const envKey = getEnvKeyName(provider);
  const keysString = process.env[envKey] || '';
  return keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
}

/**
 * Get the count of available keys for a provider
 * @param provider - The AI provider
 * @returns Number of keys available
 */
export function getKeyCount(provider: Provider): number {
  return getAllKeys(provider).length;
}

/**
 * Get the environment variable name for a provider
 */
function getEnvKeyName(provider: Provider): string {
  switch (provider) {
    case 'anthropic':
      return 'PLATFORM_ANTHROPIC_API_KEYS';
    case 'openai':
      return 'PLATFORM_OPENAI_API_KEYS';
    case 'google':
      return 'PLATFORM_GOOGLE_API_KEYS';
  }
}

/**
 * Simple hash function for consistent key allocation
 * Uses DJB2 hash algorithm
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
  }
  return Math.abs(hash);
}
