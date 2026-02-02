'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, RefreshCcw } from 'lucide-react'

export default function InviteCodesPage() {
    const { toast } = useToast()
    const [codes, setCodes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const fetchCodes = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/invite-codes')
            if (res.ok) {
                const data = await res.json()
                setCodes(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCodes()
    }, [])

    const generateCodes = async (count: number) => {
        setIsGenerating(true)
        try {
            const res = await fetch('/api/admin/invite-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count, maxUses: 1 }),
            })

            if (!res.ok) throw new Error('Failed to generate')

            toast({ title: `Generated ${count} codes` })
            fetchCodes()
        } catch (error) {
            toast({ title: 'Error generating codes', variant: 'destructive' })
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invite Codes</h1>
                    <p className="text-muted-foreground">Manage codes for user registration.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Invite Codes</CardTitle>
                            <CardDescription>{codes.length} codes generated.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => fetchCodes()} disabled={isLoading}>
                                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button onClick={() => generateCodes(5)} disabled={isGenerating}>
                                <Plus className="mr-2 h-4 w-4" /> Generate 5
                            </Button>
                            <Button variant="secondary" onClick={() => generateCodes(10)} disabled={isGenerating}>
                                Generate 10
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Uses</TableHead>
                                <TableHead>Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {codes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No codes found. Generate some!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                codes.map((code) => (
                                    <TableRow key={code.id}>
                                        <TableCell className="font-mono">{code.code}</TableCell>
                                        <TableCell>
                                            <Badge variant={code.usedCount >= code.maxUses ? 'secondary' : 'default'}>
                                                {code.usedCount >= code.maxUses ? 'Used' : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{code.usedCount} / {code.maxUses}</TableCell>
                                        <TableCell>{new Date(code.createdAt).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
