import { auth, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await clerkClient.users.updateUser(userId, {
      unsafeMetadata: {
        hasCompletedOnboarding: true,
      },
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 