import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// GET: Fetch join requests related to current user (as applicant or project owner)
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch requests where user is either applicant OR project author
    const requests = await prisma.joinRequest.findMany({
      where: {
        OR: [
          { applicantId: userId },
          { project: { authorId: userId } },
        ],
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            title: true,
            image: true,
            tags: true,
            availabilityHrs: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            authorId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const reqMap = new Map<string, any>();

    requests.forEach((req) => {
      if (!req.id || reqMap.has(req.id)) return;

      reqMap.set(req.id, {
        id: req.id,
        projectId: req.projectId,
        projectTitle: req.project?.title || "Project Opportunity",
        applicantId: req.applicantId,
        applicantName: req.applicant?.name || "Developer",
        applicantTitle: req.applicant?.title || "Software Engineer",
        applicantAvatarUrl: req.applicant?.image || undefined,
        roleTitle: req.roleTitle,
        skills: req.applicant?.tags || [],
        hoursPerWeek: req.applicant?.availabilityHrs || 5,
        pitchNote: req.pitchNote || "",
        status: req.status as "PENDING" | "ACCEPTED" | "REJECTED",
        createdAt: req.createdAt instanceof Date ? req.createdAt.toISOString() : String(req.createdAt),
      });
    });

    const formattedRequests = Array.from(reqMap.values());

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error("GET /api/projects/requests error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Apply to join a project or Accept/Reject an application
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, projectId, roleTitle, pitchNote, requestId, status } = body;

    // Action 1: APPLY
    if (action === "APPLY") {
      if (!projectId || !roleTitle) {
        return NextResponse.json({ error: "Project ID and Role Title required" }, { status: 400 });
      }

      const existingRequest = await prisma.joinRequest.findFirst({
        where: { projectId, applicantId: session.user.id },
      });

      if (existingRequest) {
        return NextResponse.json({ error: "You already applied to this project" }, { status: 400 });
      }

      const joinReq = await prisma.joinRequest.create({
        data: {
          projectId,
          applicantId: session.user.id,
          roleTitle,
          pitchNote: pitchNote || "",
          status: "PENDING",
        },
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              title: true,
              image: true,
              tags: true,
              availabilityHrs: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
              authorId: true,
            },
          },
        },
      });

      const formatted = {
        id: joinReq.id,
        projectId: joinReq.projectId,
        projectTitle: joinReq.project?.title || "Project Opportunity",
        applicantId: joinReq.applicantId,
        applicantName: joinReq.applicant?.name || session.user.name || "Developer",
        applicantTitle: joinReq.applicant?.title || "Software Engineer",
        applicantAvatarUrl: joinReq.applicant?.image || undefined,
        roleTitle: joinReq.roleTitle,
        skills: joinReq.applicant?.tags || [],
        hoursPerWeek: joinReq.applicant?.availabilityHrs || 5,
        pitchNote: joinReq.pitchNote || "",
        status: joinReq.status as "PENDING" | "ACCEPTED" | "REJECTED",
        createdAt:
          joinReq.createdAt instanceof Date
            ? joinReq.createdAt.toISOString()
            : String(joinReq.createdAt),
      };

      return NextResponse.json(formatted, { status: 201 });
    }

    // Action 2: RESPOND (Owner accepts or rejects)
    if (action === "RESPOND") {
      if (!requestId || !status) {
        return NextResponse.json({ error: "Request ID and Status required" }, { status: 400 });
      }

      // Verify ownership
      const reqTarget = await prisma.joinRequest.findUnique({
        where: { id: requestId },
        include: {
          project: true,
          applicant: {
            select: {
              id: true,
              name: true,
              title: true,
              image: true,
              tags: true,
              availabilityHrs: true,
            },
          },
        },
      });

      if (!reqTarget || reqTarget.project.authorId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized or Not Found" }, { status: 403 });
      }

      const updatedReq = await prisma.joinRequest.update({
        where: { id: requestId },
        data: { status },
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              title: true,
              image: true,
              tags: true,
              availabilityHrs: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
              authorId: true,
            },
          },
        },
      });

      // If accepted, auto-create a Match
      if (status === "ACCEPTED") {
        const u1 = session.user.id < reqTarget.applicantId ? session.user.id : reqTarget.applicantId;
        const u2 = session.user.id > reqTarget.applicantId ? session.user.id : reqTarget.applicantId;

        await prisma.match.upsert({
          where: {
            user1Id_user2Id: {
              user1Id: u1,
              user2Id: u2,
            },
          },
          create: {
            user1Id: u1,
            user2Id: u2,
          },
          update: {},
        });
      }

      const formatted = {
        id: updatedReq.id,
        projectId: updatedReq.projectId,
        projectTitle: updatedReq.project?.title || reqTarget.project?.title || "Project Opportunity",
        applicantId: updatedReq.applicantId,
        applicantName: updatedReq.applicant?.name || "Developer",
        applicantTitle: updatedReq.applicant?.title || "Software Engineer",
        applicantAvatarUrl: updatedReq.applicant?.image || undefined,
        roleTitle: updatedReq.roleTitle,
        skills: updatedReq.applicant?.tags || [],
        hoursPerWeek: updatedReq.applicant?.availabilityHrs || 5,
        pitchNote: updatedReq.pitchNote || "",
        status: updatedReq.status as "PENDING" | "ACCEPTED" | "REJECTED",
        createdAt:
          updatedReq.createdAt instanceof Date
            ? updatedReq.createdAt.toISOString()
            : String(updatedReq.createdAt),
      };

      return NextResponse.json(formatted);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/projects/requests error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
