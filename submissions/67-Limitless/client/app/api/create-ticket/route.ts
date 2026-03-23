import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { strapi } from "@/lib/sdk/sdk";

export async function POST(req: Request) {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.jwt) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const { title, departmentId, summary, description, severity, messages } = await req.json();

    try {

        const agents: any = await strapi.find("users", {
            filters: {
                type: { $eq: "agent" },
                ...(departmentId && {
                    department: {
                        documentId: { $eq: departmentId.toString() },
                    },
                }),
            },
            populate: ["assignedTickits", "department"],
        });

        if (!agents || agents.length === 0) {
            return NextResponse.json({ error: "No agents found" }, { status: 404 });
        }

        let assignedAgentId = null;
        if (agents && agents.length > 0) {
            agents.sort((a: any, b: any) => {
                const aCount = a.assignedTickits?.length || 0;
                const bCount = b.assignedTickits?.length || 0;
                return aCount - bCount;
            });
            assignedAgentId = agents[0].documentId;
        }

        const ticketBody = {
            title,
            summary,
            description: description || summary,
            severity,
            aiResolved: false,
            raisedBy: session?.user?.id,
            assignedTo: assignedAgentId,
            department: departmentId || null,
            aiAgentChat: messages
        };

        const createdTicket = await strapi.create("tickets", ticketBody);
        console.log(createdTicket)
        return NextResponse.json({ success: true, ticket: createdTicket }, { status: 200 });

    } catch (error) {
        console.error("Ticket Creation Error:", error);
        return NextResponse.json({ error: "Failed to escalate ticket." }, { status: 500 });
    }
}
