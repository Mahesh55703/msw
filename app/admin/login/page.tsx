'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Lock, Mail } from 'lucide-react'

const initialState = {
  message: '',
  errors: {},
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F4EC] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-3xl border border-[#D9E1DC] shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
              <Image 
                src="/logo-transparent.png" 
                alt="LabourAxis Logo" 
                width={220} 
                height={55} 
                className="object-contain h-12 w-auto" 
                priority 
              />
            </Link>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#12372A]">
            Admin Portal Login
          </h2>
          <p className="mt-1 text-xs text-[#66736D] font-medium">
            Authorized administrative & compliance access
          </p>
        </div>

        <form className="mt-8 space-y-6" action={formAction}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-[#12372A]">Email Address</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#66736D]" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10 text-xs rounded-xl border-[#D9E1DC] bg-[#F7F4EC]/30 text-[#202522] focus:bg-white focus:ring-[#1F7A5C]"
                  placeholder="admin@labouraxis.com"
                />
              </div>
              {state?.errors?.email && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{state.errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-[#12372A]">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#66736D]" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-10 text-xs rounded-xl border-[#D9E1DC] bg-[#F7F4EC]/30 text-[#202522] focus:bg-white focus:ring-[#1F7A5C]"
                  placeholder="••••••••"
                />
              </div>
              {state?.errors?.password && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{state.errors.password}</p>
              )}
            </div>
          </div>

          {state?.message && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5">
              <p className="text-xs font-semibold text-rose-700 text-center">{state.message}</p>
            </div>
          )}

          <div>
            <Button type="submit" className="w-full bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors" disabled={isPending}>
              {isPending ? 'Authenticating...' : 'Sign In to Portal'}
            </Button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-[#D9E1DC]/80">
          <a href="/" className="text-[11px] font-bold text-[#1F7A5C] hover:text-[#165B44]">
            ← Return to public website
          </a>
        </div>
      </div>
    </div>
  )
}

