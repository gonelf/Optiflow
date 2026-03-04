import type { ExportedFile } from './page-export.service';

const GITHUB_API = 'https://api.github.com';

export interface GitHubRepoResult {
  repoName: string;
  repoUrl: string;
  fullName: string;
}

export class GitHubDeployService {
  static async createRepoAndPush(
    githubToken: string,
    repoName: string,
    files: ExportedFile[]
  ): Promise<GitHubRepoResult> {
    const sanitizedName = this.sanitizeRepoName(repoName);

    const userRes = await this.apiCall('/user', 'GET', undefined, githubToken);
    const login: string = userRes.login;

    const finalName = await this.findUniqueName(githubToken, login, sanitizedName);

    const repo = await this.apiCall(
      '/user/repos',
      'POST',
      {
        name: finalName,
        description: 'Deployed from Optiflow',
        private: false,
        auto_init: false,
      },
      githubToken
    );

    await this.pushFiles(githubToken, login, finalName, files);

    return {
      repoName: finalName,
      repoUrl: repo.html_url,
      fullName: repo.full_name,
    };
  }

  private static async pushFiles(
    token: string,
    owner: string,
    repo: string,
    files: ExportedFile[]
  ): Promise<void> {
    const blobShas = await Promise.all(
      files.map(async (file) => {
        const blob = await this.apiCall(
          `/repos/${owner}/${repo}/git/blobs`,
          'POST',
          { content: file.content, encoding: file.encoding },
          token
        );
        return { path: file.path, sha: blob.sha as string };
      })
    );

    const tree = await this.apiCall(
      `/repos/${owner}/${repo}/git/trees`,
      'POST',
      {
        tree: blobShas.map((b) => ({
          path: b.path,
          mode: '100644',
          type: 'blob',
          sha: b.sha,
        })),
      },
      token
    );

    const commit = await this.apiCall(
      `/repos/${owner}/${repo}/git/commits`,
      'POST',
      {
        message: 'Initial deploy from Optiflow',
        tree: tree.sha,
        parents: [],
      },
      token
    );

    await this.apiCall(
      `/repos/${owner}/${repo}/git/refs`,
      'POST',
      { ref: 'refs/heads/main', sha: commit.sha },
      token
    );
  }

  private static async findUniqueName(
    token: string,
    owner: string,
    base: string
  ): Promise<string> {
    let name = base;
    let attempt = 0;
    while (true) {
      try {
        await this.apiCall(`/repos/${owner}/${name}`, 'GET', undefined, token);
        attempt++;
        name = `${base}-${attempt}`;
      } catch (err: unknown) {
        if (err instanceof Error && 'status' in err && (err as { status: number }).status === 404) {
          return name;
        }
        throw err;
      }
    }
  }

  private static sanitizeRepoName(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100) || 'optiflow-page'
    );
  }

  private static async apiCall(
    path: string,
    method: string,
    body: unknown,
    token: string
  ): Promise<any> {
    const res = await fetch(`${GITHUB_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const error = new Error(
        (errBody as { message?: string }).message ||
          `GitHub API ${method} ${path} failed with ${res.status}`
      ) as Error & { status: number };
      error.status = res.status;
      throw error;
    }

    if (res.status === 204) return null;
    return res.json();
  }
}
