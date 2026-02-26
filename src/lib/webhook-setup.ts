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
  
  const instance = await prisma.openClawInstance.findUnique({
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
        
        // Try to configure webhook
        try {
          if (instance.channel === 'telegram' && instance.telegramToken) {
            const webhookUrl = `${status.url}/telegram/webhook`;
            
            console.log(`📡 Configuring Telegram webhook: ${webhookUrl}`);
            
            const response = await axios.post(
              `https://api.telegram.org/bot${instance.telegramToken}/setWebhook`,
              {
                url: webhookUrl,
                allowed_updates: ['message', 'callback_query', 'inline_query'],
              },
              { timeout: 10000 }
            );
            
            if (response.data.ok) {
              console.log('✅ Telegram webhook configured successfully');
              
              // Update instance in database
              await prisma.openClawInstance.update({
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
              console.error('❌ Telegram webhook setup failed:', response.data.description);
            }
          }
        } catch (webhookError: any) {
          console.error('❌ Failed to configure webhook:', webhookError.message);
          // Continue polling in case it's a temporary error
        }
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
  await prisma.openClawInstance.update({
    where: { id: instanceId },
    data: {
      status: 'failed',
      lastHealthCheck: new Date()
    }
  });
}
