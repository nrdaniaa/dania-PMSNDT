export type Role = "admin" | "manager" | "customer" | "engineer" 

export type User = {
    id: string
    username: string
    role: Role
    email: string
    avatar?: string
    employeeId?: string
    phoneNumber?: string
    jobTitle?: string
    department?: string
    company?: string
    supervisorName?: string
    employmentType?: string
    biography?: string
    contactPhone?: string
    contactTelegram?: string
    contactWhatsapp?: string
    twoFAEnabled: boolean
    lastLoginAt?: string // ISO
    createdAt?: string   // ISO
    }

    // Internal type used for storage (includes password for demo purposes)
    export type StoredUser = User & {
    password: string
    }

    const STORAGE_USERS = "auth_users"               // array<StoredUser>
    const STORAGE_CURRENT_USER_ID = "auth_current"   // string
    const LEGACY_SINGLE_USER_KEY = "auth_user"       // legacy (single-user)

    // ---------- Safe ID generator (no crypto.randomUUID dependency) ----------
    function genId(): string {
    try {
        // Prefer Web Crypto randomUUID if present
        const c: any = (globalThis as any)?.crypto
        if (c?.randomUUID) return c.randomUUID()

        // Build RFC4122 v4 using getRandomValues if available
        if (c?.getRandomValues) {
        const bytes = new Uint8Array(16)
        c.getRandomValues(bytes)
        // Per RFC 4122 section 4.4
        bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10
        const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("")
        return `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20)}`
        }
    } catch {
        // ignore and fall through
    }
    // Last-resort (not cryptographically strong, but fine for demo IDs)
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`
    }

    // ---------- Helpers ----------
    function hasWindow() {
    return typeof window !== "undefined"
    }

    // Migrate old single-user storage to multi-user list (best effort)
    function migrateLegacySingleUser() {
    if (!hasWindow()) return
    try {
        const legacy = localStorage.getItem(LEGACY_SINGLE_USER_KEY)
        if (!legacy) return
        const legacyUser = JSON.parse(legacy) as User
        // If we already have users, do nothing
        const users = loadAllUsers()
        if (users.length === 0) {
        const now = new Date().toISOString()
        const stored: StoredUser = {
            ...legacyUser,
            id: legacyUser.id || genId(),
            createdAt: legacyUser.createdAt || now,
            lastLoginAt: legacyUser.lastLoginAt || now,
            // No password previously — leave blank so user can set it later
            password: "",
        }
        saveAllUsers([stored])
        saveCurrentUserId(stored.id)
        }
        localStorage.removeItem(LEGACY_SINGLE_USER_KEY)
    } catch {
        // ignore
    }
    }

    // Load / Save the entire users array
    export function loadAllUsers(): StoredUser[] {
    if (!hasWindow()) return []
    try {
        const raw = localStorage.getItem(STORAGE_USERS)
        return raw ? (JSON.parse(raw) as StoredUser[]) : []
    } catch {
        return []
    }
    }

    export function saveAllUsers(users: StoredUser[]) {
    if (!hasWindow()) return
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users))
    // notify listeners (e.g., profile page)
    window.dispatchEvent(new Event("auth:users-changed"))
    }

    // Current (logged-in) user id
    function loadCurrentUserId(): string | null {
    if (!hasWindow()) return null
    try {
        return localStorage.getItem(STORAGE_CURRENT_USER_ID)
    } catch {
        return null
    }
    }

    function saveCurrentUserId(id: string) {
    if (!hasWindow()) return
    localStorage.setItem(STORAGE_CURRENT_USER_ID, id)
    window.dispatchEvent(new Event("auth:user-updated"))
    }

    export function clearCurrentUser() {
    if (!hasWindow()) return
    localStorage.removeItem(STORAGE_CURRENT_USER_ID)
    window.dispatchEvent(new Event("auth:user-updated"))
    }

    // Public: get the currently logged in user (without password)
    // export function loadUser(): User | null {
    // if (!hasWindow()) return null
    // migrateLegacySingleUser()
    // const id = loadCurrentUserId()
    // if (!id) return null
    // const u = loadAllUsers().find((x) => x.id === id)
    // if (!u) return null
    // const { password, ...publicUser } = u
    // return publicUser
    // }
    export async function loadUser(): Promise<User | null> {
        if (!hasWindow()) return null
    
        // First try to load from API (Prisma DB)
        try {
            const res = await fetch('/api/auth/me')
            if (res.ok) {
                const data = await res.json()
                if (data?.user) {
                    return {
                        id: data.user.id,
                        email: data.user.email,
                        username: data.user.name || data.user.email.split('@')[0],
                        role: data.user.role || 'user',
                        avatar: data.user.avatar || '/default-avatar.png',
                        employeeId: data.user.employeeId || null,
                        phoneNumber: data.user.phoneNumber || null,
                        jobTitle: data.user.jobTitle || null,
                        department: data.user.department || null,
                        company: data.user.company || null,
                        supervisorName: data.user.supervisorName || null,
                        employmentType: data.user.employmentType || null,
                        biography: data.user.biography || null,
                        twoFAEnabled: false,
                        lastLoginAt: data.user.lastLoginAt,
                        createdAt: data.user.createdAt,
                    }
                }
            }
        } catch {
            // ignore and fallback to localStorage
        }
    
        // Fallback to localStorage
        migrateLegacySingleUser()
        const id = loadCurrentUserId()
        if (!id) return null
        const u = loadAllUsers().find((x) => x.id === id)
        if (!u) return null
        const { password, ...publicUser } = u
        return publicUser
        }

    // Public: write/update a specific user's public fields
    export function saveUser(user: User) {
    if (!hasWindow()) return
    migrateLegacySingleUser()
    const users = loadAllUsers()
    const idx = users.findIndex((u) => u.id === user.id)
    if (idx === -1) return
    const merged: StoredUser = { ...users[idx], ...user } as StoredUser
    users[idx] = merged
    saveAllUsers(users)
    window.dispatchEvent(new Event("auth:user-updated"))
    }

    // Remove a user (e.g., account deletion)
    export function deleteUser(userId: string) {
    if (!hasWindow()) return
    const users = loadAllUsers().filter((u) => u.id !== userId)
    saveAllUsers(users)
    const current = loadCurrentUserId()
    if (current === userId) clearCurrentUser()
    }

    // Convenience: derive a username from an email
    export function usernameFromEmail(email: string) {
    const [name] = email.split("@")
    return (name || "user").replace(/[^a-zA-Z0-9_.-]/g, "")
    }

    // ---------- Auth-like helpers (demo only) ----------

    // Create/register a user (throws Error on duplicate email)
    // export function registerUser(params: {
    // email: string
    // username?: string
    // password: string
    // }): User {
    // if (!hasWindow()) throw new Error("No window")
    // migrateLegacySingleUser()
    // const email = params.email.trim().toLowerCase()
    // const users = loadAllUsers()
    // if (users.some((u) => u.email.toLowerCase() === email)) {
    //     throw new Error("This email is already registered.")
    // }
    // const now = new Date().toISOString()
    // const newUser: StoredUser = {
    //     id: genId(),
    //     email,
    //     username: (params.username?.trim() || usernameFromEmail(email)),
    //     password: params.password, // DEMO ONLY
    //     role: "user",
    //     avatar: "/default-avatar.png",
    //     twoFAEnabled: false,
    //     createdAt: now,
    //     lastLoginAt: now,
    // }
    // users.push(newUser)
    // saveAllUsers(users)
    // // Return public view
    // const { password, ...publicUser } = newUser
    // return publicUser
    // }

    // Create/register role-based user (admin if username includes "admin", else regular user)
    export function registerUser(params: {
    email: string
    username?: string
    password: string
    }): User {
    if (!hasWindow()) throw new Error("No window")
    migrateLegacySingleUser()
    const email = params.email.trim().toLowerCase()
    const users = loadAllUsers()
    if (users.some((u) => u.email.toLowerCase() === email)) {
        throw new Error("This email is already registered.")
    }
    const now = new Date().toISOString()
    const username = params.username?.trim() || usernameFromEmail(email)
    const newUser: StoredUser = {
        id: genId(),
        email,
        username,
        password: params.password, // DEMO ONLY
        role: username.toLowerCase().includes("admin") ? "admin" : "customer",
        avatar: "/default-avatar.png",
        twoFAEnabled: false,
        createdAt: now,
        lastLoginAt: now,
    }
    users.push(newUser)
    saveAllUsers(users)
    // Return public view
    const { password, ...publicUser } = newUser
    return publicUser
    }

    // Log in (sets current user id). Throws Error on fail.
    export function loginUser(params: { email: string; password: string }): User {
    if (!hasWindow()) throw new Error("No window")
    migrateLegacySingleUser()
    const email = params.email.trim().toLowerCase()
    const users = loadAllUsers()
    const found = users.find((u) => u.email.toLowerCase() === email)
    if (!found) throw new Error("No account found for this email.")
    // If password is empty (migrated legacy), accept any password once, then set it.
    if (!found.password) {
        found.password = params.password
    } else if (found.password !== params.password) {
        throw new Error("Incorrect password.")
    }
    found.lastLoginAt = new Date().toISOString()
    saveAllUsers(
        users.map((u) => (u.id === found.id ? found : u))
    )
    saveCurrentUserId(found.id)
    const { password, ...publicUser } = found
    return publicUser
    }

    // Log out
    export function logoutUser() {
    clearCurrentUser()
}