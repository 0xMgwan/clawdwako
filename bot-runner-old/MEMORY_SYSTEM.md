# 🧠 Agent Memory System

Your Telegram bots now have **persistent memory** - they remember conversations, learn about users over time, and evolve like real personal agents!

## 🎯 Memory Architecture

### **3 Types of Memory**

1. **Conversation History** - Recent messages (last 20)
   - Provides immediate context
   - Stored in `ConversationMessage` table
   - Includes tool calls and results

2. **Long-Term Memory** - Important facts & preferences
   - User name, location, preferences
   - Skills learned, tasks completed
   - Stored in `AgentMemory` table
   - Ranked by importance (1-10)

3. **Conversation Summaries** - Compressed history
   - Summarizes long conversations
   - Extracts key topics
   - Stored in `ConversationSummary` table

---

## 🔄 How It Works

### **Every Message:**

1. **Load Memory** - Agent retrieves:
   - Last 20 messages from conversation
   - All long-term memories for this user
   
2. **Inject Context** - Memory added to AI prompt:
   ```
   You are a personal AI agent with persistent memory.
   
   **Agent Memory:**
   - user_name: David
   - user_location: Dubai
   - preferred_language: JavaScript
   - preference_1234: likes building AI apps
   ```

3. **Generate Response** - AI uses memory for personalized answers

4. **Save Everything**:
   - User message → conversation history
   - AI response → conversation history
   - Extract facts → long-term memory

5. **Learn & Evolve** - Agent automatically extracts:
   - Names: "My name is David" → saves `user_name: David`
   - Preferences: "I love Python" → saves `preference: Python`
   - Location: "I live in Dubai" → saves `user_location: Dubai`
   - Skills: "I code in JavaScript" → saves `preferred_language: JavaScript`

---

## 💾 Database Schema

### **ConversationMessage**
```prisma
model ConversationMessage {
  id          String   @id
  botId       String
  chatId      String   // Telegram chat ID
  role        String   // user, assistant, system
  content     String
  toolCalls   Json?    // Tools used
  toolResults Json?    // Tool outputs
  model       String   // Which AI model
  tokenCount  Int
  createdAt   DateTime
}
```

### **AgentMemory**
```prisma
model AgentMemory {
  id           String   @id
  botId        String
  chatId       String
  memoryType   String   // fact, preference, task, context, skill
  key          String   // e.g., "user_name"
  value        String   // e.g., "David"
  importance   Int      // 1-10 (higher = more important)
  lastAccessed DateTime
  accessCount  Int      // How often accessed
  createdAt    DateTime
}
```

### **ConversationSummary**
```prisma
model ConversationSummary {
  id           String   @id
  botId        String
  chatId       String
  summary      String   // Compressed conversation
  messageCount Int
  startDate    DateTime
  endDate      DateTime
  topics       Json?    // Array of topics
}
```

---

## 🚀 Features

### **Persistent Context**
- Agent remembers past conversations
- Picks up where you left off
- No need to repeat yourself

### **Personalization**
- Learns your name, preferences, habits
- Adapts responses to your style
- Remembers your projects and goals

### **Evolution Over Time**
- Gets smarter with each conversation
- Builds knowledge about you
- Improves recommendations

### **Tool Memory**
- Remembers which tools you use
- Recalls past tool results
- Learns from tool interactions

---

## 📊 Memory Extraction Patterns

The agent automatically detects and saves:

| Pattern | Example | Saved As |
|---------|---------|----------|
| Name | "My name is David" | `user_name: David` |
| Preference | "I love Python" | `preference: Python` |
| Location | "I live in Dubai" | `user_location: Dubai` |
| Job | "I work as a developer" | `user_job: developer` |
| Language | "I code in JavaScript" | `preferred_language: JavaScript` |

---

## 🔧 API Endpoints

### **Save Message**
```bash
POST /api/memory/messages
{
  "botId": "bot_123",
  "chatId": "456789",
  "role": "user",
  "content": "Hello!",
  "model": "claude-opus-4"
}
```

### **Load History**
```bash
GET /api/memory/messages?botId=bot_123&chatId=456789&limit=20
```

### **Save Memory**
```bash
POST /api/memory/save
{
  "botId": "bot_123",
  "chatId": "456789",
  "memoryType": "fact",
  "key": "user_name",
  "value": "David",
  "importance": 9
}
```

### **Retrieve Memories**
```bash
GET /api/memory/retrieve?botId=bot_123&chatId=456789
```

---

## 💡 Example Conversations

### **First Conversation:**
```
User: Hi, my name is David and I'm a developer in Dubai
Bot: Nice to meet you, David! I'll remember that you're a developer in Dubai.
     How can I help you today?

[Saved: user_name=David, user_job=developer, user_location=Dubai]
```

### **Later Conversation:**
```
User: What's the weather like?
Bot: Let me check the weather in Dubai for you, David!
     [Uses web_search tool with "Dubai weather"]
     
[Bot remembered: name=David, location=Dubai]
```

### **Even Later:**
```
User: Can you help me code?
Bot: Of course, David! I remember you're a developer. What are you building?

[Bot remembered: user_name=David, user_job=developer]
```

---

## 🎯 Memory Importance Levels

| Level | Type | Example |
|-------|------|---------|
| 10 | Critical | User's name, core identity |
| 8-9 | Very Important | Job, location, key preferences |
| 5-7 | Important | Skills, tools, regular tasks |
| 3-4 | Useful | Minor preferences, habits |
| 1-2 | Low | Temporary context |

---

## 🔒 Privacy & Data

- **Per-User Isolation** - Each chat has separate memory
- **Bot-Specific** - Memories tied to specific bot
- **Indexed Queries** - Fast retrieval with database indexes
- **Automatic Cleanup** - Old, unused memories can be pruned

---

## 🚀 Future Enhancements

- [ ] Automatic memory pruning (remove old, low-importance memories)
- [ ] Memory search and query
- [ ] Cross-conversation insights
- [ ] Memory export/import
- [ ] Memory visualization dashboard
- [ ] Semantic memory search

---

**Your bots now have true intelligence - they remember, learn, and evolve!** 🧠✨
