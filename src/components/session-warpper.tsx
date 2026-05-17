'use client'
import { SessionProvider } from "next-auth/react"


export default function SessionWarpper({children}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}