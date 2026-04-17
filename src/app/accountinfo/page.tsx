'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { TimeDate } from "@/components/time-date"

import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { loadUser, saveUser, User } from "@/lib/auth-storage"
import { Eye, EyeOff, RefreshCw, Upload, User as UserIcon } from "lucide-react"
import { useEffect, useState } from "react"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

export default function AccountInfo() {
    // ---- Load user from localStorage (set by Login/Register) ----
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const response = await fetch('/api/auth/me')
                if (response.ok) {
                    const body = await response.json()
                    if (body.user) {
                        const apiUser = body.user
                        setUser({
                            id: apiUser.id,
                            username: apiUser.name ?? apiUser.email.split('@')[0],
                            role: apiUser.role ?? '',
                            email: apiUser.email,
                            avatar: apiUser.avatar,
                            employeeId: apiUser.employeeId ?? '',
                            phoneNumber: apiUser.phoneNumber ?? '',
                            contactPhone: apiUser.phoneNumber ?? apiUser.contactPhone ?? '',
                            contactTelegram: apiUser.contactTelegram ?? '',
                            contactWhatsapp: apiUser.contactWhatsapp ?? '',
                            jobTitle: apiUser.jobTitle ?? '',
                            department: apiUser.department ?? '',
                            company: apiUser.company ?? '',
                            supervisorName: apiUser.supervisorName ?? '',
                            employmentType: apiUser.employmentType ?? '',
                            biography: apiUser.biography ?? '',
                            twoFAEnabled: apiUser.twoFAEnabled ?? false,
                            createdAt: apiUser.createdAt ?? new Date().toISOString(),
                            lastLoginAt: apiUser.lastLoginAt ?? new Date().toISOString(),
                        })
                        return
                    }
                }
            } catch (error) {
                console.warn('Could not load remote user, falling back to local storage.', error)
            }
            const localUser = await loadUser()
            setUser(localUser ?? {
                id: "guest",
                username: "guest",
                role: "customer",
                email: "guest@example.com",
                twoFAEnabled: false,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
            })
        }
        load()

        // Load other users for role management
        async function loadUsers() {
            setLoadingUsers(true)
            try {
                const response = await fetch('/api/auth/users')
                if (response.ok) {
                    const data = await response.json()
                    setAllUsers(data.users || [])
                }
            } catch (error) {
                console.warn('Could not load users for role management.', error)
            } finally {
                setLoadingUsers(false)
            }
        }
        loadUsers()

        const onChange = async () => {
            const localUserChange = await loadUser()
            if (localUserChange) setUser(localUserChange)
        }
        window.addEventListener("auth:user-updated", onChange)
        return () => window.removeEventListener("auth:user-updated", onChange)
    }, [])

    // ---- Editable mirrors ----
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [contactPhone, setContactPhone] = useState("")
    const [employeeId, setEmployeeId] = useState("")
    const [jobTitle, setJobTitle] = useState("")
    const [department, setDepartment] = useState("")
    const [company, setCompany] = useState("")
    const [supervisorName, setSupervisorName] = useState("")
    const [employmentType, setEmploymentType] = useState("")
    const [biography, setBiography] = useState("")
    const [contactTelegram, setContactTelegram] = useState("")
    const [contactWhatsapp, setContactWhatsapp] = useState("")
    const [twoFAEnabled, setTwoFAEnabled] = useState(false)

    //NDT status
    const [certifications, setCertifications] = useState<Array<{
        id?: string
        method: string
        level: string
        certNumber?: string
        approvalNo?: string
        expiresAt?: string
        renewDate?: string
        active?: boolean
        createdAt?: string
    }>>([])

    // Add certification form state
    const [addCertNumber, setAddCertNumber] = useState("")
    const [addApprovalNo, setAddApprovalNo] = useState("")
    const [addExpiresAt, setAddExpiresAt] = useState("")
    const [addRenewDate, setAddRenewDate] = useState("")
    const [addMethod, setAddMethod] = useState("")
    const [addLevel, setAddLevel] = useState("")

    // Edit certification form state
    const [editCertNumber, setEditCertNumber] = useState("")
    const [editApprovalNo, setEditApprovalNo] = useState("")
    const [editExpiresAt, setEditExpiresAt] = useState("")
    const [editRenewDate, setEditRenewDate] = useState("")
    const [editMethod, setEditMethod] = useState("")
    const [editLevel, setEditLevel] = useState("")

    const [loadingQualifications, setLoadingQualifications] = useState(false)
    const [editingCertId, setEditingCertId] = useState<string | null>(null)




    // Session timeout state (admin only)
    const [sessionTimeout, setSessionTimeout] = useState(30) // minutes
    const [loadingSessionTimeout, setLoadingSessionTimeout] = useState(false)

    // Password (mock UI only)
    const [currentPw, setCurrentPw] = useState("")
    const [newPw, setNewPw] = useState("")
    const [confirmPw, setConfirmPw] = useState("")
    const [showPw, setShowPw] = useState(false)

    const [loadingProfile, setLoadingProfile] = useState(false)
    const [loadingPassword, setLoadingPassword] = useState(false)
    const [loadingSecurity, setLoadingSecurity] = useState(false)
    const [loadingAvatar, setLoadingAvatar] = useState(false)
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Seed editable fields when user loads/changes
    useEffect(() => {
        if (!user) return
        setUsername(user.username ?? "")
        setEmail(user.email ?? "")
        setContactPhone(user.phoneNumber ?? user.contactPhone ?? "")
        setContactTelegram(user.contactTelegram ?? "")
        setContactWhatsapp(user.contactWhatsapp ?? "")
        setTwoFAEnabled(user.twoFAEnabled ?? false)

        setEmployeeId(user.employeeId ?? "")
        setJobTitle(user.jobTitle ?? "")
        setDepartment(user.department ?? "")
        setCompany(user.company ?? "")
        setSupervisorName(user.supervisorName ?? "")
        setEmploymentType(user.employmentType ?? "")
        setBiography(user.biography ?? "")
    }, [user])

    // Load session timeout settings for admin
    useEffect(() => {
        if (user?.role === 'admin') {
            const loadSessionSettings = async () => {
                try {
                    const response = await fetch('/api/auth/session-settings')
                    if (response.ok) {
                        const data = await response.json()
                        setSessionTimeout(Math.floor(data.sessionTimeout / 60000)) // Convert to minutes
                    }
                } catch (error) {
                    console.warn('Could not load session settings.', error)
                }
            }
            loadSessionSettings()
        }
    }, [user?.role])

    // Load NDT qualifications
    useEffect(() => {
        const loadQualifications = async () => {
            if (!user) return
            setLoadingQualifications(true)
            try {
                const response = await fetch('/api/auth/ndt-qualifications')
                if (response.ok) {
                    const data = await response.json()
                    setCertifications(data.qualifications || [])
                }
            } catch (error) {
                console.warn('Could not load NDT qualifications.', error)
            } finally {
                setLoadingQualifications(false)
            }
        }
        loadQualifications()
    }, [user?.id])

    const resetAlerts = () => { setMessage(null); setError(null) }

    const handleSaveProfile = async () => {
        if (!user) return
        resetAlerts()
        if (!username.trim()) return setError("Username cannot be empty.")
        if (contactPhone && !/^[\d +()-]{6,}$/.test(contactPhone)) {
            return setError("Phone number format looks invalid.")
        }
        setLoadingProfile(true)
        // try {
        //     const next: User = {
        //         ...user,
        //         username,
        //         contactPhone,
        //         contactTelegram,
        //         contactWhatsapp,
        //     }
        //     saveUser(next)
        //     setUser(next)
        //     setMessage("Profile updated.")
        // } catch (e: any) {
        //     setError(e?.message || "Failed to update profile.")
        // } finally {
        //     setLoadingProfile(false)
        // }

        try {
            const response = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: username,
                    email,
                    phoneNumber: contactPhone,
                    contactTelegram,
                    contactWhatsapp,
                    employeeId,
                    jobTitle,
                    department,
                    company,
                    supervisorName,
                    employmentType,
                    biography,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update profile')
            }

            const data = await response.json()
            // Update local user state with the updated user from DB
            setUser({
                ...user,
                username: data.user.name || username,
                email: data.user.email || email,
                avatar: data.user.avatar || user.avatar,
                contactPhone: data.user.phoneNumber || contactPhone,
                contactTelegram: data.user.contactTelegram || contactTelegram,
                contactWhatsapp: data.user.contactWhatsapp || contactWhatsapp,
                employeeId: data.user.employeeId || employeeId,
                jobTitle: data.user.jobTitle || jobTitle,
                department: data.user.department || department,
                company: data.user.company || company,
                supervisorName: data.user.supervisorName || supervisorName,
                employmentType: data.user.employmentType || employmentType,
                biography: data.user.biography || biography,
            })
            setMessage("Profile updated.")
        } catch (e: any) {
            setError(e?.message || "Failed to update profile.")
        } finally {
            setLoadingProfile(false)
        }
    }

    const handleChangePassword = async () => {
        resetAlerts()
        if (newPw.length < 8) return setError("New password must be at least 8 characters.")
        // if (!/[A-Z]/.test(newPw) || !/[a-z]/.test(newPw) || !/\d/.test(newPw)) {
        //     return setError("Use upper, lower, and a number in the new password.")
        // }
        if (newPw !== confirmPw) return setError("Passwords do not match.")
        setLoadingPassword(true)
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: currentPw,
                    newPassword: newPw,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to change password')
            }

            setCurrentPw(""); setNewPw(""); setConfirmPw("")
            setMessage("Password updated successfully.")
        } catch (e: any) {
            setError(e?.message || "Failed to change password.")
        } finally {
            setLoadingPassword(false)
        }
    }

    const handleSecuritySave = async () => {
        if (!user) return
        resetAlerts()
        setLoadingSecurity(true)
        try {
            const next = { ...user, twoFAEnabled }
            saveUser(next)
            setUser(next)
            setMessage(twoFAEnabled ? "Two-factor authentication enabled." : "Two-factor authentication disabled.")
        } catch (e: any) {
            setError(e?.message || "Failed to update security settings.")
        } finally {
            setLoadingSecurity(false)
        }
    }

    const handleSessionTimeoutUpdate = async () => {
        if (!user || user.role !== 'admin') return
        resetAlerts()
        if (sessionTimeout < 1) return setError("Session timeout must be at least 1 minute.")
        if (sessionTimeout > 480) return setError("Session timeout cannot exceed 8 hours (480 minutes).")

        setLoadingSessionTimeout(true)
        try {
            const response = await fetch('/api/auth/session-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionTimeout: sessionTimeout * 60000, // Convert to milliseconds
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update session timeout')
            }

            setMessage("Session timeout updated successfully.")
            // Refresh session settings globally
            if (typeof window !== 'undefined' && (window as any).refreshSessionSettings) {
                (window as any).refreshSessionSettings()
            }
        } catch (e: any) {
            setError(e?.message || "Failed to update session timeout.")
        } finally {
            setLoadingSessionTimeout(false)
        }
    }

    const handleAvatarUpload = async () => {
        if (!selectedAvatar || !user) return
        resetAlerts()
        setLoadingAvatar(true)
        try {
            const formData = new FormData()
            formData.append('avatar', selectedAvatar)

            const response = await fetch('/api/auth/upload-avatar', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to upload avatar')
            }

            const data = await response.json()
            setUser({ ...user, avatar: data.avatar })
            setSelectedAvatar(null)
            setMessage("Avatar updated successfully.")
            // Dispatch event to update other components (like sidebar)
            window.dispatchEvent(new Event("auth:user-updated"))
        } catch (e: any) {
            setError(e?.message || "Failed to upload avatar.")
        } finally {
            setLoadingAvatar(false)
        }
    }

    const handleRoleUpdate = async () => {
        if (!selectedUserId) return setError("Please select a user.")
        resetAlerts()
        setLoadingRoleUpdate(true)
        try {
            const response = await fetch('/api/auth/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: selectedUserId,
                    role: selectedUserRole,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update role')
            }

            const data = await response.json()
            // Update the user list with the updated user
            setAllUsers(users =>
                users.map(u =>
                    u.id === data.user.id ? data.user : u
                )
            )
            setSelectedUserId("")
            setSelectedUserRole("user")
            setMessage("User role updated successfully.")
        } catch (e: any) {
            setError(e?.message || "Failed to update role.")
        } finally {
            setLoadingRoleUpdate(false)
        }
    }

    // NDT Certification Handlers
    const handleAddCertification = async () => {
        if (!addMethod || !addLevel) return setError("Method and level are required.")
        resetAlerts()
        setLoadingQualifications(true)
        try {
            const response = await fetch('/api/auth/ndt-qualifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: addMethod,
                    level: addLevel,
                    certNumber: addCertNumber || null,
                    approvalNo: addApprovalNo || null,
                    expiresAt: addExpiresAt || null,
                    renewDate: addRenewDate || null,

                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to add certification')
            }

            const data = await response.json()
            setCertifications(prev => [data.qualification, ...prev])
            setAddMethod("")
            setAddLevel("")
            setAddCertNumber("")
            setAddApprovalNo("")
            setAddExpiresAt("")
            setAddRenewDate("")
            setMessage("Certification added successfully.")
        } catch (e: any) {
            setError(e?.message || "Failed to add certification.")
        } finally {
            setLoadingQualifications(false)
        }
    }

    const handleEditCertification = (cert: typeof certifications[0]) => {
        if (!cert.id) return setError("Certification ID not found.")
        setEditingCertId(cert.id)
        // Store original values for editing in separate edit form state
        setEditMethod(cert.method)
        setEditLevel(cert.level)
        setEditCertNumber(cert.certNumber || "")
        setEditApprovalNo(cert.approvalNo || "")
        setEditExpiresAt(cert.expiresAt || "")
        setEditRenewDate(cert.renewDate || "")
    }

    const handleCancelEdit = () => {
        setEditingCertId(null)
        setEditMethod("")
        setEditLevel("")
        setEditCertNumber("")
        setEditApprovalNo("")
        setEditExpiresAt("")
        setEditRenewDate("")
    }
    {
        certifications.map((cert) => {
            const isActive = cert.expiresAt
                ? new Date(cert.expiresAt) > new Date()
                : false;

            return (
                <>
                    {isActive ? (
                        <Badge className="bg-transparent text-green-600 border border-green-500">
                            Active
                        </Badge>
                    ) : (
                        <Badge className="bg-transparent text-red-600 border border-red-500">
                            Expired
                        </Badge>
                    )}
                </>
            );
        })
    }

    const handleUpdateCertification = async (id: string, updates: Partial<{
        method: string
        level: string
        certNumber: string
        approvalNo: string
        expiresAt: string
        renewDate: string
        active: boolean
    }>) => {
        if (!id) return
        resetAlerts()
        setLoadingQualifications(true)
        try {
            const response = await fetch('/api/auth/ndt-qualifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    ...updates,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update certification')
            }

            const data = await response.json()
            setCertifications(prev => prev.map(cert =>
                cert.id === id ? { ...cert, ...data.qualification } : cert

            ))
            setEditingCertId(null)
            setEditMethod("")
            setEditLevel("")
            setEditCertNumber("")
            setEditApprovalNo("")
            setEditExpiresAt("")
            setEditRenewDate("")
            setMessage("Certification updated successfully.")
        } catch (e: any) {
            setError(e?.message || "Failed to update certification.")
        } finally {
            setLoadingQualifications(false)
        }
    }

    const handleDeleteCertification = async (id: string) => {
        if (!id) return
        if (!confirm("Are you sure you want to delete this certification?")) return
        resetAlerts()
        setLoadingQualifications(true)
        try {
            const response = await fetch('/api/auth/ndt-qualifications', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete certification')
            }

            setCertifications(prev => prev.filter(cert => cert.id !== id))
            setMessage("Certification deleted successfully.")
        } catch (e: any) {
            setError(e?.message || "Failed to delete certification.")
        } finally {
            setLoadingQualifications(false)
        }
    }


    // Mode Toggle Component
    function ModeToggle() {
        const { setTheme } = useTheme()
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="cursor-pointer">
                        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                        <span className="sr-only ">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("light")} >
                        Light
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("dark")}>
                        Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("system")}>
                        System
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    // const maskEmail = (email: string) => {
    //     const [name, domain] = email.split("@")
    //     if (!name || !domain) return email
    //     const masked = name.length <= 2 ? name[0] + "" : name[0] + "".repeat(name.length - 2) + name[name.length - 1]
    //     return `${masked}@${domain}`
    // }

    // const email = user?.email ?? ""
    const role = user?.role ?? "user"

    // State for user role management
    const [allUsers, setAllUsers] = useState<Array<{ id: string, name: string, email: string, role: string, employeeId?: string, jobTitle?: string, department?: string }>>([])
    const [selectedUserId, setSelectedUserId] = useState("")
    const [selectedUserRole, setSelectedUserRole] = useState("user")
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [loadingRoleUpdate, setLoadingRoleUpdate] = useState(false)

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    {/* Left: Breadcrumb + sidebar trigger */}
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/accountinfo">Account Information</BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <TimeDate />
                </header>

                {/* Content */}
                <main className="px-4 md:px-6 pb-8">
                    <div className="mx-auto max-w-5xl">
                        {(message || error) && (
                            <div className={`mb-4 rounded-md border p-3 text-sm ${error ? "border-destructive text-destructive" : "border-green-600 text-green-700"}`}>
                                {error || message}
                            </div>
                        )}

                        <Tabs defaultValue="profile" className="w-full">
                            <TabsList className="w-full justify-start overflow-x-auto">
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="security">Security</TabsTrigger>
                                <TabsTrigger value="role">Role</TabsTrigger>
                                <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
                                {/* <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger> */}
                            </TabsList>

                            {/* PROFILE */}
                            <TabsContent value="profile" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Profile</CardTitle>
                                        <CardDescription>Update your public account information.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-6">
                                        {/* Avatar Section */}
                                        <div className="flex items-center gap-6">
                                            <Avatar className="w-20 h-20">
                                                <AvatarImage src={user?.avatar || undefined} alt="Avatar" />
                                                <AvatarFallback>
                                                    <UserIcon className="w-8 h-8" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <Label htmlFor="avatar-upload">Avatar</Label>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Upload a profile picture. Max 5MB, JPEG/PNG/GIF only.
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="avatar-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setSelectedAvatar(e.target.files?.[0] || null)}
                                                        className="hidden"
                                                    />
                                                    <Label
                                                        htmlFor="avatar-upload"
                                                        className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm"
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                        Choose File
                                                    </Label>
                                                    {selectedAvatar && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {selectedAvatar.name}
                                                        </span>
                                                    )}
                                                    <Button
                                                        disabled={!selectedAvatar || loadingAvatar}
                                                        onClick={handleAvatarUpload}
                                                        size="sm"
                                                    >
                                                        {loadingAvatar ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                        Upload
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="username">Username</Label>
                                            <Input
                                                id="username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Your username"
                                            />
                                        </div>

                                        {/* Email reflects what was entered at Login */}
                                        {/* <div className="grid gap-2">
                                            <Label htmlFor="email">Email (read-only)</Label>
                                            <Input id="email" value={email} readOnly />
                                            <p className="text-xs text-muted-foreground">
                                                Shown here for reference. Change email in the Email tab.
                                            </p>
                                            </div> */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                value={email} onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email" />

                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="employeeId">Employee ID</Label>
                                            <Input
                                                id="employeeId"
                                                value={employeeId}
                                                onChange={(e) => setEmployeeId(e.target.value)}
                                                placeholder="Your employee ID"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="jobTitle">Job Title</Label>
                                            <Input
                                                id="jobTitle"
                                                value={jobTitle}
                                                onChange={(e) => setJobTitle(e.target.value)}
                                                placeholder="Your job title"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Input
                                                id="department"
                                                value={department}
                                                onChange={(e) => setDepartment(e.target.value)}
                                                placeholder="Your department"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="company">Company</Label>
                                            <Input
                                                id="company"
                                                value={company}
                                                onChange={(e) => setCompany(e.target.value)}
                                                placeholder="Your company"
                                            />
                                            <div className="grid gap-2">
                                                <Label htmlFor="supervisorName">Supervisor Name</Label>
                                                <Input id="supervisorName"
                                                    value={supervisorName}
                                                    onChange={(e) => setSupervisorName(e.target.value)}
                                                    placeholder="Your supervisor's name" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="employmentType">Employment Type</Label>
                                                <Input id="employmentType"
                                                    value={employmentType}
                                                    onChange={(e) => setEmploymentType(e.target.value)}
                                                    placeholder="Your employment type" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="biography">Biography</Label>
                                                <Input id="biography" value={biography} onChange={(e) => setBiography(e.target.value)} placeholder="A short bio about you" />
                                            </div>

                                        </div>
                                        {/* <div className="flex gap-3">
                                            <Button disabled={loadingProfile} onClick={handleSaveProfile}>
                                                {loadingProfile ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                Save Changes
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    if (!user) return
                                                    setUsername(user.username ?? "")
                                                    setContactPhone(user.contactPhone ?? "")
                                                    setContactTelegram(user.contactTelegram ?? "")
                                                    setContactWhatsapp(user.contactWhatsapp ?? "")
                                                }}
                                            >
                                                Reset
                                            </Button>
                                        </div> */}
                                    </CardContent>

                                </Card>
                                <Card className="mt-6 ">
                                    <CardHeader>
                                        <CardTitle>Email</CardTitle>
                                        <CardDescription>Primary email for sign-in & notifications.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email-ro">Primary Email</Label>
                                            <Input id="email-ro" value={email} readOnly />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Status</Label>
                                            <Input readOnly value="Verified" />
                                        </div>
                                        {/* <div className="md:col-span-2">
                                            <p className="text-xs text-muted-foreground">Masked: {email ? maskEmail(email) : "—"}</p>
                                        </div> */}
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-muted-foreground">
                                                To change your email, implement an email-change flow (verify new address, re-login).
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle>Contact</CardTitle>
                                        <CardDescription>How we (and your team) can reach you.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-6 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input id="phone"
                                                placeholder="Input your phone number"
                                                value={contactPhone}
                                                onChange={(e) => setContactPhone(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="wa">WhatsApp</Label>
                                            <Input id="wa"
                                                placeholder="Input your WhatsApp number"
                                                value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="tg">Telegram</Label>
                                            <Input id="tg" placeholder="@username" value={contactTelegram} onChange={(e) => setContactTelegram(e.target.value)} />
                                        </div>
                                        {/* <div className="md:col-span-2 flex gap-3">
                                            <Button disabled={loadingProfile} onClick={handleSaveProfile}>
                                                {loadingProfile ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                Save Contact
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    if (!user) return
                                                    setContactPhone(user.contactPhone ?? "")
                                                    setContactTelegram(user.contactTelegram ?? "")
                                                    setContactWhatsapp(user.contactWhatsapp ?? "")
                                                }}
                                            >
                                                Reset
                                            </Button>
                                        </div> */}
                                    </CardContent>
                                </Card>
                                <div className="flex gap-3 mt-4">
                                    <Button disabled={loadingProfile} onClick={handleSaveProfile}>
                                        {loadingProfile ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Save Changes
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (!user) return
                                            setUsername(user.username ?? "")
                                            setContactPhone(user.contactPhone ?? "")
                                            setContactTelegram(user.contactTelegram ?? "")
                                            setContactWhatsapp(user.contactWhatsapp ?? "")
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* SECURITY */}
                            <TabsContent value="security" className="mt-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Password */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Change Password</CardTitle>
                                            <CardDescription>Use a strong, unique password.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="currentPw">Current Password</Label>
                                                <Input
                                                    id="currentPw"
                                                    type={showPw ? "text" : "password"}
                                                    value={currentPw}
                                                    onChange={(e) => setCurrentPw(e.target.value)}
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="newPw">New Password</Label>
                                                <Input
                                                    id="newPw"
                                                    type={showPw ? "text" : "password"}
                                                    value={newPw}
                                                    onChange={(e) => setNewPw(e.target.value)}
                                                    placeholder="At least 8 characters"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="confirmPw">Confirm New Password</Label>
                                                <Input
                                                    id="confirmPw"
                                                    type={showPw ? "text" : "password"}
                                                    value={confirmPw}
                                                    onChange={(e) => setConfirmPw(e.target.value)}
                                                    placeholder="Re-enter new password"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" type="button" onClick={() => setShowPw((s) => !s)}>
                                                    {showPw ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                                    {showPw ? "Hide" : "Show"} passwords
                                                </Button>
                                                <div className="flex-1" />
                                                <Button disabled={loadingPassword} onClick={handleChangePassword}>
                                                    {loadingPassword ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    Update Password
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 2FA / sessions */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Security</CardTitle>
                                            <CardDescription>Two-factor auth and session info.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid gap-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Two-Factor Authentication</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Add an extra layer of security to your account.
                                                    </p>
                                                </div>
                                                <Switch checked={twoFAEnabled} onCheckedChange={setTwoFAEnabled} />
                                            </div>


                                            <Separator />

                                            <div className="grid gap-1">
                                                <Label>Last Login</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}
                                                </p>
                                            </div>
                                            <div className="grid gap-1">
                                                <Label>Account Created</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                                                </p>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button disabled={loadingSecurity} onClick={handleSecuritySave}>
                                                    {loadingSecurity ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    Save Security
                                                </Button>

                                                <Button variant="outline" type="button" onClick={() => setTwoFAEnabled(user?.twoFAEnabled ?? false)}>
                                                    Reset
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    {/* Session Timeout - Admin only */}
                                    {user?.role === 'admin' && (
                                        <Card>
                                            <CardHeader>

                                                <CardTitle>Session Timeout</CardTitle>
                                                <CardDescription>Manage your session timeout settings.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="grid gap-4">

                                                <div className="grid gap-2">

                                                    <Label htmlFor="sessionTimeout">Session Timeout</Label>
                                                    <select id="sessionTimeout" value={sessionTimeout} onChange={(e) => setSessionTimeout(Number(e.target.value))} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                                        <option value={5}>5 minutes</option>
                                                        <option value={10}>10 minutes</option>
                                                        <option value={15}>15 minutes</option>
                                                        <option value={30}>30 minutes</option>
                                                        <option value={60}>1 hour</option>
                                                        <option value={240}>4 hours</option>
                                                        <option value={480}>8 hours</option>
                                                    </select>
                                                    <p className="text-sm text-muted-foreground">
                                                        How long before inactive sessions automatically log out users. Minimum 1 minute, maximum 8 hours.
                                                    </p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button disabled={loadingSessionTimeout} onClick={handleSessionTimeoutUpdate}>
                                                        {loadingSessionTimeout ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                        Update Timeout
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>

                            {/* ROLE (read-only) */}
                            <TabsContent value="role" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Role</CardTitle>
                                        <CardDescription>Your permission level in the system.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2 pointer-events-none select-none">
                                            <Label htmlFor="role">Current Role</Label>
                                            <Input id="role" value={role?.toUpperCase()} readOnly />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Capabilities</Label>
                                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                                {role === "admin" && (<><li>Manage users & roles</li><li>Full system access</li></>)}
                                                {role === "manager" && (<><li>Approve requests</li><li>Manage team data</li></>)}
                                                {role === "engineer" && (<><li>Create & edit own records</li><li>View permitted resources</li></>)}
                                                {role === "customer" && (<><li>Create & edit own records</li><li>View permitted resources</li></>)}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* For manager and engineer */}
                                {role !== "admin" && role !== "customer" && (
                                    <Card className="mt-6">
                                        <CardHeader>
                                            <CardTitle>NDT Certification Status</CardTitle>
                                            <CardDescription>Manage your NDT certifications and qualifications.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid gap-6">
                                            {/* Add New Certification */}
                                            <div className="rounded-md border p-4">
                                                <h4 className="mb-3 text-sm font-medium">Add New Certification</h4>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="add-method">Method</Label>
                                                        <Select
                                                            value={addMethod}
                                                            onValueChange={(value) => {
                                                                setAddMethod(value)
                                                                setAddLevel("")
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select method" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="UT">UT</SelectItem>
                                                                <SelectItem value="RT">RT</SelectItem>
                                                                <SelectItem value="MT">MT</SelectItem>
                                                                <SelectItem value="PT">PT</SelectItem>
                                                                <SelectItem value="ET">ET</SelectItem>
                                                                <SelectItem value="LT">LT</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="add-level">Level</Label>
                                                        <Select
                                                            value={addLevel}
                                                            onValueChange={setAddLevel}
                                                            disabled={!addMethod}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select level" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="L1">Level 1</SelectItem>
                                                                <SelectItem value="L2">Level 2</SelectItem>
                                                                <SelectItem value="L3">Level 3</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="grid gap-4 md:grid-cols-2 mt-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="certNumber">Certification </Label>
                                                        <Input
                                                            id="certNumber"
                                                            placeholder="Enter your certification"
                                                            value={addCertNumber}
                                                            onChange={(e) => setAddCertNumber(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="certNumber">Approval No. </Label>
                                                        <Input
                                                            id="approvalNo"
                                                            placeholder="Enter your approval number"
                                                            value={addApprovalNo}
                                                            disabled={!addMethod || addLevel === "L1"}
                                                            onChange={(e) => setAddApprovalNo(e.target.value)}
                                                        />
                                                    </div>


                                                </div>
                                                <div className="grid gap-4 md:grid-cols-2 mt-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="expiresAt">Expiration Date</Label>
                                                        <Input
                                                            id="expiresAt"
                                                            type="date"
                                                            value={addExpiresAt}
                                                            onChange={(e) => setAddExpiresAt(e.target.value)}
                                                        />

                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="renewDate">Renew Date</Label>
                                                        <Input
                                                            id="renewDate"
                                                            type="date"
                                                            value={addRenewDate}
                                                            onChange={(e) => setAddRenewDate(e.target.value)}
                                                        />
                                                    </div>

                                                </div>
                                                <div className="flex gap-3 mt-4">
                                                    <Button
                                                        disabled={!addMethod || !addLevel || loadingQualifications}
                                                        onClick={handleAddCertification}
                                                    >
                                                        {loadingQualifications ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                        Add Certification
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setAddMethod("")
                                                            setAddLevel("")
                                                            setAddCertNumber("")
                                                            setAddApprovalNo("")
                                                            setAddExpiresAt("")
                                                            setAddRenewDate("")

                                                        }}
                                                    >
                                                        Reset
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Existing Certifications */}
                                            <div className="grid gap-4">
                                                <h4 className="text-sm font-medium">Your Certifications</h4>
                                                {loadingQualifications && certifications.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">Loading certifications...</p>
                                                ) : certifications.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">No certifications found.</p>
                                                ) : (
                                                    <div className="grid gap-3">
                                                        {certifications.map((cert) => (
                                                            <div key={cert.id} className="rounded-md border p-4">
                                                                {editingCertId === cert.id ? (
                                                                    <>
                                                                        {/* Edit Mode */}
                                                                        <div className="flex items-center gap-2 mb-4">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm">Method:</span>
                                                                                <Badge variant="outline">
                                                                                    {editMethod}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm">Level:</span>
                                                                                <Select
                                                                                    value={editLevel}
                                                                                    onValueChange={setEditLevel}
                                                                                    disabled={!editMethod}
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Select level" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="L1">Level 1</SelectItem>
                                                                                        <SelectItem value="L2">Level 2</SelectItem>
                                                                                        <SelectItem value="L3">Level 3</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid gap-4 md:grid-cols-2 mb-4">
                                                                            <div className="grid gap-2">
                                                                                <Label>Certification Number:</Label>
                                                                                <span className="text-sm ">{editCertNumber}</span>
                                                                            </div>
                                                                            <div className="grid gap-2">
                                                                                <Label htmlFor={`approvalNo-${cert.id}`}>Approval Number:</Label>
                                                                                <Input
                                                                                    id={`approvalNo-${cert.id}`}
                                                                                    placeholder="Enter your approval Number"
                                                                                    value={editApprovalNo}
                                                                                    disabled={!editMethod || editLevel === "L1"}
                                                                                    onChange={(e) => setEditApprovalNo(e.target.value)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid gap-4 md:grid-cols-2 mb-4">
                                                                            <div className="grid gap-2">
                                                                                <Label htmlFor={`expiresAt-${cert.id}`}>Expiration Date:</Label>
                                                                                <Input
                                                                                    id={`expiresAt-${cert.id}`}
                                                                                    type="date"
                                                                                    value={editExpiresAt}
                                                                                    onChange={(e) => setEditExpiresAt(e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div className="grid gap-2">
                                                                                <Label htmlFor={`renewDate-${cert.id}`}>Renew Date:</Label>
                                                                                <Input
                                                                                    id={`renewDate-${cert.id}`}
                                                                                    type="date"
                                                                                    value={editRenewDate}
                                                                                    onChange={(e) => setEditRenewDate(e.target.value)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={handleCancelEdit}
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                                            <Button
                                                                                variant="default"
                                                                                size="sm"
                                                                                onClick={() => handleUpdateCertification(cert.id!, {
                                                                                    method: editMethod,
                                                                                    level: editLevel,
                                                                                    certNumber: editCertNumber ?? undefined,
                                                                                    approvalNo: editApprovalNo ?? undefined,
                                                                                    expiresAt: editExpiresAt ?? undefined,
                                                                                    renewDate: editRenewDate ?? undefined
                                                                                })}
                                                                            >
                                                                                {loadingQualifications ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                                                Save
                                                                            </Button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {/* View Mode */}
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm">Method:</span>
                                                                                <Badge variant="outline">
                                                                                    {cert.method}
                                                                                </Badge>
                                                                                <span className="text-sm">Level:</span>

                                                                                <Badge variant="outline">
                                                                                    {cert.level}
                                                                                </Badge>
                                                                                {cert.expiresAt && new Date(cert.expiresAt) > new Date() ? (
                                                                                    <Badge className="bg-transparent text-green-600 border border-green-500 hover:bg-green-100 dark:bg-green-500 dark:text-white dark:hover:bg-green-600">
                                                                                        Active
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge className="bg-transparent text-red-600 border border-red-500 hover:bg-red-100 dark:bg-red-500 dark:text-white dark:hover:bg-red-600">
                                                                                        Expired
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8"
                                                                                    onClick={() => handleEditCertification(cert)}
                                                                                >
                                                                                    <span className="sr-only">Edit</span>
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        width="16"
                                                                                        height="16"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="2"
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    >
                                                                                        <path d="M12 20h9" />
                                                                                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                                                                    </svg>
                                                                                </Button>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8 text-destructive"
                                                                                    onClick={() => cert.id && handleDeleteCertification(cert.id)}
                                                                                >
                                                                                    <span className="sr-only">Delete</span>
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                        <path d="M3 6h18" />
                                                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                                                    </svg>
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid gap-2 mt-3">
                                                                            {cert.certNumber && (
                                                                                <div className="flex gap-2">
                                                                                    <Label className="w-24 text-xs text-muted-foreground">Cert Number:</Label>
                                                                                    <span className="text-sm">{cert.certNumber}</span>
                                                                                </div>
                                                                            )}
                                                                            {cert.approvalNo && (
                                                                                <div className="flex gap-2">
                                                                                    <Label className="w-24 text-xs text-muted-foreground">Approval No:</Label>
                                                                                    <span className="text-sm">{cert.approvalNo}</span>
                                                                                </div>
                                                                            )}
                                                                            {cert.expiresAt && (
                                                                                <div className="flex gap-2">
                                                                                    <Label className="w-24 text-xs text-muted-foreground">Expires:</Label>
                                                                                    <span className="text-sm">{new Date(cert.expiresAt).toLocaleDateString()}</span>
                                                                                </div>
                                                                            )}
                                                                            {cert.renewDate && (
                                                                                <div className="flex gap-2">
                                                                                    <Label className="w-24 text-xs text-muted-foreground">Renew Date:</Label>
                                                                                    <span className="text-sm">{new Date(cert.renewDate).toLocaleDateString()}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                {/* USER ROLE MANAGEMENT - Only show for admin */}
                                {role === "admin" && (
                                    <Card className="mt-6">
                                        <CardHeader>
                                            <CardTitle>User Role Management</CardTitle>
                                            <CardDescription>Manage roles for other users in the system.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="user-select">Select User</Label>
                                                <select
                                                    id="user-select"
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={selectedUserId}
                                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                                >
                                                    <option value="">-- Select a user --</option>
                                                    {allUsers.filter(u => u.role !== 'admin').map((u) => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.name} ({u.email}) - {u.role.toUpperCase()}
                                                        </option>
                                                    ))}
                                                </select>
                                                {allUsers.length === 0 && (
                                                    <p className="text-sm text-muted-foreground">
                                                        No other users found in the system.
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="role-select">New Role</Label>
                                                <select
                                                    id="role-select"
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={selectedUserRole}
                                                    onChange={(e) => setSelectedUserRole(e.target.value)}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="engineer">Engineer</option>
                                                </select>
                                                <p className="text-xs text-muted-foreground">
                                                    Note: Admin role assigned by system, contact support for admin changes.
                                                </p>
                                            </div>

                                            {selectedUserId && (
                                                <div className="rounded-md border border-green-600 bg-green-50 p-3 text-sm text-green-700">
                                                    <p className="font-medium">Selected User:</p>
                                                    <p className="text-sm">
                                                        {allUsers.find(u => u.id === selectedUserId)?.name}
                                                        ({allUsers.find(u => u.id === selectedUserId)?.email})
                                                    </p>
                                                    <p className="text-sm">
                                                        Current Role: {allUsers.find(u => u.id === selectedUserId)?.role.toUpperCase()}
                                                    </p>
                                                    <p className="text-sm">
                                                        New Role: {selectedUserRole.toUpperCase()}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex gap-3">
                                                <Button
                                                    disabled={!selectedUserId || loadingRoleUpdate}
                                                    onClick={handleRoleUpdate}
                                                >
                                                    {loadingRoleUpdate ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    Update Role
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedUserId("")
                                                        setSelectedUserRole("user")
                                                    }}
                                                >
                                                    Reset
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* EMAIL (info) */}
                            {/* <TabsContent value="email" className="mt-6">
                    <Card>
                    <CardHeader>
                        <CardTitle>Email</CardTitle>
                        <CardDescription>Primary email for sign-in & notifications.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                        <Label htmlFor="email-ro">Primary Email</Label>
                        <Input id="email-ro" value={email} readOnly />
                        </div>
                        <div className="grid gap-2">
                        <Label>Status</Label>
                        <Input readOnly value="Verified" />
                        </div>
                        <div className="md:col-span-2">
                        <p className="text-xs text-muted-foreground">Masked: {email ? maskEmail(email) : "—"}</p>
                        </div>
                        <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">
                            To change your email, implement an email-change flow (verify new address, re-login).
                        </p>
                        </div>
                    </CardContent>
                    </Card>
                </TabsContent> */}

                            {/* CONTACT */}
                            {/* <TabsContent value="contact" className="mt-6">
                    <Card>
                    <CardHeader>
                        <CardTitle>Contact</CardTitle>
                        <CardDescription>How we (and your team) can reach you.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" placeholder="+60 12 345 6789" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="wa">WhatsApp</Label>
                        <Input id="wa" placeholder="+60 12 345 6789" value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="tg">Telegram</Label>
                        <Input id="tg" placeholder="@username" value={contactTelegram} onChange={(e) => setContactTelegram(e.target.value)} />
                        </div>
                        <div className="md:col-span-2 flex gap-3">
                        <Button disabled={loadingProfile} onClick={handleSaveProfile}>
                            {loadingProfile ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Contact
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                            if (!user) return
                            setContactPhone(user.contactPhone ?? "")
                            setContactTelegram(user.contactTelegram ?? "")
                            setContactWhatsapp(user.contactWhatsapp ?? "")
                            }}
                        >
                            Reset
                        </Button>
                        </div>
                    </CardContent>
                    </Card>
                </TabsContent> */}

                            {/* ACCESSIBILITY */}
                            <TabsContent value="accessibility" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Accessibility</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <div className="flex items-center justify-between ">
                                            <div>
                                                <Label>Dark Mode</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Enable dark mode for better visibility in low-light environments...
                                                </p>
                                            </div>
                                            <ModeToggle />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}