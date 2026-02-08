import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Shared database client - reuse connections
export const dbClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Common query helpers to avoid redundant queries
export const dbQueries = {
  // Get total leads count (with optional filters)
  async getTotalLeads(filters?: { platform?: string; startDate?: Date }) {
    if (filters?.platform && filters?.startDate) {
      const [result] = await dbClient`
        SELECT COUNT(*)::int as count
        FROM leads
        WHERE source_platform = ${filters.platform}
        AND discovered_at >= ${filters.startDate}
      `;
      return Number(result?.count || 0);
    } else if (filters?.startDate) {
      const [result] = await dbClient`
        SELECT COUNT(*)::int as count
        FROM leads
        WHERE discovered_at >= ${filters.startDate}
      `;
      return Number(result?.count || 0);
    } else if (filters?.platform) {
      const [result] = await dbClient`
        SELECT COUNT(*)::int as count
        FROM leads
        WHERE source_platform = ${filters.platform}
      `;
      return Number(result?.count || 0);
    } else {
      const [result] = await dbClient`SELECT COUNT(*)::int as count FROM leads`;
      return Number(result?.count || 0);
    }
  },

  // Get leads with responses count (with optional filters)
  async getLeadsWithResponses(filters?: { platform?: string; startDate?: Date }) {
    if (filters?.platform && filters?.startDate) {
      const [result] = await dbClient`
        SELECT COUNT(DISTINCT lr.lead_id)::int as count
        FROM lead_responses lr
        INNER JOIN leads l ON l.id = lr.lead_id
        WHERE l.discovered_at >= ${filters.startDate}
        AND l.source_platform = ${filters.platform}
      `;
      return Number(result?.count || 0);
    } else if (filters?.startDate) {
      const [result] = await dbClient`
        SELECT COUNT(DISTINCT lr.lead_id)::int as count
        FROM lead_responses lr
        INNER JOIN leads l ON l.id = lr.lead_id
        WHERE l.discovered_at >= ${filters.startDate}
      `;
      return Number(result?.count || 0);
    } else if (filters?.platform) {
      const [result] = await dbClient`
        SELECT COUNT(DISTINCT lr.lead_id)::int as count
        FROM lead_responses lr
        INNER JOIN leads l ON l.id = lr.lead_id
        WHERE l.source_platform = ${filters.platform}
      `;
      return Number(result?.count || 0);
    } else {
      const [result] = await dbClient`
        SELECT COUNT(DISTINCT lead_id)::int as count FROM lead_responses
      `;
      return Number(result?.count || 0);
    }
  },

  // Get total responses count
  async getTotalResponses() {
    const [result] = await dbClient`SELECT COUNT(*)::int as count FROM lead_responses`;
    return Number(result?.count || 0);
  },
};
