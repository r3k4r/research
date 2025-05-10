//provider/apply route.js file for creating the API's beong to "providers/apply" folder

import { NextResponse } from 'next/server';
import { sendProviderApplicationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Extract all the form fields
    const { 
      fullName, 
      email, 
      phone, 
      businessName, 
      businessType, 
      businessYears, 
      foodTypes, 
      reason 
    } = data;
    
    // Validate required fields
    if (!fullName || !email || !phone || !businessName || !businessType || 
        !businessYears || !foodTypes || !reason) {
      return NextResponse.json(
        { error: 'All fields are required' }, 
        { status: 400 }
      );
    }
    
    // Send email with application details
    await sendProviderApplicationEmail({
      fullName, 
      email, 
      phone, 
      businessName, 
      businessType, 
      businessYears, 
      foodTypes, 
      reason
    });
    
    return NextResponse.json(
      { message: 'Application submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Provider application submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    );
  }
}

