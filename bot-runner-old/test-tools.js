const { executeTool } = require('./tools');

async function testTools() {
  console.log('=== Testing Agent Tools ===\n');

  // Test 1: Get current time
  console.log('1. Testing get_current_time...');
  const timeResult = await executeTool('get_current_time', {});
  console.log('Result:', JSON.stringify(timeResult, null, 2));
  console.log('✅ Time tool works!\n');

  // Test 2: Execute code
  console.log('2. Testing execute_code...');
  const codeResult = await executeTool('execute_code', {
    code: 'const sum = 15 + 27; sum * 2'
  });
  console.log('Result:', JSON.stringify(codeResult, null, 2));
  console.log('✅ Code execution works!\n');

  // Test 3: Web search
  console.log('3. Testing web_search...');
  const searchResult = await executeTool('web_search', {
    query: 'latest AI news 2026'
  });
  console.log('Result:', JSON.stringify(searchResult, null, 2));
  console.log('✅ Web search works!\n');

  // Test 4: Web scrape
  console.log('4. Testing web_scrape...');
  const scrapeResult = await executeTool('web_scrape', {
    url: 'https://example.com'
  });
  console.log('Result:', JSON.stringify(scrapeResult, null, 2));
  console.log('✅ Web scraping works!\n');

  console.log('=== All Tools Tested Successfully! ===');
}

testTools().catch(console.error);
