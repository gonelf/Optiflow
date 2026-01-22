export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    status: 'ok',
    message: 'Simple test endpoint - no dependencies',
    timestamp: new Date().toISOString(),
  })
}
