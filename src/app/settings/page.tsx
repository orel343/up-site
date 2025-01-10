'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ActivityGraph } from '../../components/ActivityGraph';
import { themes, Theme } from '../../lib/themes';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Monitor, Github } from 'lucide-react'

export default function Settings() {
  const { user, signOut, linkGithub, unlinkGithub } = useAuth();
  const [githubLinked, setGithubLinked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (user) {
      const fetchSettings = async () => {
        const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
        if (settingsDoc.exists()) {
          const savedTheme = settingsDoc.data().theme;
          if (savedTheme) setTheme(savedTheme);
        }
        setGithubLinked(user.providerData.some(provider => provider.providerId === 'github.com'));
      };
      fetchSettings();
    }
  }, [user, setTheme]);

  const saveTheme = async (newTheme: Theme) => {
    if (!user) return;

    setIsProcessing(true);
    try {
      await setDoc(doc(db, 'userSettings', user.uid), { theme: newTheme }, { merge: true });
      setTheme(newTheme);
      setMessage('Theme saved successfully');
    } catch (error) {
      console.error('Error saving theme:', error);
      setMessage('Failed to save theme');
    }
    setIsProcessing(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleGithubLink = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setMessage('');
    
    try {
      if (githubLinked) {
        await unlinkGithub();
        setGithubLinked(false);
        setMessage('GitHub account unlinked successfully');
      } else {
        await linkGithub();
        setGithubLinked(true);
        setMessage('GitHub account linked successfully');
      }
    } catch (error) {
      console.error('GitHub linking error:', error);
      setMessage('Failed to process GitHub account connection');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      {message && (
        <div className={`mb-4 p-4 rounded ${
          message.includes('Failed') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
        }`}>
          {message}
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityGraph />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">You look good today!</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Username</Label>
              <p className="text-sm text-muted-foreground">
                Your username is {user.displayName || user.email?.split('@')[0]}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Default Team</Label>
              <Select defaultValue={`${user.email}&apos;s projects`}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={`${user.email}&apos;s projects`}>
                    {user.email}&apos;s projects
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                New projects and deployments from your personal scope will be created in this team.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Interface theme</Label>
              <Select value={theme} onValueChange={saveTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div className="flex items-center gap-2">
                        {theme.value === 'system' && <Monitor className="w-4 h-4" />}
                        {theme.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Select your interface color scheme.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Github className="w-8 h-8" />
              <div>
                <h3 className="font-medium">GitHub</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with GitHub to import and deploy repositories.
                </p>
              </div>
            </div>
            <Button
              onClick={handleGithubLink}
              disabled={isProcessing}
              variant={githubLinked ? "destructive" : "default"}
            >
              {isProcessing
                ? 'Processing...'
                : githubLinked
                  ? 'Disconnect'
                  : 'Connect'
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={signOut}>
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

