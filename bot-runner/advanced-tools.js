const { Octokit } = require('@octokit/rest');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

// Store for scheduled tasks
const scheduledTasks = new Map();

// Advanced tool definitions
const ADVANCED_TOOLS = {
  github_create_issue: {
    name: 'github_create_issue',
    description: 'Create an issue on a GitHub repository. Requires GitHub token.',
    parameters: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        title: { type: 'string', description: 'Issue title' },
        body: { type: 'string', description: 'Issue description' }
      },
      required: ['owner', 'repo', 'title', 'body']
    }
  },
  github_create_repo: {
    name: 'github_create_repo',
    description: 'Create a new GitHub repository. Requires GitHub token.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Repository name' },
        description: { type: 'string', description: 'Repository description' },
        private: { type: 'boolean', description: 'Make repository private' }
      },
      required: ['name']
    }
  },
  github_list_repos: {
    name: 'github_list_repos',
    description: 'List user repositories. Requires GitHub token.',
    parameters: {
      type: 'object',
      properties: {
        username: { type: 'string', description: 'GitHub username (optional)' }
      }
    }
  },
  send_email: {
    name: 'send_email',
    description: 'Send an email. Requires email credentials configured.',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject' },
        body: { type: 'string', description: 'Email body content' }
      },
      required: ['to', 'subject', 'body']
    }
  },
  schedule_task: {
    name: 'schedule_task',
    description: 'Schedule a recurring task using cron syntax. Example: "0 9 * * *" for daily at 9am.',
    parameters: {
      type: 'object',
      properties: {
        schedule: { type: 'string', description: 'Cron schedule expression' },
        task_name: { type: 'string', description: 'Name for the scheduled task' },
        action: { type: 'string', description: 'Action to perform (e.g., "send_reminder", "check_github")' }
      },
      required: ['schedule', 'task_name', 'action']
    }
  },
  list_scheduled_tasks: {
    name: 'list_scheduled_tasks',
    description: 'List all currently scheduled tasks',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  cancel_scheduled_task: {
    name: 'cancel_scheduled_task',
    description: 'Cancel a scheduled task by name',
    parameters: {
      type: 'object',
      properties: {
        task_name: { type: 'string', description: 'Name of the task to cancel' }
      },
      required: ['task_name']
    }
  },
  write_file: {
    name: 'write_file',
    description: 'Write content to a file in the workspace',
    parameters: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'File name' },
        content: { type: 'string', description: 'File content' }
      },
      required: ['filename', 'content']
    }
  },
  read_file: {
    name: 'read_file',
    description: 'Read content from a file in the workspace',
    parameters: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'File name to read' }
      },
      required: ['filename']
    }
  },
  list_files: {
    name: 'list_files',
    description: 'List files in the workspace directory',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  generate_code: {
    name: 'generate_code',
    description: 'Generate code based on requirements and save to a file',
    parameters: {
      type: 'object',
      properties: {
        language: { type: 'string', description: 'Programming language' },
        requirements: { type: 'string', description: 'Code requirements' },
        filename: { type: 'string', description: 'Output filename' }
      },
      required: ['language', 'requirements', 'filename']
    }
  }
};

// Convert to Claude format
function getAdvancedClaudeTools() {
  return Object.values(ADVANCED_TOOLS).map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters
  }));
}

// Convert to GPT format
function getAdvancedGPTTools() {
  return Object.values(ADVANCED_TOOLS).map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }));
}

// Convert to Gemini format
function getAdvancedGeminiTools() {
  return [{
    functionDeclarations: Object.values(ADVANCED_TOOLS).map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }))
  }];
}

