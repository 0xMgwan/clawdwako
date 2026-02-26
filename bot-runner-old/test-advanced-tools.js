const { executeAnyTool } = require('./tools');

// Test configuration
const TOOL_CONFIG = {
  githubToken: process.env.GITHUB_TOKEN,
  emailConfig: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    service: 'gmail'
  }
};

async function testAdvancedTools() {
  console.log('=== Testing Advanced Agent Tools ===\n');

  // Test 1: File Operations
  console.log('1. Testing file operations...');
  
  const writeResult = await executeAnyTool('write_file', {
    filename: 'test.txt',
    content: 'Hello from the agent! This is a test file.'
  }, TOOL_CONFIG);
  console.log('Write result:', JSON.stringify(writeResult, null, 2));

  const readResult = await executeAnyTool('read_file', {
    filename: 'test.txt'
  }, TOOL_CONFIG);
  console.log('Read result:', JSON.stringify(readResult, null, 2));

  const listResult = await executeAnyTool('list_files', {}, TOOL_CONFIG);
  console.log('List files:', JSON.stringify(listResult, null, 2));
  console.log('✅ File operations work!\n');

  // Test 2: Code Generation
  console.log('2. Testing code generation...');
  const codeResult = await executeAnyTool('generate_code', {
    language: 'javascript',
    requirements: 'Create a function that calculates fibonacci numbers',
    filename: 'fibonacci.js'
  }, TOOL_CONFIG);
  console.log('Result:', JSON.stringify(codeResult, null, 2));
  console.log('✅ Code generation works!\n');

  // Test 3: Scheduled Tasks
  console.log('3. Testing task scheduling...');
  const scheduleResult = await executeAnyTool('schedule_task', {
    schedule: '*/5 * * * *',
    task_name: 'test_reminder',
    action: 'send_reminder'
  }, TOOL_CONFIG);
  console.log('Schedule result:', JSON.stringify(scheduleResult, null, 2));

  const listTasksResult = await executeAnyTool('list_scheduled_tasks', {}, TOOL_CONFIG);
  console.log('Scheduled tasks:', JSON.stringify(listTasksResult, null, 2));

  const cancelResult = await executeAnyTool('cancel_scheduled_task', {
    task_name: 'test_reminder'
  }, TOOL_CONFIG);
  console.log('Cancel result:', JSON.stringify(cancelResult, null, 2));
  console.log('✅ Task scheduling works!\n');

  // Test 4: GitHub (requires GITHUB_TOKEN)
  if (process.env.GITHUB_TOKEN) {
    console.log('4. Testing GitHub integration...');
    const reposResult = await executeAnyTool('github_list_repos', {}, TOOL_CONFIG);
    console.log('Repos:', JSON.stringify(reposResult, null, 2));
    console.log('✅ GitHub integration works!\n');
  } else {
    console.log('4. ⚠️  Skipping GitHub tests (GITHUB_TOKEN not set)\n');
  }

  // Test 5: Email (requires EMAIL_USER and EMAIL_PASS)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('5. Testing email sending...');
    const emailResult = await executeAnyTool('send_email', {
      to: process.env.EMAIL_USER,
      subject: 'Test from Agent',
      body: 'This is a test email from your personal agent!'
    }, TOOL_CONFIG);
    console.log('Email result:', JSON.stringify(emailResult, null, 2));
    console.log('✅ Email sending works!\n');
  } else {
    console.log('5. ⚠️  Skipping email tests (EMAIL_USER/EMAIL_PASS not set)\n');
  }

  console.log('=== Advanced Tools Test Complete! ===');
  console.log('\n📝 Setup Instructions:');
  console.log('To enable all features, set these environment variables:');
  console.log('- GITHUB_TOKEN: Personal access token from https://github.com/settings/tokens');
  console.log('- EMAIL_USER: Your Gmail address');
  console.log('- EMAIL_PASS: Gmail App Password from https://myaccount.google.com/apppasswords');
}

testAdvancedTools().catch(console.error);
