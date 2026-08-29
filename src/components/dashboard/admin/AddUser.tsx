"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
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

interface UserFormData {
  name: string
  email: string
  password: string
  role: string
  sendInvite: boolean
}

const AddUser: React.FC = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "",
    sendInvite: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleInviteChange = (checked: boolean | "indeterminate") => {
    setFormData((prev) => ({ ...prev, sendInvite: checked === true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedFormData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
    }

    if (!trimmedFormData.name || !trimmedFormData.email || !trimmedFormData.role || !trimmedFormData.password) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert(`${trimmedFormData.name} has been added as a ${trimmedFormData.role}`)
      navigate("/admin/users")
    } catch (error) {
      alert("There was a problem adding the user. Please try again.")
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
        <h1 className="text-3xl font-bold mb-2">Add New User</h1>
        <p className="text-muted-foreground">Create a new user account and assign their role</p>
      </div>

      <Card className="bg-secondary/30 border-border">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Enter the details of the new user you want to add to the platform</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Smith"
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
                  placeholder="john@example.com"
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
                  placeholder="Enter a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">User Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                        Admin
                      </div>
                    </SelectItem>
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
                  {formData.role === "admin" && "Admins have full access to all features and settings"}
                  {formData.role === "client" && "Clients can view and manage their own projects"}
                  {formData.role === "designer" && "Designers can work on assigned projects"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendInvite"
                checked={formData.sendInvite}
                onCheckedChange={handleInviteChange}
              />
              <Label htmlFor="sendInvite" className="text-sm font-normal">
                Send invitation email to the user
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="ghost" type="button" onClick={() => navigate("/admin/users")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isFormValid} className="gap-1">
              <UserPlus className="h-4 w-4" />
              {isSubmitting ? "Adding User..." : "Add User"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </MainLayout>
  )
}

export default AddUser
