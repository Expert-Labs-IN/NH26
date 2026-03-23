import { NextResponse } from "next/server";
import { strapi } from "@/lib/sdk/sdk";

export async function GET() {
    try {
        const departments = await strapi.find("departments");
        // Ensure returning a standardized shape containing the data array
        return NextResponse.json({ data: departments.data || departments });
    } catch (err) {
        console.error("Failed to fetch departments", err);
        return NextResponse.json({ data: [] }, { status: 500 });
    }
}
