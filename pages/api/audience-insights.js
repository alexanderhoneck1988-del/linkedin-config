import { getLinkedInAudienceInsights, getLinkedInCampaignHistory } from '@/lib/linkedin';
import { initializeDatabase } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Initialisiere Datenbank beim ersten Request
      initializeDatabase();

      const { targeting } = req.body;

      if (!targeting) {
        return res.status(400).json({ error: 'Targeting parameter required' });
      }

      // Hole Audience Insights von LinkedIn API
      const audienceInsights = await getLinkedInAudienceInsights(targeting);

      // Hole historische Kampagnendaten
      const campaignHistory = await getLinkedInCampaignHistory();

      // Berechne durchschnittliche Performance basierend auf Kampagnenhistorie
      const performanceByAudience = calculatePerformanceMetrics(
        audienceInsights,
        campaignHistory.campaigns
      );

      return res.status(200).json({
        success: true,
        audienceInsights,
        campaignHistory: campaignHistory.campaigns,
        performanceMetrics: performanceByAudience,
        summary: campaignHistory.summary,
      });
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function calculatePerformanceMetrics(audienceInsights, campaigns) {
  // Aggregiere Performance-Daten aus Kampagnenhistorie
  const metrics = {
    averageCPM: 0,
    averageCTR: 0,
    averageConversionRate: 0,
    averageROI: 0,
    totalCampaigns: campaigns.length,
    audienceCoverage: 0,
  };

  if (campaigns.length === 0) return metrics;

  const totalCPM = campaigns.reduce((sum, c) => sum + (c.cpm || 0), 0);
  const totalCTR = campaigns.reduce((sum, c) => sum + (c.ctr || 0), 0);
  const totalConversionRate = campaigns.reduce((sum, c) => sum + (c.conversionRate || 0), 0);
  const totalROI = campaigns.reduce((sum, c) => sum + (c.roi || 0), 0);

  metrics.averageCPM = Math.round((totalCPM / campaigns.length) * 100) / 100;
  metrics.averageCTR = Math.round((totalCTR / campaigns.length) * 10000) / 10000;
  metrics.averageConversionRate = Math.round((totalConversionRate / campaigns.length) * 10000) / 10000;
  metrics.averageROI = Math.round((totalROI / campaigns.length) * 100) / 100;

  return metrics;
}
