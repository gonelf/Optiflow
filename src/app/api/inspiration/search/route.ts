import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDribbbleService } from '@/services/dribbble.service';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query } = await req.json();

        // Default fallback query if empty
        const searchTerm = query || 'landing page';

        const dribbble = getDribbbleService();
        const shots = await dribbble.searchShots(searchTerm);

        return NextResponse.json({ shots });
    } catch (error) {
        console.error('Inspiration search error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch inspiration' },
            { status: 500 }
        );
    }
}
