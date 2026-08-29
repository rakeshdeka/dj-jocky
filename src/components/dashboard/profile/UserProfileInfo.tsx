import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Card, CardContent } from '../ui/card'
import { Camera, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { logout, updateUser, type UserRole } from '../../../redux/authSlice'

interface ProfileForm {
  name: string
  email: string
  role: string
  bio: string
  company: string
  phone: string
  portfolioUrl: string
  profilePictureUrl?: string | null
}

const UserProfileInfo = () => {
  const dispatch = useDispatch()
  const { token } = useSelector((state: RootState) => state.auth)
  const apiUrl = import.meta.env.VITE_API_URL

  const normalizeRole = (role: string): UserRole => {
    const r = role.toLowerCase().trim()
    if (r.includes('admin')) return 'admin'
    if (r.includes('designer')) return 'designer'
    return 'client'
  }

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<ProfileForm>({
    name: '',
    email: '',
    role: '',
    bio: '',
    company: '',
    phone: '',
    portfolioUrl: '',
    profilePictureUrl: null,
  })

  /* ================= GET PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return

      try {
        setLoading(true)

        const res = await axios.get(`${apiUrl}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })

        const u = res.data.user

        // ✅ FULL DATA SET
        setForm({
          name: u.name || '',
          email: u.email || '',
          role: u.role || '',
          bio: u.bio || '',
          company: u.company || '',
          phone: u.phone || '',
          portfolioUrl: u.portfolioUrl || '',
          profilePictureUrl: u.profilePictureUrl || null,
        })

        dispatch(
          updateUser({
            ...u,
            role: normalizeRole(String(u.role ?? '')),
          })
        )
      } catch (err: any) {
        console.error(err)

        if (err?.response?.status === 401) {
          dispatch(logout())
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [token, apiUrl, dispatch])

  /* ================= INPUT CHANGE ================= */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  /* ================= UPDATE PROFILE ================= */
  const handleProfileUpdate = async () => {
    if (!token) return

    try {
      setSaving(true)

      const res = await axios.patch(
        `${apiUrl}/profile`,
        {
          name: form.name,
          bio: form.bio,
          company: form.company,
          phone: form.phone,
          portfolioUrl: form.portfolioUrl,
          profilePictureUrl: form.profilePictureUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )

      const updatedUser = res.data.user

      // ✅ update redux
      dispatch(
        updateUser({
          ...updatedUser,
          role: normalizeRole(String(updatedUser.role ?? '')),
        })
      )

      toast.success('Profile updated successfully')
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  /* ================= IMAGE UPLOAD ================= */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      const base64 = event.target?.result as string

      setForm(prev => ({
        ...prev,
        profilePictureUrl: base64,
      }))

      toast.success('Profile image updated')
    }

    reader.readAsDataURL(file)
  }

  const removeProfileImage = () => {
    setForm(prev => ({ ...prev, profilePictureUrl: null }))
    toast.success('Profile image removed')
  }

  if (loading) {
    return <div className="text-white">Loading profile...</div>
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold border-b border-border pb-4">
        Profile Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* AVATAR */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <Avatar className="w-36 h-36 border-4 border-[#C4FE01]/30">
              {form.profilePictureUrl ? (
                <AvatarImage src={form.profilePictureUrl} />
              ) : (
                <AvatarFallback className="text-4xl bg-secondary">
                  {form.name?.[0]}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-full">
              <div className="flex gap-2">
                <label htmlFor="profile-upload" className="cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </label>

                {form.profilePictureUrl && (
                  <button
                    onClick={removeProfileImage}
                    className="h-10 w-10 rounded-full bg-destructive flex items-center justify-center"
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* FORM */}
        <Card className="col-span-2 bg-secondary/30 border-border">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Name" name="name" value={form.name} onChange={handleInputChange} />
              <InputField label="Email" name="email" value={form.email} disabled />
              {/* <InputField label="Role" name="role" value={form.role} disabled /> */}
              <InputField label="Bio" name="bio" value={form.bio} onChange={handleInputChange} />
              <InputField label="Company" name="company" value={form.company} onChange={handleInputChange} />
              <InputField label="Phone" name="phone" value={form.phone} onChange={handleInputChange} />
              <InputField label="Portfolio URL" name="portfolioUrl" value={form.portfolioUrl} onChange={handleInputChange} />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleProfileUpdate}
                disabled={saving}
                className="w-full md:w-auto bg-[#C4FE01]/90"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserProfileInfo

const InputField = ({ label, name, value, onChange, disabled = false }: any) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input name={name} value={value} onChange={onChange} disabled={disabled} />
  </div>
)