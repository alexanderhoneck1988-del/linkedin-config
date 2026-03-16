import axios from 'axios';
import { getCache, setCache } from './db';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';
const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

// Beispiel-Daten für Demo (wenn API nicht konfiguriert ist)
const DEMO_AUDIENCE_DATA = {
  jobTitles: [
    { id: 'ceo', label: 'CEO / Founder', audienceSize: 180000, avgCPM: 28, avgCPC: 2.80, ctr: 0.045, conversionRate: 0.035 },
    { id: 'vp', label: 'VP / Director', audienceSize: 420000, avgCPM: 22, avgCPC: 1.85, ctr: 0.052, conversionRate: 0.042 },
    { id: 'manager', label: 'Manager / Senior Specialist', audienceSize: 850000, avgCPM: 15, avgCPC: 1.25, ctr: 0.068, conversionRate: 0.051 },
    { id: 'ic', label: 'Individual Contributor', audienceSize: 1200000, avgCPM: 10, avgCPC: 0.85, ctr: 0.072, conversionRate: 0.038 },
  ],
  industries: [
    { id: 'tech', label: 'Technology & Software', audienceSize: 650000, avgCPM: 26, avgCPC: 2.15, ctr: 0.058, conversionRate: 0.048 },
    { id: 'finance', label: 'Financial Services', audienceSize: 480000, avgCPM: 29, avgCPC: 2.45, ctr: 0.051, conversionRate: 0.045 },
    { id: 'healthcare', label: 'Healthcare & Life Sciences', audienceSize: 320000, avgCPM: 24, avgCPC: 2.00, ctr: 0.055, conversionRate: 0.052 },
    { id: 'consulting', label: 'Consulting & Professional Services', audienceSize: 380000, avgCPM: 20, avgCPC: 1.65, ctr: 0.062, conversionRate: 0.041 },
    { id: 'manufacturing', label: 'Manufacturing', audienceSize: 290000, avgCPM: 12, avgCPC: 1.00, ctr: 0.065, conversionRate: 0.035 },
    { id: 'retail', label: 'Retail & E-Commerce', audienceSize: 420000, avgCPM: 11, avgCPC: 0.90, ctr: 0.075, conversionRate: 0.033 },
  ],
  locations: [
    { id: 'de', label: 'Deutschland', audienceSize: 1100000, avgCPM: 14, avgCPC: 1.15, ctr: 0.065, conversionRate: 0.042 },
    { id: 'at', label: 'Österreich', audienceSize: 180000, avgCPM: 13, avgCPC: 1.10, ctr: 0.068, conversionRate: 0.040 },
    { id: 'ch', label: 'Schweiz', audienceSize: 220000, avgCPM: 16, avgCPC: 1.35, ctr: 0.062, conversionRate: 0.045 },
    { id: 'eu', label: 'Weitere EU-Länder', audienceSize: 2800000, avgCPM: 12, avgCPC: 1.00, ctr: 0.070, conversionRate: 0.038 },
  ],
  companySizes: [
    { id: '1-10', label: '1-10 Mitarbeiter', audienceSize: 420000, avgCPM: 9, avgCPC: 0.75, ctr: 0.078, conversionRate: 0.055 },
    { id: '11-50', label: '11-50 Mitarbeiter', audienceSize: 580000, avgCPM: 11, avgCPC: 0.90, ctr: 0.072, conversionRate: 0.048 },
    { id: '51-200', label: '51-200 Mitarbeiter', audienceSize: 620000, avgCPM: 14, avgCPC: 1.15, ctr: 0.065, conversionRate: 0.042 },
    { id: '201-500', label: '201-500 Mitarbeiter', audienceSize: 480000, avgCPM: 18, avgCPC: 1.50, ctr: 0.058, conversionRate: 0.038 },
    { id: '500+', label: '500+ Mitarbeiter', audienceSize: 620000, avgCPM: 24, avgCPC: 2.00, ctr: 0.051, conversionRate: 0.032 },
  ],
  engagementLevels: [
    { id: 'high', label: 'Hochgradig engagiert (Top 20%)', audienceSize: 580000, avgCPM: 22, avgCPC: 1.85, ctr: 0.095, conversionRate: 0.068 },
    { id: 'medium', label: 'Durchschnittlich engagiert', audienceSize: 1200000, avgCPM: 15, avgCPC: 1.25, ctr: 0.062, conversionRate: 0.042 },
    { id: 'low', label: 'Gelegentliche Aktivität', audienceSize: 1420000, avgCPM: 8, avgCPC: 0.65, ctr: 0.035, conversionRate: 0.020 },
  ],
};

