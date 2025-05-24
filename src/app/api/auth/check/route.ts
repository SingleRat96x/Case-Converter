import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check both our custom cookie and Supabase session
    const customCookieAuth = request.cookies.get('isAdminAuthenticated')?.value === 'true';
    
    // Get the current user session from Supabase
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return NextResponse.json({ isAuthenticated: false });
    }
    
    // User must have both valid Supabase session and custom cookie
    const isAuthenticated = customCookieAuth && !!user;
    
    return NextResponse.json({ isAuthenticated });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 500 });
  }
} 