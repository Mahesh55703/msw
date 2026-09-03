'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSettings } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsForm({ user }: { user: { id: string, name: string | null, email: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await updateSettings(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Settings updated successfully.')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            name="name" 
            defaultValue={user.name || ''} 
            placeholder="Your Name"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            defaultValue={user.email} 
            placeholder="Your Email"
            required
          />
        </div>

        <div className="border-t border-[#D9E1DC] pt-4 mt-4">
          <h3 className="text-sm font-bold text-[#12372A] mb-4">Change Password</h3>
          <p className="text-xs text-[#66736D] mb-4">Leave blank if you don't want to change your password.</p>
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                name="currentPassword" 
                type="password" 
                placeholder="Required to change password"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                name="newPassword" 
                type="password" 
                placeholder="New Password"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                placeholder="Confirm New Password"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-[#12372A] hover:bg-[#0a1f18] text-white"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  )
}
