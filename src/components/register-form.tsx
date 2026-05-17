"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      const firstName = formData.get("firstName") as string
      const lastName = formData.get("lastName") as string
      const username = formData.get("username") as string
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      // STEP 1: Register user normally
      const registerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      )

      const registerData = await registerResponse.json()

      if (!registerResponse.ok) {
        const message =
          registerData.error?.message ||
          registerData.message ||
          "Registration failed"

        setError(message)
        toast.error(message)
        setIsLoading(false)
        return
      }

      // STEP 2: Update firstName + lastName
      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${registerData.user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${registerData.jwt}`,
          },
          body: JSON.stringify({
            firstName,
            lastName,
          }),
        }
      )

      if (!updateResponse.ok) {
        toast.warning(
          "Account created, but failed to save first and last name."
        )
      }

      // STEP 3: Auto login
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (loginResult?.error) {
        toast.error(
          "Registration successful, but login failed. Please login manually."
        )

        router.push("/login")
        return
      }

      toast.success("Registration successful! Welcome to KARUM.")

      router.push("/dashboard")
    } catch (err) {
      console.error(err)

      setError("Something went wrong")

      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Create your account
          </CardTitle>

          <CardDescription>
            Register now to start managing your KARUM inventory.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Field>
                <FieldLabel htmlFor="firstName">
                  First name
                </FieldLabel>

                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First name"
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="lastName">
                  Last name
                </FieldLabel>

                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="username">
                  Username
                </FieldLabel>

                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Your username"
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">
                  Email
                </FieldLabel>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">
                  Password
                </FieldLabel>

                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}