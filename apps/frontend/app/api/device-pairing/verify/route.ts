import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { code, deviceName } = await req.json();
  
  try {
    // Find valid pairing code
    const { data: pairingData, error: pairingError } = await supabase
      .from('link_codes')
      .select('user_id')
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (pairingError || !pairingData) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Register device
    await supabase
      .from('user_devices')
      .insert({
        user_id: pairingData.user_id,
        device_name: deviceName,
        status: 'active'
      });

    // Update user's desktop setup status
    await supabase
      .from('users')
      .update({ is_desktop_setup: true })
      .eq('id', pairingData.user_id);

    // Mark code as used
    await supabase
      .from('link_codes')
      .update({ used: true })
      .eq('code', code);

    return NextResponse.json({ 
      success: true,
      userId: pairingData.user_id
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
} 