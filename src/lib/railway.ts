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
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Railway API Error:', error.response?.data || error.message);
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
    const mutations = Object.entries(variables).map(([key, value], index) => {
      return `
        var${index}: variableUpsert(input: {
          projectId: "${projectId}"
          serviceId: "${serviceId}"
          name: "${key}"
          value: "${value}"
        }) {
          id
        }
      `;
    });

    const query = `
      mutation {
        ${mutations.join('\n')}
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

    // Step 1: Create project
    const project = await this.createProject(projectName);

    // Step 2: Create service
    const service = await this.createService(project.id, 'openclaw-bot');

    // Step 3: Set environment variables
    const envVars: Record<string, string> = {
      TELEGRAM_BOT_TOKEN: telegramBotToken,
      SELECTED_MODEL: selectedModel,
      NODE_ENV: 'production',
    };

    // Add AI API keys based on selected model
    if (selectedModel.includes('claude') && anthropicApiKey) {
      envVars.ANTHROPIC_API_KEY = anthropicApiKey;
    }
    if (selectedModel.includes('gpt') && openaiApiKey) {
      envVars.OPENAI_API_KEY = openaiApiKey;
    }
    if (selectedModel.includes('gemini') && googleAiApiKey) {
      envVars.GOOGLE_AI_API_KEY = googleAiApiKey;
    }

    await this.setEnvironmentVariables(project.id, service.id, envVars);

    // Step 4: Deploy from GitHub (OpenClaw template)
    // Note: You'll need to create a template repository or use an existing one
    await this.deployFromGitHub(
      project.id,
      service.id,
      'https://github.com/anthropics/openclaw',
      'main'
    );

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
