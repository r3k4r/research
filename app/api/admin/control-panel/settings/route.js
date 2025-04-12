import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET handler to retrieve settings
export async function GET() {
  try {
    // In a real app, this would fetch settings from database
    // For now, we'll return mock data
    const settings = {
      general: {
        siteName: "Second Serve",
        siteDescription: "Reduce food waste and save money",
        contactEmail: "contact@secondserve.com",
        maintenanceMode: false,
        allowRegistrations: true,
      },
      notification: {
        enableEmailNotifications: true,
        enablePushNotifications: false,
        newOrderNotification: true,
        lowInventoryAlert: true,
        dailySummaryEmail: true,
      },
      integration: {
        googleMapsApiKey: "API_KEY_PLACEHOLDER",
        stripePublicKey: "pk_test_placeholder",
        stripeSecretKey: "sk_test_placeholder",
      }
    };
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve settings' },
      { status: 500 }
    );
  }
}

// POST handler to update settings
export async function POST(request) {
  try {
    const body = await request.json();
    const { section, settings } = body;
    
    // In a real app, this would update settings in database
    // For now, just log and return success
    console.log(`Updating ${section} settings:`, settings);
    
    return NextResponse.json({ 
      success: true, 
      message: `${section} settings updated successfully`
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
