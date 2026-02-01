import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      onboarded: boolean
      systemRole: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    onboarded?: boolean
    systemRole: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    onboarded: boolean
    systemRole: string
  }
}
