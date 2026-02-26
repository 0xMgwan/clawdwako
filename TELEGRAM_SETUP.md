# 🤖 Telegram Bot Command Menu Setup

To get the command menu like OpenClaw (the menu button that shows all commands), you need to configure it in BotFather.

## Steps to Add Command Menu

1. **Open Telegram and find @BotFather**

2. **Send this command:**
   ```
   /setcommands
   ```

3. **Select your bot** from the list

4. **Paste this exact text:**
   ```
   start - Welcome message and quick start
   help - See all agent capabilities and tools
   skills - View detailed list of 16 available tools
   memory - Check what the agent remembers about you
   ```

5. **Press Send**

6. **Done!** Now when users click the menu button (☰) in your bot, they'll see all commands

## What Each Command Does

- **/start** - Welcome message with overview
- **/help** - Full capabilities list with examples
- **/skills** - Detailed tool reference (all 16 tools)
- **/memory** - View saved memories and preferences

## Testing

After setup, users will see:
- Menu button (☰) next to the message input
- Click it to see all 4 commands
- Click any command to execute it

---

**Note:** The commands are already coded in your bot. This just makes them visible in the Telegram UI menu.
