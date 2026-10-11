import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireApiAuth } from "@/lib/auth/api-auth"

const emptyResults = {
  patients: [],
  doctors: [],
  services: [],
}

/**
 * Mobile counterpart of the dashboard global search. Results are filtered by
 * the permissions of the authenticated membership, so search cannot reveal a
 * resource that the current user cannot open elsewhere in the app.
 */
export async function GET(req: Request) {
  try {
    const query = new URL(req.url).searchParams.get("q")?.trim() ?? ""

    if (query.length < 2) {
      return NextResponse.json({ success: true, data: emptyResults })
    }

    if (query.length > 100) {
      return NextResponse.json(
        { success: false, error: "Search query is too long" },
        { status: 400 },
      )
    }

    const auth = await requireApiAuth(req)
    let granted = new Set<string>()

    if (!auth.user.isAdmin && !auth.user.isSuperAdmin) {
      const role = await prisma.role.findUnique({
        where: { id: auth.role.id },
        include: { permissions: { include: { permission: true } } },
      })
      granted = new Set(role?.permissions.map((entry) => entry.permission.key) ?? [])
    }

    const canViewAll = auth.user.isAdmin || auth.user.isSuperAdmin
    const canViewPatients = canViewAll || granted.has("patients.view")
    const canViewDoctors = canViewAll || granted.has("doctors.view")
    const canViewServices = canViewAll || granted.has("services.view")

    if (!canViewPatients && !canViewDoctors && !canViewServices) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Insufficient permission" },
        { status: 403 },
      )
    }

    const [patients, doctors, services] = await Promise.all([
      canViewPatients
        ? prisma.patient.findMany({
            where: {
              clinicId: auth.clinic.id,
              OR: [
                { fullName: { contains: query, mode: "insensitive" } },
                { phone: { contains: query } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              fullName: true,
              phone: true,
              gender: true,
              dateOfBirth: true,
            },
            take: 5,
            orderBy: { updatedAt: "desc" },
          })
        : Promise.resolve([]),
      canViewDoctors
        ? prisma.doctor.findMany({
            where: {
              clinicId: auth.clinic.id,
              OR: [
                { fullName: { contains: query, mode: "insensitive" } },
                { phone: { contains: query } },
                { specialty: { contains: query, mode: "insensitive" } },
              ],
            },
            select: { id: true, fullName: true, specialty: true, phone: true },
            take: 5,
            orderBy: { updatedAt: "desc" },
          })
        : Promise.resolve([]),
      canViewServices
        ? prisma.service.findMany({
            where: {
              clinicId: auth.clinic.id,
              isActive: true,
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { nameEn: { contains: query, mode: "insensitive" } },
              ],
            },
            select: { id: true, name: true, price: true, duration: true },
            take: 5,
            orderBy: { updatedAt: "desc" },
          })
        : Promise.resolve([]),
    ])

    return NextResponse.json({
      success: true,
      data: { patients, doctors, services },
    })
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 })
    }

    console.error("Mobile global search error:", error)
    return NextResponse.json(
      { success: false, error: "Unable to complete search" },
      { status: 500 },
    )
  }
}
