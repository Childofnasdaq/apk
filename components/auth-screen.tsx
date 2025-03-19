"use client"

import type React from "react"
import { useState } from "react"
import { validatePortalCredentials } from "@/lib/firebase-auth"
import type { FirebaseUser } from "@/lib/firebase-auth"

interface AuthScreenProps {
  onAuthSuccess: (userData: FirebaseUser) => void
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [credentials, setCredentials] = useState({
  const [userImage, setUserImage] = useState("");
    mentorId: "",
    email: "",
    licenseKey: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await validatePortalCredentials(credentials)

      if (result.success && result.user) {
        // Store the user data
        localStorage.setItem("firebase_user", JSON.stringify(result.user))
        onAuthSuccess(result.user)
      } else {
        setError(result.error || "Authentication failed")
      }
    } catch (error: any) {
      console.error("Authentication error:", error)
      setError(error.message || "Failed to connect to portal. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-red-500 rounded-lg p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">QUICKTRADE PRO</h1>
          <p className="text-red-400 mt-2">Enter your portal credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Mentor ID"
              value={credentials.mentorId}
              onChange={(e) => setCredentials((prev) => ({ ...prev, mentorId: e.target.value }))}
              className="w-full bg-transparent border border-red-500/30 rounded-md p-3 text-white placeholder:text-red-300/50 focus:outline-none focus:border-red-500"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full bg-transparent border border-red-500/30 rounded-md p-3 text-white placeholder:text-red-300/50 focus:outline-none focus:border-red-500"
              required
            />

            <input
              type="text"
              placeholder="License Key"
              value={credentials.licenseKey}
              onChange={(e) => setCredentials((prev) => ({ ...prev, licenseKey: e.target.value }))}
              className="w-full bg-transparent border border-red-500/30 rounded-md p-3 text-white placeholder:text-red-300/50 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Authenticate"}
          </button>
        </form>

        <div className="text-center text-red-400 text-sm">Need help? Contact support at support@quicktradepro.com</div>
      </div>
    </div>
  )
}

