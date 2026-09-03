'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createUser, updateUser } from '@/app/actions/users'
import { Eye, EyeOff } from 'lucide-react'

interface UserFormProps {
  initialData?: any
  isEditing?: boolean
}

export function UserForm({ initialData, isEditing }: UserFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      password: formData.get('password') as string,
      isActive: formData.get('isActive') === 'on'
    }

    if (!isEditing && !data.password) {
      setError('Password is required for new users')
      return
    }
    
    if (data.password && data.password !== formData.get('confirmPassword')) {
      setError('Passwords do not match')
      return
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateUser(initialData.id, data)
        } else {
          await createUser(data)
        }
        router.push('/admin/users')
        router.refresh()
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-xl border border-[#D9E1DC] shadow-sm">
      {error && (
        <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={initialData?.name} required />
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" defaultValue={initialData?.email} required />
        </div>
        
        <div className="space-y-2 col-span-2 sm:col-span-1 relative">
          <Label htmlFor="password">{isEditing ? 'New Password (leave blank to keep current)' : 'Password'}</Label>
          <div className="relative">
            <Input id="password" name="password" type={showPassword ? 'text' : 'password'} minLength={8} className="pr-10" />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1 relative">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} minLength={8} className="pr-10" />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="role">Role</Label>
          <Select name="role" defaultValue={initialData?.role || 'EDITOR'}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="EDITOR">EDITOR</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">Defines access level across the portal.</p>
        </div>

        <div className="space-y-2 col-span-2 sm:col-span-1 flex flex-col justify-center">
          <Label className="mb-3">Account Status</Label>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isActive" name="isActive" defaultChecked={initialData ? initialData.isActive : true} className="w-4 h-4 rounded border-gray-300" />
            <Label htmlFor="isActive" className="font-normal text-sm">Active</Label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Inactive users cannot log in.</p>
        </div>
      </div>

      <div className="pt-4 border-t border-[#D9E1DC] flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.push('/admin/users')}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#1F7A5C] hover:bg-[#165B44]" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save User'}
        </Button>
      </div>
    </form>
  )
}
