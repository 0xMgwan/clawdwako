const axios = require('axios');
const { VM } = require('vm2');
const cheerio = require('cheerio');

// Tool definitions for Claude, GPT, and Gemini
const TOOL_DEFINITIONS = {
  web_search: {
    name: 'web_search',
    description: 'Search the web for current information. Use this when you need up-to-date information or facts.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query'
        }
      },
      required: ['query']
    }
  },
  web_scrape: {
    name: 'web_scrape',
    description: 'Fetch and extract text content from a webpage. Use this to read articles or web pages.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to scrape'
        }
      },
      required: ['url']
    }
  },
  execute_code: {
    name: 'execute_code',
    description: 'Execute JavaScript code in a sandboxed environment. Use this for calculations, data processing, or running code snippets.',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The JavaScript code to execute'
        }
      },
      required: ['code']
    }
  },
  get_current_time: {
    name: 'get_current_time',
    description: 'Get the current date and time',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
};

// Convert tool definitions to Claude format
function getClaudeTools() {
  return [
    {
      name: 'web_search',
      description: 'Search the web for current information. Use this when you need up-to-date information or facts.',
      input_schema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query'
          }
        },
        required: ['query']
      }
    },
    {
      name: 'web_scrape',
      description: 'Fetch and extract text content from a webpage. Use this to read articles or web pages.',
      input_schema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to scrape'
          }
        },
        required: ['url']
      }
    },
    {
      name: 'execute_code',
      description: 'Execute JavaScript code in a sandboxed environment. Use this for calculations, data processing, or running code snippets.',
      input_schema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'The JavaScript code to execute'
          }
        },
        required: ['code']
      }
    },
    {
      name: 'get_current_time',
      description: 'Get the current date and time',
      input_schema: {
        type: 'object',
        properties: {}
      }
    }
  ];
}

// Convert tool definitions to OpenAI/GPT format
function getGPTTools() {
  return [
    {
      type: 'function',
      function: {
        name: 'web_search',
        description: 'Search the web for current information. Use this when you need up-to-date information or facts.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query'
            }
          },
          required: ['query']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'web_scrape',
        description: 'Fetch and extract text content from a webpage. Use this to read articles or web pages.',
        parameters: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to scrape'
            }
          },
          required: ['url']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'execute_code',
        description: 'Execute JavaScript code in a sandboxed environment. Use this for calculations, data processing, or running code snippets.',
        parameters: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'The JavaScript code to execute'
            }
          },
          required: ['code']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'get_current_time',
        description: 'Get the current date and time',
        parameters: {
          type: 'object',
          properties: {}
        }
      }
    }
  ];
}

// Convert tool definitions to Gemini format
function getGeminiTools() {
  return [
    {
      functionDeclarations: [
        {
          name: 'web_search',
          description: 'Search the web for current information. Use this when you need up-to-date information or facts.',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query'
              }
            },
            required: ['query']
          }
        },
        {
          name: 'web_scrape',
          description: 'Fetch and extract text content from a webpage. Use this to read articles or web pages.',
          parameters: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The URL to scrape'
              }
            },
            required: ['url']
          }
        },
        {
          name: 'execute_code',
          description: 'Execute JavaScript code in a sandboxed environment. Use this for calculations, data processing, or running code snippets.',
          parameters: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'The JavaScript code to execute'
              }
            },
            required: ['code']
          }
        },
        {
          name: 'get_current_time',
          description: 'Get the current date and time',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      ]
    }
  ];
}

// Tool execution handlers
async function executeTool(toolName, args) {
  console.log(`🔧 Executing tool: ${toolName}`, args);
  
  try {
    switch (toolName) {
      case 'web_search':
        return await webSearch(args.query);
      
      case 'web_scrape':
        return await webScrape(args.url);
      
      case 'execute_code':
        return await executeCode(args.code);
      
      case 'get_current_time':
        return getCurrentTime();
      
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`❌ Tool execution error (${toolName}):`, error.message);
    return { error: error.message };
  }
}

// Web search using DuckDuckGo (free, no API key needed)
async function webSearch(query) {
  try {
    const response = await axios.get('https://html.duckduckgo.com/html/', {
      params: { q: query },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('.result').slice(0, 5).each((i, elem) => {
      const title = $(elem).find('.result__title').text().trim();
      const snippet = $(elem).find('.result__snippet').text().trim();
      const url = $(elem).find('.result__url').text().trim();
      
      if (title && snippet) {
        results.push({ title, snippet, url });
      }
    });

    if (results.length === 0) {
      return { error: 'No search results found' };
    }

    return {
      query,
      results,
      summary: `Found ${results.length} results for "${query}"`
    };
  } catch (error) {
    console.error('Web search error:', error.message);
    return { error: `Search failed: ${error.message}` };
  }
}

// Web scraping
async function webScrape(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000,
      maxContentLength: 1000000
    });

    const $ = cheerio.load(response.data);
    
    $('script, style, nav, footer, header, aside').remove();
    
    const title = $('title').text().trim() || $('h1').first().text().trim();
    const text = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000);

    return {
      url,
      title,
      content: text,
      length: text.length
    };
  } catch (error) {
    console.error('Web scrape error:', error.message);
    return { error: `Failed to scrape URL: ${error.message}` };
  }
}

// Safe code execution
async function executeCode(code) {
  try {
    const vm = new VM({
      timeout: 5000,
      sandbox: {
        console: {
          log: (...args) => args.join(' ')
        }
      }
    });

    const result = vm.run(code);
    
    return {
      success: true,
      result: String(result),
      code
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code
    };
  }
}

// Get current time
function getCurrentTime() {
  const now = new Date();
  return {
    timestamp: now.toISOString(),
    date: now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: now.toLocaleTimeString('en-US'),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}

module.exports = {
  TOOL_DEFINITIONS,
  getClaudeTools,
  getGPTTools,
  getGeminiTools,
  executeTool
};
