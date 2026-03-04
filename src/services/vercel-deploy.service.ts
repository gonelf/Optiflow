import type { ExportedFile } from './page-export.service';

const VERCEL_API = 'https://api.vercel.com';

export interface VercelDeployResult {
  projectId: string;
  deploymentUrl: string;
}

export class VercelDeployService {
  private static getToken(): string {
    const token = process.env.VERCEL_API_TOKEN;
    if (!token) throw new Error('VERCEL_API_TOKEN is not configured');
    return token;
  }

  /**
   * Creates a Vercel project (if it doesn't exist) and deploys files directly.
   * Uses file-based deployment so no GitHub App permissions are required on Vercel's side.
   */
  static async deployFiles(
    projectName: string,
    files: ExportedFile[]
  ): Promise<VercelDeployResult> {
    const token = this.getToken();
    const sanitizedName = this.sanitizeName(projectName);

    const project = await this.createOrGetProject(token, sanitizedName);

    const deployment = await this.apiCall(
      '/v13/deployments',
      'POST',
      {
        name: sanitizedName,
        files: files.map((f) => ({
          file: f.path,
          data: f.content,
          encoding: f.encoding,
        })),
        projectId: project.id,
        target: 'production',
      },
      token
    );

    return {
      projectId: project.id,
      deploymentUrl: `https://${deployment.url}`,
    };
  }

  private static async createOrGetProject(
    token: string,
    name: string
  ): Promise<{ id: string }> {
    try {
      return await this.apiCall(
        '/v10/projects',
        'POST',
        { name, framework: null },
        token
      );
    } catch (err: unknown) {
      // If a project with this name already exists (409), fetch it
      if (err instanceof Error && 'status' in err && (err as { status: number }).status === 409) {
        return this.apiCall(`/v9/projects/${encodeURIComponent(name)}`, 'GET', undefined, token);
      }
      throw err;
    }
  }

  private static sanitizeName(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 52) || 'optiflow-page'
    );
  }

  private static async apiCall(
    path: string,
    method: string,
    body: unknown,
    token: string
  ): Promise<any> {
    const res = await fetch(`${VERCEL_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const message =
        (errBody as { error?: { message?: string } })?.error?.message ||
        `Vercel API ${method} ${path} failed with ${res.status}`;
      const error = new Error(message) as Error & { status: number };
      error.status = res.status;
      throw error;
    }

    return res.json();
  }
}
