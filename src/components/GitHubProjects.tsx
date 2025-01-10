'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getGithubToken, getGitHubRepositories, getRepositoryFiles } from '../lib/github';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, FolderGit2, ChevronRight } from 'lucide-react'

interface Repository {
  id: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  defaultBranch: string;
  private: boolean;
  language: string;
  updatedAt: string;
}

interface FileItem {
  name: string;
  path: string;
  type: string;
  size: number;
  url: string | null;
}

export function GitHubProjects() {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepositories = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = await getGithubToken(user.uid);
        if (!token) {
          setError('GitHub token not found. Please reconnect your GitHub account.');
          return;
        }

        const repos = await getGitHubRepositories(token);
        setRepositories(repos);
      } catch (error) {
        console.error('Error fetching repositories:', error);
        setError('Failed to fetch repositories');
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [user]);

  const fetchFiles = async (repoFullName: string, path: string = '') => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await getGithubToken(user.uid);
      if (!token) {
        setError('GitHub token not found');
        return;
      }

      const [owner, repo] = repoFullName.split('/');
      const files = await getRepositoryFiles(token, owner, repo, path);
      setFiles(files);
      setSelectedRepo(repoFullName);
      setCurrentPath(path);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch repository files');
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (path: string) => {
    if (!selectedRepo) return;
    fetchFiles(selectedRepo, path);
  };

  const navigateUp = () => {
    if (!currentPath) return;
    const newPath = currentPath.split('/').slice(0, -1).join('/');
    fetchFiles(selectedRepo!, newPath);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Projects</CardTitle>
        <CardDescription>Select a repository to view its files</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {!selectedRepo ? (
              // Repository List
              <div className="grid gap-2">
                {repositories.map((repo) => (
                  <Button
                    key={repo.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => fetchFiles(repo.fullName)}
                  >
                    <FolderGit2 className="mr-2 h-4 w-4" />
                    {repo.name}
                  </Button>
                ))}
              </div>
            ) : (
              // File Browser
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRepo(null);
                      setFiles([]);
                      setCurrentPath('');
                    }}
                  >
                    Back to Repositories
                  </Button>
                  {currentPath && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={navigateUp}
                    >
                      Up
                    </Button>
                  )}
                </div>
                {currentPath && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Current path: /{currentPath}
                  </div>
                )}
                <div className="grid gap-2">
                  {files.map((file) => (
                    <Button
                      key={file.path}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => file.type === 'dir' && navigateToFolder(file.path)}
                    >
                      <FolderGit2 className="mr-2 h-4 w-4" />
                      {file.name}
                      {file.type === 'dir' && (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

