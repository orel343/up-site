'use client'

import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"

export default function Home() {
  const { user, signOut } = useAuth()

  return (
    <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col">
      <h1 className="text-4xl font-bold mb-8">Welcome to Your Web Hosting Platform</h1>
      {user ? (
        <>
          <nav className="mb-4">
            <ul className="flex space-x-4">
              <li>
                <Link href="/dashboard" className="text-blue-500 hover:underline">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-blue-500 hover:underline">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-blue-500 hover:underline">
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
          <Button onClick={signOut}>Log Out</Button>
        </>
      ) : (
        <Link href="/login">
          <Button>Log In</Button>
        </Link>
      )}
    </div>
  )
}

