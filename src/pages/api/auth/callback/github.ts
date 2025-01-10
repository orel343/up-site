import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../../../lib/firebase';
import { signInWithCredential, GithubAuthProvider } from 'firebase/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid code' });
  }

  try {
    const credential = GithubAuthProvider.credential(code);
    await signInWithCredential(auth, credential);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error in GitHub callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

