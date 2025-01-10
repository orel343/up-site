import { Octokit } from '@octokit/rest';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function storeGithubToken(userId: string, accessToken: string) {
  await setDoc(doc(db, 'users', userId), {
    githubAccessToken: accessToken
  }, { merge: true });
}

export async function getGithubToken(userId: string): Promise<string | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data().githubAccessToken : null;
}

export async function getGitHubRepositories(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken });

  try {
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      visibility: 'all',
      sort: 'updated',
      per_page: 100
    });
    
    return repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      defaultBranch: repo.default_branch,
      private: repo.private,
      language: repo.language,
      updatedAt: repo.updated_at
    }));
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    throw error;
  }
}

export async function getRepositoryFiles(accessToken: string, owner: string, repo: string, path: string = '') {
  const octokit = new Octokit({ auth: accessToken });

  try {
    const { data: contents } = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    if (Array.isArray(contents)) {
      return contents.map(item => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
        url: item.download_url
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching repository files:', error);
    throw error;
  }
}

export async function getFileContent(accessToken: string, owner: string, repo: string, path: string) {
  const octokit = new Octokit({ auth: accessToken });

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    if ('content' in data) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    
    throw new Error('Not a file');
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw error;
  }
}

