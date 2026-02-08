import { NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function GET() {
  try {
    // Get daily lead counts for the last 7 days
    const dailyCounts = await dbClient`
      SELECT 
        DATE(discovered_at) as date,
        COUNT(*)::int as count
      FROM leads
      WHERE discovered_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(discovered_at)
      ORDER BY date ASC
    `;

    // Get total for this week and last week
    const [thisWeekResult] = await dbClient`
      SELECT COUNT(*)::int as count
      FROM leads
      WHERE discovered_at >= DATE_TRUNC('week', NOW())
    `;

    const [lastWeekResult] = await dbClient`
      SELECT COUNT(*)::int as count
      FROM leads
      WHERE discovered_at >= DATE_TRUNC('week', NOW()) - INTERVAL '1 week'
        AND discovered_at < DATE_TRUNC('week', NOW())
    `;

    const thisWeek = Number(thisWeekResult?.count || 0);
    const lastWeek = Number(lastWeekResult?.count || 0);
    const change = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

    // Create array for last 7 days (fill missing days with 0)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const countsByDate = new Map();
    dailyCounts.forEach((row: any) => {
      const date = new Date(row.date);
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Adjust for Monday start
      countsByDate.set(dayName, Number(row.count || 0));
    });

    // Get max count for percentage calculation
    const maxCount = Math.max(...Array.from(countsByDate.values()), 1);
    const chartData = days.map(day => ({
      day,
      count: countsByDate.get(day) || 0,
      height: countsByDate.get(day) ? Math.max(10, (countsByDate.get(day) / maxCount) * 100) : 10,
    }));

    return NextResponse.json({
      total: thisWeek,
      change: Math.round(change * 100) / 100,
      chartData,
    });
  } catch (error: any) {
    console.error('❌ Get weekly trend error:', error);
    return NextResponse.json(
      {
        total: 0,
        change: 0,
        chartData: [
          { day: 'Mon', count: 0, height: 10 },
          { day: 'Tue', count: 0, height: 10 },
          { day: 'Wed', count: 0, height: 10 },
          { day: 'Thu', count: 0, height: 10 },
          { day: 'Fri', count: 0, height: 10 },
          { day: 'Sat', count: 0, height: 10 },
          { day: 'Sun', count: 0, height: 10 },
        ],
      },
      { status: 200 }
    );
  }
}
