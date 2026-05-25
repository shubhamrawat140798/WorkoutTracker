import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({ email: z.string().email() })

export function ForgotPasswordPage() {
  const [message, setMessage] = useState('')
  const [resetLink, setResetLink] = useState('')
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setError('')
    setMessage('')
    setResetLink('')
    try {
      const res = await api.auth.forgotPassword(data)
      setMessage(res.message)
      if (res.resetLink) setResetLink(res.resetLink)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Request failed')
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>We will send you a link to create a new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-primary">{message}</p>}
            {resetLink && (
              <div className="rounded-xl bg-muted p-3 text-xs break-all">
                <p className="mb-1 text-muted-foreground">Dev reset link:</p>
                <a href={resetLink} className="text-primary underline">
                  {resetLink}
                </a>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Send reset link
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
