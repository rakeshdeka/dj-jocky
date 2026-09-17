"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../../components/dashboard/ui/card"
import { Button } from "../../../components/dashboard/ui/button"
import { Input } from "../../../components/dashboard/ui/input"
import { Label } from "../../../components/dashboard/ui/label"
import { Textarea } from "../../../components/dashboard/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/dashboard/ui/select"
import { Checkbox } from "../../../components/dashboard/ui/checkbox"
import { ArrowLeft, UserPlus } from "lucide-react"
import MainLayout from "../../../components/dashboard/layout/MainLayout"
import {
  createAdminUser,
  toAdminCreateUserRole,
  toAdminUserErrorMessage,
  validateAdminUserPassword,
} from "../../../lib/admin-users-api"

type InternalUserRole = "client" | "designer"

interface UserFormData {
  name: string
  email: string
  password: string
  role: InternalUserRole | ""
  bio: string
  company: string
  phone: string
  portfolioUrl: string
  requireEmailVerification: boolean
}

const AddUser: React.FC = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "",
    bio: "",
    company: "",
    phone: "",
    portfolioUrl: "",
    requireEmailVerification: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as InternalUserRole }))
  }

  const handleVerificationChange = (checked: boolean | "indeterminate") => {
    setFormData((prev) => ({ ...prev, requireEmailVerification: checked === true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Login required")
      navigate("/admin/login")
      return
    }

    const name = formData.name.trim()
    const email = formData.email.trim()
    const password = formData.password
    const role = formData.role

    if (!name || !email || !role || !password) {
      toast.error("Please fill in all required fields")
      return
    }

    const passwordError = validateAdminUserPassword(password)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createAdminUser(token, {
        email,
        password,
        name,
        role: toAdminCreateUserRole(role as InternalUserRole),
        bio: formData.bio,
        company: formData.company,
        phone: formData.phone,
        portfolioUrl: formData.portfolioUrl,
        emailVerified: formData.requireEmailVerification ? false : undefined,
      })

      toast.success(result.message)
      navigate("/admin/users")
    } catch (error: unknown) {
      toast.error(toAdminUserErrorMessage(error, "Failed to create user"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password.trim() &&
    formData.role

  return (
    <MainLayout>
      <div className="mb-8">
        <Link to="/admin/users" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to User Management
        </Link>
        <h1 className="text-3xl font-bold mb-2">Add Internal User</h1>
        <p className="text-muted-foreground">
          Create client or designer accounts for your team. Share the login credentials after creation.
        </p>
      </div>

      <Card className="bg-secondary/30 border-border">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Accounts are email-verified by default so users can sign in with normal login immediately.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Jane Designer"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="designer@yourcompany.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="SecurePass1"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  maxLength={128}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  8–128 characters, with at least one letter and one number.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">User Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                        Client
                      </div>
                    </SelectItem>
                    <SelectItem value="designer">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        Designer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <p className="text-sm text-muted-foreground mt-1">
                  {formData.role === "client" && "Clients can view and manage their own projects"}
                  {formData.role === "designer" && "Designers can work on assigned projects and briefs"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Optional"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Optional"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Optional"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  type="url"
                  placeholder="https://optional-portfolio.com"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="requireEmailVerification"
                checked={formData.requireEmailVerification}
                onCheckedChange={handleVerificationChange}
              />
              <div className="space-y-1">
                <Label htmlFor="requireEmailVerification" className="text-sm font-normal">
                  Require email verification (OTP before login)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Leave unchecked so the user can log in immediately with the password above.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="ghost" type="button" onClick={() => navigate("/admin/users")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isFormValid} className="gap-1">
              <UserPlus className="h-4 w-4" />
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </MainLayout>
  )
}

export default AddUser
