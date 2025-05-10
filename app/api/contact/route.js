import { contactSupport } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, email, userRole, subject, message } = await request.json();
    
    // Validation
    if (!name || !email || !userRole || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send email
    await contactSupport(name, email, userRole, subject, message);
    
    return NextResponse.json(
      { success: true, message: "Contact form submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
