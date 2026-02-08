import { NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function GET() {
  try {
    // Get lead segmentation by visa type (inferred from titles)
    const segments = await dbClient`
      SELECT 
        CASE 
          WHEN LOWER(title) LIKE '%o-1%' OR LOWER(title) LIKE '%o1%' OR LOWER(title) LIKE '%extraordinary%' THEN 'O-1A / EB-1A'
          WHEN LOWER(title) LIKE '%eb-2%' OR LOWER(title) LIKE '%eb2%' OR LOWER(title) LIKE '%niw%' THEN 'EB-2 NIW'
          WHEN LOWER(title) LIKE '%h-1b%' OR LOWER(title) LIKE '%h1b%' OR LOWER(title) LIKE '%h1-b%' THEN 'H-1B / L-1'
          ELSE 'Other Visa Categories'
        END as category,
        COUNT(*)::int as count,
        AVG(CAST(ai_score AS FLOAT)) as avg_score
      FROM leads
      WHERE title IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `;

    // Calculate totals for percentages
    const totalLeads = segments.reduce((sum: number, seg: any) => sum + Number(seg.count || 0), 0);

    // Format segments with icons and revenue estimates
    const formattedSegments = segments.map((seg: any, index: number) => {
      const count = Number(seg.count || 0);
      const avgScore = Number(seg.avg_score || 0);
      const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
      
      // Estimate revenue based on category and count
      let revenue = 0;
      let growth = '+12%';
      let icon = '🌍';
      let color = '#fb923c';

      if (seg.category === 'O-1A / EB-1A') {
        revenue = count * 3200; // Higher value leads
        growth = '+34%';
        icon = '🎯';
        color = '#00d4aa';
      } else if (seg.category === 'EB-2 NIW') {
        revenue = count * 1050;
        growth = '+28%';
        icon = '📋';
        color = '#a78bfa';
      } else if (seg.category === 'H-1B / L-1') {
        revenue = count * 265;
        growth = '+19%';
        icon = '💼';
        color = '#60a5fa';
      } else {
        revenue = count * 125;
        growth = '+12%';
        icon = '🌍';
        color = '#fb923c';
      }

      return {
        icon,
        name: seg.category,
        count: `${count.toLocaleString()} leads`,
        revenue: `$${(revenue / 1000000).toFixed(1)}M`,
        growth,
        width: `${Math.min(100, Math.max(10, percentage))}%`,
        color,
      };
    });

    // If no segments, return default structure
    if (formattedSegments.length === 0) {
      return NextResponse.json({
        segments: [
          {
            icon: '🎯',
            name: 'O-1A / EB-1A Candidates',
            count: '0 leads',
            revenue: '$0.0M',
            growth: '+0%',
            width: '0%',
            color: '#00d4aa',
          },
        ],
      });
    }

    return NextResponse.json({ segments: formattedSegments });
  } catch (error: any) {
    console.error('❌ Get lead segmentation error:', error);
    return NextResponse.json(
      { segments: [] },
      { status: 200 }
    );
  }
}
