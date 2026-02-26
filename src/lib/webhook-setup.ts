import { getRailwayClient } from './railway';
import { prisma } from './prisma';
import axios from 'axios';

/**
 * Poll Railway deployment and configure webhook when ready
 * This runs after deployment is initiated to automatically set up webhooks
 */
export async function setupWebhookWhenReady(
  instanceId: string,
  maxAttempts = 20,
  delayMs = 15000 // 15 seconds between checks
): Promise<void> {
  
  console.log(`🔄 Starting webhook setup polling for instance ${instanceId}`);
  
  const instance = await prisma.OpenClawInstance.findUnique({
    where: { id: instanceId }
  });

  if (!instance) {
    throw new Error('Instance not found');
  }

  const railwayClient = getRailwayClient();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxAttempts}: Checking Railway deployment status...`);
      
      // Check Railway deployment status
      const status = await railwayClient.getDeploymentStatus(
        instance.railwayProjectId,
        instance.railwayServiceId
      );

      if (status.state === 'SUCCESS' && status.url) {
        console.log(`✅ Railway deployment is live at: ${status.url}`);
        
        // OpenClaw uses long polling (not webhooks), so we just update status to active
        // No webhook configuration needed - OpenClaw connects directly to Telegram API
        console.log('✅ OpenClaw instance is running (uses long polling, no webhook needed)');
        
        // Update instance in database
        await prisma.OpenClawInstance.update({
          where: { id: instanceId },
          data: {
            deploymentUrl: status.url,
            status: 'active',
            lastHealthCheck: new Date()
          }
        });
        
        console.log('✅ Instance updated to active status');
        return; // Success!
      } else {
        console.log(`⏳ Deployment status: ${status.state}, waiting...`);
      }
      
      // Wait before next attempt
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
    } catch (error: any) {
      console.error(`Error on attempt ${attempt}:`, error.message);
      
      // Wait before retry
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  console.error(`❌ Failed to configure webhook after ${maxAttempts} attempts`);
  
  // Update instance to show it needs manual configuration
  await prisma.OpenClawInstance.update({
    where: { id: instanceId },
    data: {
      status: 'failed',
      lastHealthCheck: new Date()
    }
  });
}
