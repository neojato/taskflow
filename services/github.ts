
import { Octokit } from 'octokit';
import { GitHubIssue } from '../types';
import { processIssue } from '../utils';

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getIssues(repoPath: string): Promise<GitHubIssue[]> {
    const [owner, repo] = repoPath.split('/');
    const { data } = await this.octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100,
    });

    // Filter out Pull Requests
    return data
      .filter((i: any) => !i.pull_request)
      .map(processIssue);
  }

  async createIssue(repoPath: string, data: { title: string; body: string; labels?: string[]; assignees?: string[] }) {
    const [owner, repo] = repoPath.split('/');
    const { data: issue } = await this.octokit.rest.issues.create({
      owner,
      repo,
      title: data.title,
      body: data.body,
      labels: data.labels,
      assignees: data.assignees,
    });
    return processIssue(issue);
  }

  async updateIssueLabels(repoPath: string, issueNumber: number, labels: string[]) {
    const [owner, repo] = repoPath.split('/');
    return this.octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      labels,
    });
  }

  async getRepoInfo(repoPath: string) {
    const [owner, repo] = repoPath.split('/');
    return this.octokit.rest.repos.get({ owner, repo });
  }
}
