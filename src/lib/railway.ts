import axios from 'axios';

const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v2';

interface RailwayDeploymentOptions {
  projectName: string;
  telegramBotToken: string;
  selectedModel: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  googleAiApiKey?: string;
}

interface RailwayProject {
  id: string;
  name: string;
  services: {
    id: string;
    name: string;
  }[];
}

export class RailwayClient {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async query(query: string, variables?: any) {
    try {
      console.log('Railway GraphQL Query:', query.substring(0, 100) + '...');
      console.log('Railway GraphQL Variables:', variables);
      
      const response = await axios.post(
        RAILWAY_API_URL,
        {
          query,
          variables,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          validateStatus: () => true, // Don't throw on any status code
        }
      );

      console.log('Railway Response Status:', response.status);
      console.log('Railway Response Content-Type:', response.headers['content-type']);

      // Check if response is HTML (error page)
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE')) {
        console.error('Railway returned HTML error page');
        throw new Error('Railway API returned an error page. Check your API token and permissions.');
      }

      if (response.data.errors) {
        console.error('Railway GraphQL Errors:', JSON.stringify(response.data.errors, null, 2));
        throw new Error(response.data.errors[0].message);
      }

      if (!response.data.data) {
        console.error('Railway response has no data:', response.data);
        throw new Error('Railway API returned invalid response');
      }