// LinkedIn API - Audience Insights abrufen
export async function getLinkedInAudienceInsights(targeting) {
  const cacheKey = `audience_${JSON.stringify(targeting)}`;
  
  // Versuche aus Cache zu laden
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    if (!accessToken) {
      console.log('⚠️ LinkedIn API Token nicht konfiguriert. Verwende Demo-Daten.');
      setCache(cacheKey, DEMO_AUDIENCE_DATA, 24);
      return DEMO_AUDIENCE_DATA;
    }

    // Echte LinkedIn API Call (wenn konfiguriert)
    const response = await axios.post(
      `${LINKEDIN_API_BASE}/adAudiencesV2`,
      {
        targeting,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    );

    const result = response.data;
    setCache(cacheKey, result, 24);
    return result;
  } catch (error) {
    console.error('LinkedIn API Error:', error.message);
    // Fallback zu Demo-Daten bei API-Fehler
    return DEMO_AUDIENCE_DATA;
  }
}

// Campaign Manager - Historische Kampagnendaten abrufen
export async function getLinkedInCampaignHistory() {
  const cacheKey = 'campaigns_history';
  
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    if (!accessToken) {
      console.log('📊 Campaign Manager API nicht konfiguriert. Verwende Beispiel-Daten.');
      const mockCampaigns = generateMockCampaignData();
      setCache(cacheKey, mockCampaigns, 24);
      return mockCampaigns;
    }

    // Echte LinkedIn Campaign Manager API
    const response = await axios.get(
      `${LINKEDIN_API_BASE}/adAccountsV2`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          q: 'search',
          status: 'ACTIVE',
          sort: ['-lastModifiedTime'],
        },
      }
    );

    const result = response.data;
    setCache(cacheKey, result, 12); // 12h cache für Kampagnen
    return result;
  } catch (error) {
    console.error('LinkedIn Campaign Manager Error:', error.message);
    const mockCampaigns = generateMockCampaignData();
    return mockCampaigns;
  }
}

// Mock-Daten für Demo
function generateMockCampaignData() {
  return {
    campaigns: [
      {
        id: 'camp_001',
        name: 'Tech Leads DACH - Q4 2024',
        startDate: '2024-10-01',
        endDate: '2024-12-31',
        targeting: { jobTitles: ['vp', 'manager'], industries: ['tech'], locations: ['de', 'at', 'ch'] },
        budget: 5000,
        spend: 4850,
        impressions: 185000,
        clicks: 9250,
        conversions: 385,
        cpm: 26.22,
        cpc: 0.52,
        ctr: 0.05,
        conversionRate: 0.0416,
        roi: 2.15,
        roas: 3.42,
      },
      {
        id: 'camp_002',
        name: 'Finance Decision Makers EU',
        startDate: '2024-09-15',
        endDate: '2024-11-30',
        targeting: { jobTitles: ['ceo', 'vp'], industries: ['finance'], locations: ['eu'] },
        budget: 8000,
        spend: 7920,
        impressions: 260000,
        clicks: 12480,
        conversions: 520,
        cpm: 30.46,
        cpc: 0.63,
        ctr: 0.048,
        conversionRate: 0.0417,
        roi: 1.89,
        roas: 2.95,
      },
      {
        id: 'camp_003',
        name: 'Healthcare Professionals Germany',
        startDate: '2024-11-01',
        endDate: '2024-12-15',
        targeting: { jobTitles: ['manager'], industries: ['healthcare'], locations: ['de'] },
        budget: 3000,
        spend: 2850,
        impressions: 142500,
        clicks: 8550,
        conversions: 325,
        cpm: 19.98,
        cpc: 0.33,
        ctr: 0.06,
        conversionRate: 0.038,
        roi: 2.42,
        roas: 3.71,
      },
      {
        id: 'camp_004',
        name: 'Startup Founders DACH',
        startDate: '2024-10-15',
        endDate: '2024-12-20',
        targeting: { jobTitles: ['ceo'], companySizes: ['1-10'], locations: ['de', 'at', 'ch'] },
        budget: 4500,
        spend: 4200,
        impressions: 520000,
        clicks: 31200,
        conversions: 624,
        cpm: 8.08,
        cpc: 0.13,
        ctr: 0.06,
        conversionRate: 0.02,
        roi: 3.29,
        roas: 4.62,
      },
      {
        id: 'camp_005',
        name: 'Enterprise IT Buyers',
        startDate: '2024-09-01',
        endDate: '2024-12-31',
        targeting: { jobTitles: ['vp', 'manager'], companySizes: ['500+'], industries: ['tech'] },
        budget: 12000,
        spend: 11850,
        impressions: 325000,
        clicks: 16250,
        conversions: 650,
        cpm: 36.46,
        cpc: 0.73,
        ctr: 0.05,
        conversionRate: 0.04,
        roi: 1.68,
        roas: 2.68,
      },
    ],
    summary: {
      totalBudget: 32500,
      totalSpend: 31670,
      totalImpressions: 1433500,
      totalClicks: 77730,
      totalConversions: 2504,
      avgCPM: 22.08,
      avgCPC: 0.408,
      avgCTR: 0.0542,
      avgConversionRate: 0.0322,
      avgROI: 2.29,
      totalRoas: 3.28,
    },
  };
}

export default {
  getLinkedInAudienceInsights,
  getLinkedInCampaignHistory,
};
