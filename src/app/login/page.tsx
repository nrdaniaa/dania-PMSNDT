'use client'

import { Button } from "@/components/ui/button"
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

    import {
    loadAllUsers,
    loadUser,
    logoutUser,
    usernameFromEmail
} from "@/lib/auth-storage"
    import { registerApi, loginApi } from './client-auth'

    export default function Login() {
    const router = useRouter()

    // Login fields
    // const [loginEmail, setLoginEmail] = useState("")
    const [loginUsername, setLoginUsername] = useState("")
    const [loginPassword, setLoginPassword] = useState("")
    const [showLoginPassword, setShowLoginPassword] = useState(false)

    // Register fields
    const [regEmail, setRegEmail] = useState("")
    const [regUsername, setRegUsername] = useState("")
    const [regPassword, setRegPassword] = useState("")
    const [regConfirm, setRegConfirm] = useState("")
    const [showRegisterPassword, setShowRegisterPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [regRole, setRegRole] = useState("")

    const [success, setSuccess] = useState("")
    const [activeTab, setActiveTab] = useState("login")
    
    // Optional: show list of known accounts (emails) to help user pick
    const [knownEmails, setKnownEmails] = useState<string[]>([])

    useEffect(() => {
        //const u = loadUser()
        async function load() {
            const u = await loadUser()
            // If you want auto-redirect when already logged in, uncomment:
            // if (u) router.push("/dashboard")
            // Populate known emails for convenience
            setKnownEmails(loadAllUsers().map((u) => u.email))
        }
        load()
    }, [])

    const handleLogin = async () => {
        try {
        // if (!loginEmail.trim()) return alert("Please enter your work email.")
        if (!loginUsername.trim()) return alert("Please enter your username.")

        if (!loginPassword) return alert("Please enter your password.")
        // const r = await loginApi(loginEmail, loginPassword)
        const r = await loginApi(loginUsername , loginPassword)

        if (r?.ok) {
            router.push("/dashboard")
        } else {
            alert(r?.error || 'Failed to log in')
        }
        } catch (err: any) {
        alert(err?.message || "Failed to log in.")
        }
    }

    // const handleRegister = async () => {
    //     try {
    //     if (!regEmail.trim()) return alert("Please enter email.")
    //     const email = regEmail.trim()
    //     if (!regUsername.trim()) {
    //         setRegUsername(usernameFromEmail(email))
    //     }
    //     if (regPassword.length < 8) return alert("Password must be at least 8 characters.")
    //     if (regPassword !== regConfirm) return alert("Passwords do not match.")

    //     const r = await registerApi(email, regUsername.trim() || usernameFromEmail(email), regPassword)
    //     if (r?.ok) {
    //         // alert('Registered! Please check your email for verification link.')
    //         alert('Registered! You can now log in.')
    //         setKnownEmails(loadAllUsers().map((u) => u.email))
    //     } else {
    //         alert(r?.error || 'Registration failed')
    //     }
    //     } catch (err: any) {
    //     alert(err?.message || "Registration failed.")
    //     }
    // }
    const handleRegister = async () => {
        try {
          if (!regUsername.trim()) return alert("Please enter a username.")
          if (regPassword.length < 8) return alert("Password must be at least 8 characters.")
          if (regPassword !== regConfirm) return alert("Passwords do not match.")  
          if (!regRole) return alert("Please select a role.")  
      
          if (regUsername.trim().toLowerCase().includes("admin") && regRole !== "admin") {
            return alert("Registration failed")
          }
      
          if (!regUsername.trim().toLowerCase().includes("admin") && regRole === "admin") {
            return alert("Registration failed")
          }
      
          const finalRole = regUsername.trim().toLowerCase().includes("admin") ? "admin" : regRole
      
          const r = await registerApi(regUsername.trim(), regPassword, finalRole)
      
          if (r?.ok) {
            setSuccess("Registered! Switching to login...")
            setTimeout(() => setActiveTab("login"), 1000)
          } else {
            alert(r?.error || 'Registration failed')
          }
      
        } catch (err: any) {
          alert(err?.message || "Registration failed.")
        }
      }


    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="flex w-full max-w-lg flex-col gap-6 border border-gray-300 rounded-lg p-6 shadow-md bg-white dark:bg-[#1b1b1b]">
            <div className="w-full flex justify-center mb-4">
            <Image className="dark:invert" src="/g7logo.png" alt="g7logo" width={180} height={38} priority />
            </div>

            {/* <Tabs defaultValue="login"> */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-center">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login">
                <Card>
                <CardHeader>
                    <CardTitle>Log In</CardTitle>
                    <CardDescription>Please log in to access your account.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    {/* <div className="grid gap-3">
                    <Label htmlFor="login-email">Work Email</Label>
                    <Input
                        id="login-email"
                        placeholder="Enter Work Email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        list="known-emails"
                    /> */}
                    {/* Optional: quick-pick known emails */}
                    {/* <datalist id="known-emails">
                        {knownEmails.map((em) => (
                        <option key={em} value={em} />
                        ))}
                    </datalist>
                    </div> */}
                    <div className="grid gap-3">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        placeholder="Enter Username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                    />  
                    </div>
                    <div className="grid gap-3">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                        <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        className="pr-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-gray-700"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        >
                        {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <span className="ml-auto inline-block text-sm text-muted-foreground">
                        (Demo) Passwords are stored locally.
                    </span>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <button
                    onClick={handleLogin}
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full"
                    >
                    Log In
                    </button>

                    {/* Optional demo logout to switch accounts quickly */}
                    <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        logoutUser()
                        alert("Logged out. You can choose a different account now.")
                    }}
                    >
                    Log Out (switch account)
                    </Button>
                </CardFooter>
                </Card>
            </TabsContent>

            {/* REGISTER TAB */}
            <TabsContent value="register">
                <Card>
                <CardHeader>
                    <CardTitle>Register</CardTitle>
                    <CardDescription>Create your account to get started.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    {/* <div className="grid gap-3">
                    <Label htmlFor="reg-email">Work Email</Label>
                    <Input
                        id="reg-email"
                        placeholder="Email"
                        value={regEmail}
                        onChange={(e) => {
                        setRegEmail(e.target.value)
                        if (!regUsername.trim()) {
                            setRegUsername(usernameFromEmail(e.target.value))
                        }
                        }}
                    />
                    </div> */}

                    <div className="grid gap-3">
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                        id="reg-username"
                        placeholder="Enter Username"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                    />
                    </div>

                    {/* New Password with toggle */}
                    <div className="grid gap-3">
                    <Label htmlFor="reg-new">New Password</Label>
                    <div className="relative">
                        <Input
                        id="reg-new"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="New Password"
                        className="pr-10"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        />
                        <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-gray-700"
                        aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                        >
                        {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    </div>

                    {/* Confirm Password with toggle */}
                    <div className="grid gap-3">
                    <Label htmlFor="reg-confirm">Confirm Password</Label>
                    <div className="relative">
                        <Input
                        id="reg-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        className="pr-10"
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        />
                        <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-gray-700"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border bg-transparent py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value)}
                        >
                            <option value="">Select a role</option>
                            <option value="manager">Manager</option>
                            <option value="engineer">Engineer</option>
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>

                        </select>
                    </div>
                </CardContent>

                <CardFooter className="flex gap-3">
                    <Button onClick={handleRegister}>Confirm</Button>
                    <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        // setRegEmail("")
                        setRegUsername("")
                        setRegPassword("")
                        setRegConfirm("")
                        setRegRole("")
                    }}
                    >
                    Reset
                    </Button>
                </CardFooter>
                </Card>
            </TabsContent>
            </Tabs>
        </div>
        </div>
    )
}