'use client'

import { GitHubProjects } from '../../components/GitHubProjects';

export default function Projects() {
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>
      <GitHubProjects />
    </div>
  );
}

