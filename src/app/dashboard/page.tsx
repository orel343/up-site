'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Project {
  id: string;
  name: string;
  status: 'live' | 'draft';
  server: 'vercel' | 'netlify' | 'firebase' | 'custom';
  lastUpdated: Date;
  visits: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectData: Project[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as Project;
      });
      setProjects(projectData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const serverCounts = projects.reduce((acc, project) => {
    acc[project.server] = (acc[project.server] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(serverCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="w-full max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <ul>
                {projects.slice(0, 5).map((project) => (
                  <li key={project.id} className="mb-2">
                    <Link href={`/projects/${project.id}`} className="text-blue-500 hover:underline">
                      {project.name}
                    </Link>
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${
                      project.status === 'live' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {project.server}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No projects yet. <Link href="/projects/new" className="text-blue-500 hover:underline">Create one?</Link></p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Projects: {projects.length}</p>
            <p>Live Projects: {projects.filter(p => p.status === 'live').length}</p>
            <p>Draft Projects: {projects.filter(p => p.status === 'draft').length}</p>
            <p>Total Visits: {projects.reduce((sum, p) => sum + (p.visits || 0), 0)}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Server Distribution</CardTitle>
          <CardDescription>Distribution of projects across different servers</CardDescription>
        </CardHeader>
        <CardContent>
        
        </CardContent>
      </Card>
    </div>
  );
}

