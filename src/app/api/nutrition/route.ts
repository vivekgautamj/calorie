import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { 
  getNutritionEntriesByDate, 
  getNutritionEntriesByDateRange, 
  calculateDailyTotals,
  getOrCreateNutritionGoals 
} from '@/lib/db/nutrition'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the correct user ID from session
    const supabaseUserId = (session.user as any).supabaseUserId

    // If we don't have a Supabase user ID, try to create the user first
    if (!supabaseUserId) {
      console.log('No Supabase user ID found, attempting to create user...')
      try {
        const { createOrUpdateUser } = await import('@/lib/supabase')
        const userData = await createOrUpdateUser({
          email: session.user.email!,
          name: session.user.name || 'Unknown User',
          image: session.user.image || undefined,
        })
        // Update the session with the new user ID
        ;(session.user as any).supabaseUserId = userData.user_id
        console.log('User created successfully, new ID:', userData.user_id)
      } catch (error) {
        console.error('Failed to create user:', error)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }
    }

    // Use the Supabase user ID
    const userId = (session.user as any).supabaseUserId

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type') // 'daily', 'weekly', 'monthly'

    if (type === 'daily' && date) {
      // Get daily nutrition data
      const entries = await getNutritionEntriesByDate(userId, date)
      const totals = calculateDailyTotals(entries)

      return NextResponse.json({
        entries,
        totals,
        date,
      })
    } else if (type === 'weekly' && startDate && endDate) {
      // Get weekly nutrition data
      const entries = await getNutritionEntriesByDateRange(userId, startDate, endDate)
      const totals = calculateDailyTotals(entries)

      // Group by date
      const entriesByDate = entries.reduce((acc, entry) => {
        if (!acc[entry.date]) {
          acc[entry.date] = []
        }
        acc[entry.date].push(entry)
        return acc
      }, {} as Record<string, typeof entries>)

      // Calculate daily totals for each date
      const dailyTotals = Object.entries(entriesByDate).map(([date, dayEntries]) => ({
        date,
        totals: calculateDailyTotals(dayEntries),
        entries: dayEntries,
      }))

      return NextResponse.json({
        entries,
        dailyTotals,
        weeklyTotals: totals,
        startDate,
        endDate,
      })
    } else if (type === 'monthly' && startDate && endDate) {
      // Get monthly nutrition data
      const entries = await getNutritionEntriesByDateRange(userId, startDate, endDate)
      const totals = calculateDailyTotals(entries)

      // Group by week
      const entriesByWeek = entries.reduce((acc, entry) => {
        const weekStart = new Date(entry.date)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weekKey = weekStart.toISOString().split('T')[0]
        
        if (!acc[weekKey]) {
          acc[weekKey] = []
        }
        acc[weekKey].push(entry)
        return acc
      }, {} as Record<string, typeof entries>)

      // Calculate weekly totals
      const weeklyTotals = Object.entries(entriesByWeek).map(([weekStart, weekEntries]) => ({
        weekStart,
        totals: calculateDailyTotals(weekEntries),
        entries: weekEntries,
      }))

      return NextResponse.json({
        entries,
        weeklyTotals,
        monthlyTotals: totals,
        startDate,
        endDate,
      })
    } else {
      // Default: get today's data
      const today = new Date().toISOString().split('T')[0]
      const entries = await getNutritionEntriesByDate(userId, today)
      const totals = calculateDailyTotals(entries)

      return NextResponse.json({
        entries,
        totals,
        date: today,
      })
    }
  } catch (error) {
    console.error('Error fetching nutrition data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 