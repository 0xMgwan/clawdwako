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

  async setEnvironmentVariables(
    projectId: string,
    serviceId: string,
    variables: Record<string, string>
  ) {
    // Get the environment first
    const envQuery = `
      query Project($id: String!) {
        project(id: $id) {
          id
          environments(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `;

    const envData = await this.query(envQuery, { id: projectId });
    const environmentId = envData.project.environments.edges[0]?.node.id;

    if (!environmentId) {
      throw new Error('No environment found for project');
    }

    const mutations = Object.entries(variables).map(([key, value], index) => {
      // Escape special characters in values
      const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      return `
        var${index}: variableUpsert(input: {
          projectId: "${projectId}"
          environmentId: "${environmentId}"
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

    return await this.query(query);
  }

  async setServiceSource(
    serviceId: string,
    rootDirectory: string
  ) {
    const query = `
      mutation ServiceUpdate($serviceId: String!, $rootDirectory: String) {
        serviceUpdate(
          id: $serviceId
          input: { rootDirectory: $rootDirectory }
        ) {
          id
        }
      }
    `;

    return await this.query(query, { serviceId, rootDirectory });
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
          input: { repo: $repo, branch: $branch }
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

  async getDeploymentStatus(serviceId: string) {
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
    return data.service;
  }

  async deployOpenClaw(options: RailwayDeploymentOptions) {
    const {
      projectName,
      telegramBotToken,
      selectedModel,
      anthropicApiKey,
      openaiApiKey,
      googleAiApiKey,
    } = options;

    console.log('Step 1: Creating Railway project...');
    const project = await this.createProject(projectName);
    console.log('Project created:', project.id);

    console.log('Step 2: Creating service...');
    const service = await this.createService(project.id, 'telegram-bot');
    console.log('Service created:', service.id);

    console.log('Step 3: Setting environment variables...');
    const envVars: Record<string, string> = {
      TELEGRAM_BOT_TOKEN: telegramBotToken,
      SELECTED_MODEL: selectedModel,
      ANTHROPIC_API_KEY: anthropicApiKey || process.env.ANTHROPIC_API_KEY || '',
      OPENAI_API_KEY: openaiApiKey || process.env.OPENAI_API_KEY || '',
      GOOGLE_AI_API_KEY: googleAiApiKey || process.env.GOOGLE_AI_API_KEY || '',
    };

    await this.setEnvironmentVariables(project.id, service.id, envVars);
    console.log('Environment variables set');

    console.log('Step 4: Deploying from GitHub...');
    // Deploy the bot code from your GitHub repo
    await this.deployFromGitHub(
      project.id,
      service.id,
      'https://github.com/0xMgwan/clawdwako',
      'main'
    );
    console.log('GitHub deployment initiated');

    console.log('Step 5: Setting root directory to bot-runner...');
    await this.setServiceSource(service.id, 'bot-runner');
    console.log('Root directory set to bot-runner');

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
