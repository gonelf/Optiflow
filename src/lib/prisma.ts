// Prisma client singleton
// Using dynamic import to avoid build-time errors when client isn't generated

let PrismaClient: any
let prismaClientInstance: any

try {
  // Try to import PrismaClient if it's been generated
  const prismaModule = require('@prisma/client')
  PrismaClient = prismaModule.PrismaClient
} catch (error) {
  // Prisma client not generated yet - create a stub
  PrismaClient = class {
    constructor() {
      console.warn('Using Prisma stub - client not generated')
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
