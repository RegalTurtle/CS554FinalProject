
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from "@/src/lib/session";

export async function GET(req: Request) {
    let session
    try {
        session = await getSession()
    } catch (error: any) {
        return NextResponse.json({ session: null }, { status: 200 });
    }
    return NextResponse.json({ session }, { status: 200 });
}
