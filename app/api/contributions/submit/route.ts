import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/core/data/schema/drizzle';
import { pendingSubmissions } from '@/core/data/schema/schema';
import { z } from 'zod';

// Define the expected request body schema
const submitContributionSchema = z.object({
    tocItemId: z.string().uuid({ message: "Invalid TOC Item ID" }),
    lexicalStateJson: z.object({}).passthrough(), // Basic object check, allows any structure
});

export async function POST(request: Request) {
    const supabase = await createClient();

    // 1. Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('Auth Error:', authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Input Validation
    let validatedData;
    try {
        const body = await request.json();
        validatedData = submitContributionSchema.parse(body);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        } else {
            console.error('Request body parsing error:', error);
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
    }

    const { tocItemId, lexicalStateJson } = validatedData;

    // 3. Database Insertion
    try {
        await db.insert(pendingSubmissions).values({
            userId: user.id,
            tocItemId: tocItemId,
            lexicalStateJson: lexicalStateJson,
            // status defaults to 'pending' in the schema
            // isPotentialRecreation defaults to false
            // potentialOriginalBlockId defaults to null
        });

        // 4. Response
        return NextResponse.json({ message: 'Submission received' }, { status: 201 });

    } catch (dbError) {
        console.error('Database insertion error:', dbError);
        return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }
} 