      console.log('Railway GraphQL Success');
      return response.data.data;
    } catch (error: any) {
      console.error('=== Railway API Error ===');
      console.error('Status:', error.response?.status);
      console.error('Content-Type:', error.response?.headers?.['content-type']);
      console.error('Data (first 200 chars):', typeof error.response?.data === 'string' ? error.response?.data.substring(0, 200) : JSON.stringify(error.response?.data, null, 2));
      console.error('Message:', error.message);
      console.error('========================');
      throw error;
    }
  }

  async createProject(name: string): Promise<RailwayProject> {
    const query = `
      mutation ProjectCreate($name: String!) {
        projectCreate(input: { name: $name }) {
          id
          name
        }
      }
    `;

    const data = await this.query(query, { name });
    return data.projectCreate;
  }

  async createService(projectId: string, name: string) {
    const query = `
      mutation ServiceCreate($projectId: String!, $name: String!) {
        serviceCreate(input: { projectId: $projectId, name: $name }) {
          id
          name
        }
      }
    `;

    const data = await this.query(query, { projectId, name });
    return data.serviceCreate;
  }

  async disableServiceNetworking(serviceId: string) {
    const query = `
      mutation ServiceDomainDelete($serviceId: String!) {
        serviceDomainDelete(id: $serviceId)
      }
    `;

    try {
      await this.query(query, { serviceId });
      console.log('Service networking disabled');
    } catch (error: any) {
      console.log('Note: Could not disable networking (may not be enabled yet):', error.message);
      // Don't throw - this is optional
    }
  }

  async setEnvironmentVariables(
    projectId: string,
    serviceId: string,
    variables: Record<string, string>
  ) {
    console.log('🔧 Setting environment variables for project:', projectId);
    console.log('📝 Variables to set:', Object.keys(variables));
    
    // Get the environment first
    const envQuery = `
      query Project($id: String!) {
        project(id: $id) {
          id
          environments(first: 1) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `;

    const envData = await this.query(envQuery, { id: projectId });
    const environmentId = envData.project.environments.edges[0]?.node.id;
    const environmentName = envData.project.environments.edges[0]?.node.name;

    if (!environmentId) {
      throw new Error('No environment found for project');
    }
    
    console.log(`✅ Found environment: ${environmentName} (${environmentId})`);

    console.log(`🔧 Setting variables on service: ${serviceId}`);

    const mutations = Object.entries(variables).map(([key, value], index) => {
      // Escape special characters in values
      const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      console.log(`  Setting ${key} = ${key.includes('KEY') || key.includes('TOKEN') ? '[REDACTED]' : value}`);
      return `
        var${index}: variableUpsert(input: {
          projectId: "${projectId}"
          environmentId: "${environmentId}"
          serviceId: "${serviceId}"
          name: "${key}"
          value: "${escapedValue}"
        })
      `;
    });

    const query = `
      mutation {
        ${mutations.join('\n')}
      }
    `;

    console.log('🚀 Executing mutation to set variables...');
    const result = await this.query(query);
    console.log('✅ Mutation executed successfully');
    return result;
  }

  async setServiceSource(
    serviceId: string,
    rootDirectory: string
  ) {
    const query = `
      mutation ServiceUpdate($serviceId: String!) {
        serviceUpdate(
          id: $serviceId
          input: { name: "openclaw-service" }
        ) {
          id
        }
      }
    `;

    return await this.query(query, { serviceId });
  }


  async updateEnvironmentVariable(
    projectId: string,
    environmentId: string,
    name: string,
    value: string
  ) {
    const query = `
      mutation {
        variableUpsert(input: {
          projectId: "${projectId}"
          environmentId: "${environmentId}"
          name: "${name}"
          value: "${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
        })
      }
    `;

    return await this.query(query);
  }

  async deployFromGitHub(
    projectId: string,
    serviceId: string,
    repoUrl: string,
    branch: string = 'main'
  ) {
    const query = `
      mutation ServiceConnect($serviceId: String!, $repo: String!, $branch: String!) {
        serviceConnect(
          id: $serviceId
          input: { 
            repo: $repo, 
            branch: $branch
          }
        ) {
          id
        }
      }
    `;

    const data = await this.query(query, {
      serviceId,
      repo: repoUrl,
      branch,
    });

    return data.serviceConnect;
  }

  async getDeploymentStatus(projectId: string, serviceId: string) {
    const query = `
      query Service($id: String!) {
        service(id: $id) {
          id
          name
          deployments(first: 1) {
            edges {
              node {
                id
                status
                url
                createdAt
              }
            }
          }
        }
      }
    `;

    const data = await this.query(query, { id: serviceId });
    const deployment = data.service.deployments.edges[0]?.node;
    
    return {
      state: deployment?.status || 'UNKNOWN',
      url: deployment?.url || null,
      createdAt: deployment?.createdAt || null
    };
  }

  async stopService(projectId: string, serviceId: string) {
    const query = `
      mutation ServiceInstanceUpdate($serviceId: String!) {
        serviceInstanceUpdate(input: { serviceId: $serviceId, numReplicas: 0 }) {
          id
        }
      }
    `;

    await this.query(query, { serviceId });
    console.log('✅ Service stopped:', serviceId);
  }

  async redeployService(projectId: string, serviceId: string) {
    const query = `
      mutation ServiceInstanceRedeploy($serviceId: String!) {
        serviceInstanceRedeploy(serviceId: $serviceId)
      }
    `;

    await this.query(query, { serviceId });
    console.log('✅ Service redeployed:', serviceId);
  }

  async getLogs(projectId: string, serviceId: string, limit: number = 100) {
    // First get the environment ID and latest deployment ID
    const envQuery = `
      query Service($id: String!) {
        service(id: $id) {
          id
          deployments(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `;

    try {
      const serviceData = await this.query(envQuery, { id: serviceId });
      const deploymentId = serviceData.service?.deployments?.edges?.[0]?.node?.id;
      
      if (!deploymentId) {
        console.log('No deployment found for service');
        return [];
      }

      const query = `
        query DeploymentLogs($deploymentId: String!, $limit: Int!) {
          deploymentLogs(deploymentId: $deploymentId, limit: $limit) {
            message
            timestamp
            severity
          }
        }
      `;

      const data = await this.query(query, { deploymentId, limit });
      const rawLogs = data.deploymentLogs || [];
      
      return rawLogs.map((log: any) => ({
        message: log.message,
        timestamp: log.timestamp,
        severity: log.severity || 'info'
      }));
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return [];
    }
  }

  async updateEnvVars(
    projectId: string,
    serviceId: string,
    variables: Record<string, string>
  ) {
    console.log('🔧 Updating environment variables...');
    await this.setEnvironmentVariables(projectId, serviceId, variables);
    console.log('✅ Environment variables updated');
  }

  async deployOpenClaw(options: RailwayDeploymentOptions & { botId?: string }) {
    const {
      projectName,
      telegramBotToken,
      selectedModel,
      anthropicApiKey,
      openaiApiKey,
      googleAiApiKey,
      botId,
    } = options;

    console.log('Step 1: Creating Railway project...');
    const project = await this.createProject(projectName);
    console.log('Project created:', project.id);

    console.log('Step 2: Creating service...');
    const service = await this.createService(project.id, 'telegram-bot');
    console.log('Service created:', service.id);

    console.log('Step 2.5: Disabling service networking (worker service)...');
    await this.disableServiceNetworking(service.id);

    console.log('Step 3: Setting environment variables...');
    console.log('🔑 API Keys received:', {
      anthropic: anthropicApiKey ? `${anthropicApiKey.substring(0, 10)}...` : 'NOT PROVIDED',
      openai: openaiApiKey ? `${openaiApiKey.substring(0, 10)}...` : 'NOT PROVIDED',
      google: googleAiApiKey ? `${googleAiApiKey.substring(0, 10)}...` : 'NOT PROVIDED',
      telegram: telegramBotToken ? `${telegramBotToken.substring(0, 10)}...` : 'NOT PROVIDED',
      selectedModel,
    });
    
    // Set OpenClaw environment variables
    const envVars: Record<string, string> = {
      // AI Provider Keys
      ANTHROPIC_API_KEY: anthropicApiKey || '',
      OPENAI_API_KEY: openaiApiKey || '',
      GOOGLE_API_KEY: googleAiApiKey || '',
      
      // Telegram Bot Token
      TELEGRAM_BOT_TOKEN: telegramBotToken || '',
      
      // OpenClaw Configuration
      MODEL: selectedModel,
      CHANNEL: 'telegram',
      
      // Railway Configuration - Tell Railway to use Dockerfile.openclaw
      RAILWAY_DOCKERFILE_PATH: 'Dockerfile.openclaw',
      
      // Node environment
      NODE_ENV: 'production',
      // PORT is set by Railway automatically, don't override it
    };

    try {
      await this.setEnvironmentVariables(project.id, service.id, envVars);
      console.log('✅ Environment variables set successfully');
      console.log('📋 Variables that were set:', Object.keys(envVars));
    } catch (error: any) {
      console.error('❌ FAILED to set environment variables!');
      console.error('Error:', error.message);
      throw new Error(`Failed to set Railway environment variables: ${error.message}`);
    }

    console.log('Step 4: Deploying OpenClaw from GitHub...');
    await this.deployFromGitHub(
      project.id,
      service.id,
      '0xMgwan/clawdwako',
      'main'
    );
    console.log('✅ GitHub deployment initiated - Railway will use Dockerfile.openclaw');

    return {
      projectId: project.id,
      serviceId: service.id,
      projectName: project.name,
    };
  }
}

export function getRailwayClient(): RailwayClient {
  const apiToken = process.env.RAILWAY_API_TOKEN;
  
  if (!apiToken) {
    throw new Error('RAILWAY_API_TOKEN is not configured');
  }

  return new RailwayClient(apiToken);
}
