import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { code, deviceName } = await req.json();
  console.log('Device pairing request:', { code, deviceName });
  
  try {
    // Find valid pairing code
    const { data: pairingData, error: pairingError } = await supabase
      .from('link_codes')
      .select('user_id')
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (pairingError || !pairingData) {
      console.log('Invalid or expired pairing code:', { code, error: pairingError });
      return NextResponse.json({ success: false }, { status: 400 });
    }

    console.log('Valid pairing code found:', { userId: pairingData.user_id });

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

    console.log('Device paired successfully:', { 
      userId: pairingData.user_id, 
      deviceName 
    });

    return NextResponse.json({ 
      success: true,
      userId: pairingData.user_id
    });

  } catch (error) {
    console.error('Device pairing failed:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
} 