// Execute advanced tools
async function executeAdvancedTool(toolName, args, config = {}) {
  console.log(`🔧 Executing advanced tool: ${toolName}`, args);
  
  try {
    switch (toolName) {
      case 'github_create_issue':
        return await githubCreateIssue(args, config.githubToken);
      
      case 'github_create_repo':
        return await githubCreateRepo(args, config.githubToken);
      
      case 'github_list_repos':
        return await githubListRepos(args, config.githubToken);
      
      case 'send_email':
        return await sendEmail(args, config.emailConfig);
      
      case 'schedule_task':
        return await scheduleTask(args);
      
      case 'list_scheduled_tasks':
        return listScheduledTasks();
      
      case 'cancel_scheduled_task':
        return cancelScheduledTask(args.task_name);
      
      case 'write_file':
        return await writeFile(args.filename, args.content);
      
      case 'read_file':
        return await readFile(args.filename);
      
      case 'list_files':
        return await listFiles();
      
      case 'generate_code':
        return await generateCode(args);
      
      default:
        return { error: `Unknown advanced tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`❌ Advanced tool execution error (${toolName}):`, error.message);
    return { error: error.message };
  }
}

// GitHub: Create Issue
async function githubCreateIssue(args, token) {
  if (!token) {
    return { error: 'GitHub token not configured. Set GITHUB_TOKEN environment variable.' };
  }

  const octokit = new Octokit({ auth: token });
  
  const { data } = await octokit.rest.issues.create({
    owner: args.owner,
    repo: args.repo,
    title: args.title,
    body: args.body
  });

  return {
    success: true,
    issue_number: data.number,
    url: data.html_url,
    message: `Issue #${data.number} created successfully`
  };
}

// GitHub: Create Repository
async function githubCreateRepo(args, token) {
  if (!token) {
    return { error: 'GitHub token not configured. Set GITHUB_TOKEN environment variable.' };
  }

  const octokit = new Octokit({ auth: token });
  
  const { data } = await octokit.rest.repos.createForAuthenticatedUser({
    name: args.name,
    description: args.description || '',
    private: args.private || false
  });

  return {
    success: true,
    repo_name: data.full_name,
    url: data.html_url,
    clone_url: data.clone_url,
    message: `Repository ${data.full_name} created successfully`
  };
}

// GitHub: List Repositories
async function githubListRepos(args, token) {
  if (!token) {
    return { error: 'GitHub token not configured. Set GITHUB_TOKEN environment variable.' };
  }

  const octokit = new Octokit({ auth: token });
  
  const { data } = args.username
    ? await octokit.rest.repos.listForUser({ username: args.username, per_page: 10 })
    : await octokit.rest.repos.listForAuthenticatedUser({ per_page: 10 });

  const repos = data.map(repo => ({
    name: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    stars: repo.stargazers_count,
    language: repo.language
  }));

  return {
    success: true,
    count: repos.length,
    repositories: repos
  };
}

// Email: Send Email
async function sendEmail(args, emailConfig) {
  if (!emailConfig || !emailConfig.user || !emailConfig.pass) {
    return { 
      error: 'Email not configured. Set EMAIL_USER and EMAIL_PASS environment variables.',
      note: 'For Gmail: use App Password from https://myaccount.google.com/apppasswords'
    };
  }

  const transporter = nodemailer.createTransport({
    service: emailConfig.service || 'gmail',
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass
    }
  });

  const info = await transporter.sendMail({
    from: emailConfig.user,
    to: args.to,
    subject: args.subject,
    text: args.body,
    html: `<p>${args.body.replace(/\n/g, '<br>')}</p>`
  });

  return {
    success: true,
    messageId: info.messageId,
    message: `Email sent to ${args.to}`
  };
}

// Cron: Schedule Task
async function scheduleTask(args) {
  if (!cron.validate(args.schedule)) {
    return { error: `Invalid cron expression: ${args.schedule}` };
  }

  if (scheduledTasks.has(args.task_name)) {
    return { error: `Task "${args.task_name}" already exists. Cancel it first.` };
  }

  const task = cron.schedule(args.schedule, () => {
    console.log(`⏰ Executing scheduled task: ${args.task_name} - ${args.action}`);
    // Task execution logic here
  });

  scheduledTasks.set(args.task_name, {
    schedule: args.schedule,
    action: args.action,
    task: task,
    created: new Date().toISOString()
  });

  return {
    success: true,
    task_name: args.task_name,
    schedule: args.schedule,
    message: `Task "${args.task_name}" scheduled successfully`
  };
}

// Cron: List Scheduled Tasks
function listScheduledTasks() {
  const tasks = Array.from(scheduledTasks.entries()).map(([name, info]) => ({
    name,
    schedule: info.schedule,
    action: info.action,
    created: info.created
  }));

  return {
    success: true,
    count: tasks.length,
    tasks
  };
}

// Cron: Cancel Scheduled Task
function cancelScheduledTask(taskName) {
  const taskInfo = scheduledTasks.get(taskName);
  
  if (!taskInfo) {
    return { error: `Task "${taskName}" not found` };
  }

  taskInfo.task.stop();
  scheduledTasks.delete(taskName);

  return {
    success: true,
    message: `Task "${taskName}" cancelled successfully`
  };
}

// File: Write File
async function writeFile(filename, content) {
  const workspacePath = process.env.WORKSPACE_PATH || '/tmp/bot-workspace';
  
  try {
    await fs.mkdir(workspacePath, { recursive: true });
    const filePath = path.join(workspacePath, filename);
    await fs.writeFile(filePath, content, 'utf8');

    return {
      success: true,
      filename,
      path: filePath,
      size: content.length,
      message: `File "${filename}" written successfully`
    };
  } catch (error) {
    return { error: `Failed to write file: ${error.message}` };
  }
}

// File: Read File
async function readFile(filename) {
  const workspacePath = process.env.WORKSPACE_PATH || '/tmp/bot-workspace';
  const filePath = path.join(workspacePath, filename);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');

    return {
      success: true,
      filename,
      content,
      size: content.length
    };
  } catch (error) {
    return { error: `Failed to read file: ${error.message}` };
  }
}

