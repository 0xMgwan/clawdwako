FROM node:18-alpine

WORKDIR /app

# Copy package files from bot-runner directory
COPY bot-runner/package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code from bot-runner directory
COPY bot-runner/ .

# Start the bot
CMD ["npm", "start"]
