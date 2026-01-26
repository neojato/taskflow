import { Octokit } from 'octokit';
import { processIssue } from '../utils.js';

export class GitHubService {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
  }

  async getIssues(repoPath) {
    const [owner, repo] = repoPath.split('/');
    const { data } = await this.octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100,
    });

    return data
      .filter((i) => !i.pull_request)
      .map(processIssue);
  }

  async getIssueComments(repoPath, issueNumber) {
    const [owner, repo] = repoPath.split('/');
    const { data } = await this.octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: issueNumber,
    });
    return data;
  }

  async getIssueEvents(repoPath, issueNumber) {
    const [owner, repo] = repoPath.split('/');
    const { data } = await this.octokit.rest.issues.listEvents({
      owner,
      repo,
      issue_number: issueNumber,
    });
    return data;
  }

  async createIssue(repoPath, data) {
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

  async updateIssueLabels(repoPath, issueNumber, labels) {
    const [owner, repo] = repoPath.split('/');
    return this.octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      labels,
    });
  }

  async getRepoInfo(repoPath) {
    const [owner, repo] = repoPath.split('/');
    return this.octokit.rest.repos.get({ owner, repo });
  }
}