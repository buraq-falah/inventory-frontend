"use client"

import { LoginForm } from "@/components/login-form"
import { Store } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (session) {
      router.push("/dashboard")
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (session) {
    return null // Will redirect
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Store className="size-4" />
          </div>
        KARUM.
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
