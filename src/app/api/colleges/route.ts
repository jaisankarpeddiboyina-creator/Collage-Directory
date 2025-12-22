import { NextResponse } from 'next/server';
import { getColleges } from '@/lib/supabase';

export async function GET() {
  // If Supabase env vars aren't set, surface a clear error for the client.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are missing.');
    const payload: Record<string, any> = {
      success: false,
      message: 'Supabase environment variables are not configured.'
    };

    if (process.env.NODE_ENV !== 'production') {
      payload.hint = 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment (e.g. .env.local) and restart the dev server.';
    }

    return NextResponse.json(payload, { status: 500 });
  }

  try {
    const colleges = await getColleges();

    // If there are no colleges, still return success=true but include a helpful note.
    const payload: Record<string, any> = {
      success: true,
      data: colleges,
      count: colleges.length
    };

    if (colleges.length === 0 && process.env.NODE_ENV !== 'production') {
      payload.note = 'No verified colleges found in the database.';
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching colleges:', error);

    const payload: Record<string, any> = {
      success: false,
      message: 'Failed to fetch colleges'
    };

    if (process.env.NODE_ENV !== 'production') {
      payload.details = typeof error === 'string' ? error : (error && (error as any).message) || String(error);
    }

    return NextResponse.json(payload, { status: 500 });
  }
}