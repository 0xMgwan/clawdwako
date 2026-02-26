# 🤖 Personal Agent Capabilities

Your Telegram bots now have **full personal agent capabilities** similar to OpenClaw, with access to GitHub, email, file operations, code generation, task scheduling, and more!

## 🛠️ Available Tools

### **Basic Tools** (No configuration needed)

1. **`web_search`** - Search the web using DuckDuckGo
   - Example: "Search for latest AI news"
   
2. **`web_scrape`** - Extract content from any webpage
   - Example: "Summarize this article: https://example.com"
   
3. **`execute_code`** - Run JavaScript code in sandboxed environment
   - Example: "Calculate 15% tip on $87.50"
   
4. **`get_current_time`** - Get current date/time with timezone
   - Example: "What time is it?"

### **GitHub Integration** (Requires `GITHUB_TOKEN`)

5. **`github_create_issue`** - Create issues on repositories
   - Example: "Create an issue on my repo about bug XYZ"
   
6. **`github_create_repo`** - Create new repositories
   - Example: "Create a new private repo called 'my-project'"
   
7. **`github_list_repos`** - List your repositories
   - Example: "Show me my GitHub repos"

### **Email Automation** (Requires `EMAIL_USER` & `EMAIL_PASS`)

8. **`send_email`** - Send emails via SMTP
   - Example: "Send an email to john@example.com about the meeting"

### **File Operations** (Works in bot workspace)

9. **`write_file`** - Create/write files
   - Example: "Write a TODO list to tasks.txt"
   
10. **`read_file`** - Read file contents
    - Example: "Read my notes.txt file"
    
11. **`list_files`** - List all workspace files
    - Example: "Show me all my files"

### **Code Generation**

12. **`generate_code`** - Generate code and save to files
    - Example: "Generate a Python script to parse CSV files"

### **Task Scheduling** (Cron jobs)

13. **`schedule_task`** - Schedule recurring tasks
    - Example: "Remind me daily at 9am to check emails"
    
14. **`list_scheduled_tasks`** - View all scheduled tasks
    - Example: "What tasks are scheduled?"
    
15. **`cancel_scheduled_task`** - Cancel a scheduled task
    - Example: "Cancel the daily reminder"

## 🔧 Configuration

### Environment Variables

Set these in your Railway deployment or `.env` file:

```bash
# GitHub Integration
GITHUB_TOKEN=ghp_your_token_here

# Email Integration (Gmail)
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_SERVICE=gmail

# Workspace (optional, defaults to /tmp/bot-workspace)
WORKSPACE_PATH=/path/to/workspace
```

### How to Get Credentials

**GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `user`
4. Copy the token

**Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Create a new app password
3. Copy the 16-character password

## 💡 Example Use Cases

### Personal Assistant
- "Search for restaurants near me and email me the top 3"
- "Create a GitHub issue to track this bug"
- "Schedule a daily reminder at 8am to review my tasks"

### Code Helper
- "Generate a Python script to scrape this website and save to CSV"
- "Write a Node.js function to calculate compound interest"
- "Read my config.json file and explain what it does"

### Project Management
- "Create a new GitHub repo for my blog project"
- "List all my repositories and show me which ones need updates"
- "Send an email to my team with today's progress"

### Automation
- "Schedule a weekly task to check my GitHub stars"
- "Every day at 5pm, remind me to commit my code"
- "Set up a cron job to backup my files"

## 🚀 How It Works

Your bot uses **agentic loops** with up to 5 tool calls per message:

1. User sends message
2. AI decides which tools to use
3. Tools execute and return results
4. AI processes results and may call more tools
5. Final response sent to user

All tools work with **Claude**, **GPT**, and **Gemini** models!

## 🔒 Security

- Code execution is sandboxed (VM2)
- File operations limited to workspace directory
- GitHub/Email require explicit token configuration
- All credentials stored as environment variables

## 📊 Workspace

Files are stored in `/tmp/bot-workspace` by default. Each bot has its own workspace where it can:
- Create and manage files
- Generate code
- Store data between conversations

## 🎯 Next Steps

1. **Set up credentials** - Add GitHub token and email credentials to Railway
2. **Test locally** - Run `node test-advanced-tools.js` to verify
3. **Deploy** - Push to GitHub and redeploy on Railway
4. **Start using** - Your bot is now a full personal agent!

---

**Your bots are now true AI agents with execution capabilities, not just chat assistants!** 🦞
