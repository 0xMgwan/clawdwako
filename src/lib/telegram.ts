import axios from 'axios';

export interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

export interface TelegramVerificationResult {
  valid: boolean;
  botInfo?: TelegramBotInfo;
  error?: string;
}

export async function verifyTelegramBotToken(
  token: string
): Promise<TelegramVerificationResult> {
  try {
    // Validate token format
    if (!token || typeof token !== 'string') {
      return {
        valid: false,
        error: 'Invalid token format',
      };
    }

    // Token should be in format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
    const tokenRegex = /^\d+:[A-Za-z0-9_-]+$/;
    if (!tokenRegex.test(token)) {
      return {
        valid: false,
        error: 'Token format is incorrect. Should be: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
      };
    }

    // Call Telegram API to verify token
    const response = await axios.get(
      `https://api.telegram.org/bot${token}/getMe`,
      {
        timeout: 10000,
      }
    );

    if (response.data.ok && response.data.result) {
      const botInfo: TelegramBotInfo = response.data.result;

      // Verify it's actually a bot
      if (!botInfo.is_bot) {
        return {
          valid: false,
          error: 'This token does not belong to a bot account',
        };
      }

      return {
        valid: true,
        botInfo,
      };
    }

    return {
      valid: false,
      error: 'Unable to verify bot token',
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      return {
        valid: false,
        error: 'Invalid bot token. Please check your token from @BotFather',
      };
    }

    if (error.response?.status === 404) {
      return {
        valid: false,
        error: 'Bot not found. Please create a bot with @BotFather first',
      };
    }

    return {
      valid: false,
      error: error.message || 'Failed to verify bot token',
    };
  }
}

export async function setTelegramWebhook(
  token: string,
  webhookUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }
    );

    if (response.data.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: response.data.description || 'Failed to set webhook',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to set webhook',
    };
  }
}

export async function deleteTelegramWebhook(
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${token}/deleteWebhook`
    );

    if (response.data.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: response.data.description || 'Failed to delete webhook',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete webhook',
    };
  }
}
