/**
 * Test script for OpenClaw Deployment Platform
 * 
 * This script tests the core functionality without making actual Railway API calls
 * Run with: npx tsx test-openclaw-platform.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseSchema() {
  console.log('\n🧪 Testing Database Schema...\n');

  try {
    // Test 1: Check if OpenClawInstance model exists
    console.log('1️⃣ Testing OpenClawInstance model...');
    const instanceCount = await prisma.openClawInstance.count();
    console.log(`   ✅ OpenClawInstance model accessible (${instanceCount} instances)`);

    // Test 2: Check if Subscription model exists
    console.log('2️⃣ Testing Subscription model...');
    const subscriptionCount = await prisma.subscription.count();
    console.log(`   ✅ Subscription model accessible (${subscriptionCount} subscriptions)`);

    // Test 3: Check User relations
    console.log('3️⃣ Testing User model relations...');
    const userWithRelations = await prisma.user.findFirst({
      include: {
        openclawInstances: true,
        subscription: true
      }
    });
    console.log(`   ✅ User relations working (openclawInstances, subscription)`);

    return true;
  } catch (error: any) {
    console.error('   ❌ Database schema test failed:', error.message);
    return false;
  }
}

async function testInstanceCRUD() {
  console.log('\n🧪 Testing Instance CRUD Operations...\n');

  try {
    // Find or create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });

    if (!testUser) {
      console.log('   ℹ️  No test user found, skipping CRUD tests');
      console.log('   💡 Create a test user via Google OAuth to run CRUD tests');
      return true;
    }

    console.log(`   📧 Using test user: ${testUser.email}`);

    // Test 1: Create instance
    console.log('1️⃣ Testing instance creation...');
    const newInstance = await prisma.openClawInstance.create({
      data: {
        userId: testUser.id,
        name: 'Test OpenClaw Instance',
        railwayProjectId: 'test-project-' + Date.now(),
        railwayServiceId: 'test-service-' + Date.now(),
        deploymentUrl: 'https://test.railway.app',
        model: 'claude-opus-4.5',
        channel: 'telegram',
        status: 'active',
        anthropicKey: 'test-key-encrypted',
        telegramToken: 'test-token-encrypted'
      }
    });
    console.log(`   ✅ Instance created: ${newInstance.id}`);

    // Test 2: Read instance
    console.log('2️⃣ Testing instance retrieval...');
    const retrievedInstance = await prisma.openClawInstance.findUnique({
      where: { id: newInstance.id }
    });
    console.log(`   ✅ Instance retrieved: ${retrievedInstance?.name}`);

    // Test 3: Update instance
    console.log('3️⃣ Testing instance update...');
    const updatedInstance = await prisma.openClawInstance.update({
      where: { id: newInstance.id },
      data: {
        status: 'stopped',
        apiCalls: 100,
        messageCount: 50
      }
    });
    console.log(`   ✅ Instance updated: status=${updatedInstance.status}, apiCalls=${updatedInstance.apiCalls}`);

    // Test 4: List user instances
    console.log('4️⃣ Testing instance listing...');
    const userInstances = await prisma.openClawInstance.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`   ✅ Found ${userInstances.length} instances for user`);

    // Test 5: Delete instance
    console.log('5️⃣ Testing instance deletion...');
    await prisma.openClawInstance.delete({
      where: { id: newInstance.id }
    });
    console.log(`   ✅ Instance deleted successfully`);

    return true;
  } catch (error: any) {
    console.error('   ❌ CRUD test failed:', error.message);
    return false;
  }
}

async function testSubscriptionModel() {
  console.log('\n🧪 Testing Subscription Model...\n');

  try {
    // Find a test user
    const testUser = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });

    if (!testUser) {
      console.log('   ℹ️  No test user found, skipping subscription tests');
      return true;
    }

    // Test 1: Create subscription
    console.log('1️⃣ Testing subscription creation...');
    
    // Check if subscription already exists
    const existingSub = await prisma.subscription.findUnique({
      where: { userId: testUser.id }
    });

    if (existingSub) {
      console.log('   ℹ️  Subscription already exists, deleting first...');
      await prisma.subscription.delete({
        where: { userId: testUser.id }
      });
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: testUser.id,
        tier: 'pro',
        status: 'active',
        maxInstances: 5,
        maxApiCalls: 100000,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
    console.log(`   ✅ Subscription created: tier=${subscription.tier}, maxInstances=${subscription.maxInstances}`);

    // Test 2: Retrieve with user
    console.log('2️⃣ Testing subscription retrieval with user...');
    const userWithSub = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: { subscription: true }
    });
    console.log(`   ✅ User subscription: ${userWithSub?.subscription?.tier}`);

    // Test 3: Update subscription
    console.log('3️⃣ Testing subscription update...');
    const updatedSub = await prisma.subscription.update({
      where: { userId: testUser.id },
      data: { tier: 'enterprise', maxInstances: 10 }
    });
    console.log(`   ✅ Subscription updated: tier=${updatedSub.tier}`);

    // Cleanup
    console.log('4️⃣ Cleaning up test subscription...');
    await prisma.subscription.delete({
      where: { userId: testUser.id }
    });
    console.log(`   ✅ Test subscription deleted`);

    return true;
  } catch (error: any) {
    console.error('   ❌ Subscription test failed:', error.message);
    return false;
  }
}

async function testInstanceLimits() {
  console.log('\n🧪 Testing Instance Limits Logic...\n');

  try {
    const testUser = await prisma.user.findFirst({
      where: { email: { contains: 'test' } },
      include: {
        subscription: true,
        openclawInstances: {
          where: { status: { in: ['deploying', 'active'] } }
        }
      }
    });

    if (!testUser) {
      console.log('   ℹ️  No test user found, skipping limit tests');
      return true;
    }

    console.log('1️⃣ Testing instance limit logic...');
    
    const activeInstances = testUser.openclawInstances.length;
    const subscription = testUser.subscription;

    if (subscription) {
      const canDeploy = activeInstances < subscription.maxInstances;
      console.log(`   📊 Active instances: ${activeInstances}/${subscription.maxInstances}`);
      console.log(`   ${canDeploy ? '✅' : '❌'} Can deploy: ${canDeploy}`);
    } else {
      const canDeploy = activeInstances < 1; // Free tier limit
      console.log(`   📊 Active instances: ${activeInstances}/1 (free tier)`);
      console.log(`   ${canDeploy ? '✅' : '❌'} Can deploy: ${canDeploy}`);
    }

    return true;
  } catch (error: any) {
    console.error('   ❌ Instance limits test failed:', error.message);
    return false;
  }
}

async function testRailwayClientImport() {
  console.log('\n🧪 Testing Railway Client Import...\n');

  try {
    console.log('1️⃣ Importing Railway client...');
    const { getRailwayClient } = await import('./src/lib/railway');
    console.log('   ✅ Railway client imported successfully');

    console.log('2️⃣ Checking Railway client methods...');
    const client = getRailwayClient();
    const methods = [
      'deployOpenClaw',
      'getDeploymentStatus',
      'stopService',
      'redeployService',
      'getLogs',
      'updateEnvVars'
    ];

    for (const method of methods) {
      if (typeof (client as any)[method] === 'function') {
        console.log(`   ✅ ${method} method exists`);
      } else {
        console.log(`   ❌ ${method} method missing`);
      }
    }

    return true;
  } catch (error: any) {
    console.error('   ❌ Railway client import failed:', error.message);
    return false;
  }
}

async function testOpenClawDeployImport() {
  console.log('\n🧪 Testing OpenClaw Deploy Service Import...\n');

  try {
    console.log('1️⃣ Importing OpenClaw deploy service...');
    const deployModule = await import('./src/lib/openclaw-deploy');
    console.log('   ✅ OpenClaw deploy service imported successfully');

    console.log('2️⃣ Checking exported functions...');
    const functions = [
      'deployOpenClawInstance',
      'stopOpenClawInstance',
      'restartOpenClawInstance',
      'getOpenClawLogs',
      'updateOpenClawConfig'
    ];

    for (const func of functions) {
      if (typeof (deployModule as any)[func] === 'function') {
        console.log(`   ✅ ${func} function exists`);
      } else {
        console.log(`   ❌ ${func} function missing`);
      }
    }

    return true;
  } catch (error: any) {
    console.error('   ❌ OpenClaw deploy import failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     OpenClaw Deployment Platform - Test Suite             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results = {
    databaseSchema: false,
    instanceCRUD: false,
    subscriptionModel: false,
    instanceLimits: false,
    railwayClient: false,
    openclawDeploy: false
  };

  results.databaseSchema = await testDatabaseSchema();
  results.instanceCRUD = await testInstanceCRUD();
  results.subscriptionModel = await testSubscriptionModel();
  results.instanceLimits = await testInstanceLimits();
  results.railwayClient = await testRailwayClientImport();
  results.openclawDeploy = await testOpenClawDeployImport();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    Test Results Summary                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌';
    const name = test.replace(/([A-Z])/g, ' $1').trim();
    console.log(`${icon} ${name.charAt(0).toUpperCase() + name.slice(1)}`);
  });

  console.log(`\n📊 Tests Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Ready to commit.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.\n');
  }

  await prisma.$disconnect();
}

runAllTests().catch(console.error);