// File: List Files
async function listFiles() {
  const workspacePath = process.env.WORKSPACE_PATH || '/tmp/bot-workspace';
  
  try {
    await fs.mkdir(workspacePath, { recursive: true });
    const files = await fs.readdir(workspacePath);
    
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const stats = await fs.stat(path.join(workspacePath, file));
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          isDirectory: stats.isDirectory()
        };
      })
    );

    return {
      success: true,
      workspace: workspacePath,
      count: fileDetails.length,
      files: fileDetails
    };
  } catch (error) {
    return { error: `Failed to list files: ${error.message}` };
  }
}

// Code Generation
async function generateCode(args) {
  // This is a placeholder - in production, you'd use the AI model to generate code
  const codeTemplates = {
    javascript: `// ${args.requirements}\n\nfunction main() {\n  // TODO: Implement\n  console.log('Generated code');\n}\n\nmain();`,
    python: `# ${args.requirements}\n\ndef main():\n    # TODO: Implement\n    print('Generated code')\n\nif __name__ == '__main__':\n    main()`,
    html: `<!DOCTYPE html>\n<html>\n<head>\n  <title>${args.requirements}</title>\n</head>\n<body>\n  <h1>Generated Page</h1>\n</body>\n</html>`
  };

  const code = codeTemplates[args.language.toLowerCase()] || `// ${args.requirements}\n// Code generation for ${args.language}`;
  
  const writeResult = await writeFile(args.filename, code);
  
  if (writeResult.error) {
    return writeResult;
  }

  return {
    success: true,
    language: args.language,
    filename: args.filename,
    code,
    message: `Code generated and saved to ${args.filename}`
  };
}

module.exports = {
  ADVANCED_TOOLS,
  getAdvancedClaudeTools,
  getAdvancedGPTTools,
  getAdvancedGeminiTools,
  executeAdvancedTool
};
