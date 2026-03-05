"use client"

import { useState } from "react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch("http://127.0.0.1:8000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setMessage(data.message || data.detail)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-8 bg-zinc-900 rounded-xl w-96"
      >
        <h1 className="text-2xl font-bold">Register</h1>

        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded bg-zinc-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="p-2 rounded bg-zinc-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="bg-blue-600 p-2 rounded hover:bg-blue-500">
          Create Account
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  )
}