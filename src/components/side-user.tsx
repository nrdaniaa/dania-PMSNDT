'use client'

import {
    Avatar, AvatarFallback, AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar"
import { loadUser, User } from "@/lib/auth-storage"
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

    export default function SideUser({
    user: userProp,
    }: {
    user?: {
        name: string
        email: string
        avatar: string
    }
    }) {
    const { isMobile } = useSidebar()
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)

    // Load from API (prefer Prisma DB), then fallback to local storage / prop
    useEffect(() => {
        async function loadFromApi() {
            try {
                const res = await fetch('/api/auth/me')
                if (!res.ok) return

                const data = await res.json()
                if (data?.user) {
                    setUser({
                        id: data.user.id,
                        email: data.user.email,
                        username: data.user.name || data.user.email.split('@')[0],
                        role: data.user.role || 'user',
                        avatar: data.user.avatar,
                        twoFAEnabled: false,
                    })
                    return
                }
            } catch {
                // ignore and fallback
            }
            //const fromStore = loadUser()
            const fromStore = await loadUser()
            if (fromStore) {
                setUser(fromStore)
                return
            }

            if (userProp) {
                setUser({
                    id: 'prop',
                    email: userProp.email,
                    username: userProp.name,
                    role: 'customer',
                    avatar: userProp.avatar,
                    twoFAEnabled: false,
                })
            }
        }

        loadFromApi()
        const onChange = () => loadFromApi()
        window.addEventListener('auth:user-updated', onChange)
        return () => window.removeEventListener('auth:user-updated', onChange)
    }, [userProp])

    const handleLogout = () => {
        clearUser()
        router.push("/login")
    }

    const displayName = user?.username || "User"
    const displayEmail = user?.email || "—"
    const avatar = user?.avatar || undefined

    return (
        <SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatar} alt={displayName} />
                    <AvatarFallback className="rounded-lg">{displayName.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    {/* <span className="truncate text-xs">{displayEmail}</span> */}
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatar} alt={displayName} />
                    <AvatarFallback className="rounded-lg">{displayName.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs">{displayEmail}</span>
                    </div>
                </div>
                </DropdownMenuLabel>

                <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/accountinfo")} className="cursor-pointer">
                    <BadgeCheck />
                    Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Bell />
                    Notifications
                </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut />
                Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
        </SidebarMenu>
    )
}
function clearUser() {
    // Remove user data from localStorage and dispatch update event
    localStorage.removeItem("user")
    window.dispatchEvent(new Event("auth:user-updated"))
}
