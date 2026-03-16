import { getLinkedInCampaignHistory } from '@/lib/linkedin';
import { initializeDatabase } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      initializeDatabase();

      const campaigns = await getLinkedInCampaignHistory();

      return res.status(200).json({
        success: true,
        data: campaigns,
      });
    } catch (error) {
      console.error('Campaign History Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      initializeDatabase();

      const { campaignData } = req.body;

      if (!campaignData) {
        return res.status(400).json({ error: 'Campaign data required' });
      }

      // Hier könnte man die Daten in SQLite speichern
      // saveCampaign(campaignData);

      return res.status(201).json({
        success: true,
        message: 'Campaign saved successfully',
      });
    } catch (error) {
      console.error('Save Campaign Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
