import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'

// Lazy initialization of service role client
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ITEMS_PER_PAGE = 10

/**
 * GET /api/admin/centers
 * Returns paginated list of all centers with their user/student counts
 */
export async function GET(request: NextRequest) {
  // Require super admin authentication
  const authResult = await requireSuperAdmin(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    // Build centers query
    let centersQuery = getAdminSupabase()
      .from('tutorial_centers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      centersQuery = centersQuery.eq('status', status)
    }
    if (search) {
      centersQuery = centersQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`)
    }

    // Pagination
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1
    centersQuery = centersQuery.range(from, to)

    const { data: centers, count, error } = await centersQuery

    if (error) {
      console.error('Error fetching centers:', error)
      return NextResponse.json({ error: 'Failed to fetch centers' }, { status: 500 })
    }

    const centerIds = (centers || []).map(c => c.id)

    if (centerIds.length === 0) {
      return NextResponse.json({
        success: true,
        centers: [],
        totalCount: 0,
        page,
        totalPages: 0,
      })
    }

    // Batch fetch user counts and student counts for all centers in parallel
    const [usersResult, studentsResult] = await Promise.all([
      // Get user counts per center using a raw query approach
      getAdminSupabase()
        .from('users')
        .select('center_id')
        .in('center_id', centerIds),

      // Get student counts per center
      getAdminSupabase()
        .from('students')
        .select('center_id')
        .in('center_id', centerIds),
    ])

    // Count users per center
    const userCounts: Record<string, number> = {}
    for (const user of (usersResult.data || [])) {
      const cid = user.center_id as string
      userCounts[cid] = (userCounts[cid] || 0) + 1
    }

    // Count students per center
    const studentCounts: Record<string, number> = {}
    for (const student of (studentsResult.data || [])) {
      const cid = student.center_id as string
      studentCounts[cid] = (studentCounts[cid] || 0) + 1
    }

    // Combine centers with their counts
    const centersWithCounts = (centers || []).map(center => ({
      ...center,
      _count: {
        users: userCounts[center.id] || 0,
        students: studentCounts[center.id] || 0,
      },
    }))

    return NextResponse.json({
      success: true,
      centers: centersWithCounts,
      totalCount: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
    })
  } catch (error) {
    console.error('Admin centers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/centers
 * Delete a center (super admin only)
 */
export async function DELETE(request: NextRequest) {
  // Require super admin authentication
  const authResult = await requireSuperAdmin(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { searchParams } = new URL(request.url)
    const centerId = searchParams.get('id')

    if (!centerId) {
      return NextResponse.json({ error: 'Center ID is required' }, { status: 400 })
    }

    // Verify center exists
    const { data: center, error: fetchError } = await getAdminSupabase()
      .from('tutorial_centers')
      .select('id, name')
      .eq('id', centerId)
      .single()

    if (fetchError || !center) {
      return NextResponse.json({ error: 'Center not found' }, { status: 404 })
    }

    // Delete the center (cascade should handle related data)
    const { error: deleteError } = await getAdminSupabase()
      .from('tutorial_centers')
      .delete()
      .eq('id', centerId)

    if (deleteError) {
      console.error('Error deleting center:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete center. Make sure all associated data is removed first.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Center "${center.name}" deleted successfully`,
    })
  } catch (error) {
    console.error('Admin delete center error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/centers
 * Update center status (super admin only)
 */
export async function PATCH(request: NextRequest) {
  // Require super admin authentication
  const authResult = await requireSuperAdmin(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const body = await request.json()
    const { centerId, status } = body

    if (!centerId || !status) {
      return NextResponse.json({ error: 'Center ID and status are required' }, { status: 400 })
    }

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update center status
    const { data: updatedCenter, error } = await getAdminSupabase()
      .from('tutorial_centers')
      .update({ status } as never)
      .eq('id', centerId)
      .select('id, name, status')
      .single()

    if (error) {
      console.error('Error updating center status:', error)
      return NextResponse.json({ error: 'Failed to update center status' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      center: updatedCenter,
      message: `Center status updated to ${status}`,
    })
  } catch (error) {
    console.error('Admin update center error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
