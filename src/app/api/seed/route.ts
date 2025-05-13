import { seed } from "@/src/scripts/seed";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await seed();
  } catch (e: any) {
    return NextResponse.json(
      { message: 'Database seeding failed', e },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { message: 'Database seeded' },
    { status: 200 }
  )
}