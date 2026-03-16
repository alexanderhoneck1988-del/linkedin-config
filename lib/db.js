import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './data/campaigns.db';

// Stelle sicher, dass das Verzeichnis existiert
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

// Initialisiere Datenbank Schema
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      targetJobTitles TEXT,
      targetIndustries TEXT,
      targetLocations TEXT,
      targetCompanySizes TEXT,
      targetEngagement TEXT,
      budget REAL,
      spend REAL,
      impressions INTEGER,
      clicks INTEGER,
      conversions INTEGER,
      ctr REAL,
      conversionRate REAL,
      roi REAL,
      cpm REAL,
      cpc REAL,
      roas REAL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audience_insights (
      id TEXT PRIMARY KEY,
      jobTitle TEXT,
      industry TEXT,
      location TEXT,
      companySize TEXT,
      engagement TEXT,
      audienceSize INTEGER,
      avgCPM REAL,
      avgCPC REAL,
      historicalCTR REAL,
      historicalConversionRate REAL,
      lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS api_cache (
      key TEXT PRIMARY KEY,
      data TEXT,
      expiresAt TEXT
    );
  `);
}

// Campaign-Funktionen
export function getCampaigns() {
  const stmt = db.prepare('SELECT * FROM campaigns ORDER BY createdAt DESC');
  return stmt.all();
}

export function getCampaignById(id) {
  const stmt = db.prepare('SELECT * FROM campaigns WHERE id = ?');
  return stmt.get(id);
}

export function saveCampaign(campaign) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO campaigns 
    (id, name, startDate, endDate, targetJobTitles, targetIndustries, targetLocations, 
     targetCompanySizes, targetEngagement, budget, spend, impressions, clicks, conversions, 
     ctr, conversionRate, roi, cpm, cpc, roas)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  return stmt.run(
    campaign.id,
    campaign.name,
    campaign.startDate,
    campaign.endDate,
    JSON.stringify(campaign.targetJobTitles),
    JSON.stringify(campaign.targetIndustries),
    JSON.stringify(campaign.targetLocations),
    JSON.stringify(campaign.targetCompanySizes),
    JSON.stringify(campaign.targetEngagement),
    campaign.budget,
    campaign.spend,
    campaign.impressions,
    campaign.clicks,
    campaign.conversions,
    campaign.ctr,
    campaign.conversionRate,
    campaign.roi,
    campaign.cpm,
    campaign.cpc,
    campaign.roas
  );
}

// Audience Insights Funktionen
export function getAudienceInsights(filters) {
  let query = 'SELECT * FROM audience_insights WHERE 1=1';
  const params = [];

  if (filters.jobTitle) {
    query += ' AND jobTitle = ?';
    params.push(filters.jobTitle);
  }
  if (filters.industry) {
    query += ' AND industry = ?';
    params.push(filters.industry);
  }
  if (filters.location) {
    query += ' AND location = ?';
    params.push(filters.location);
  }

  const stmt = db.prepare(query);
  return stmt.all(...params);
}

export function saveAudienceInsights(insights) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO audience_insights 
    (id, jobTitle, industry, location, companySize, engagement, audienceSize, avgCPM, avgCPC, historicalCTR, historicalConversionRate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    insights.id,
    insights.jobTitle,
    insights.industry,
    insights.location,
    insights.companySize,
    insights.engagement,
    insights.audienceSize,
    insights.avgCPM,
    insights.avgCPC,
    insights.historicalCTR,
    insights.historicalConversionRate
  );
}

// Cache-Funktionen für API
export function getCache(key) {
  const stmt = db.prepare('SELECT data FROM api_cache WHERE key = ? AND expiresAt > ?');
  const result = stmt.get(key, new Date().toISOString());
  return result ? JSON.parse(result.data) : null;
}

export function setCache(key, data, ttlHours = 24) {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
  const stmt = db.prepare('INSERT OR REPLACE INTO api_cache (key, data, expiresAt) VALUES (?, ?, ?)');
  stmt.run(key, JSON.stringify(data), expiresAt);
}

// Kampagnen-Performance Aggregation
export function getPerformanceByAudience() {
  const stmt = db.prepare(`
    SELECT 
      targetJobTitles,
      COUNT(*) as campaignCount,
      ROUND(AVG(cpm), 2) as avgCPM,
      ROUND(AVG(ctr), 4) as avgCTR,
      ROUND(AVG(conversionRate), 4) as avgConversionRate,
      ROUND(AVG(roi), 2) as avgROI,
      SUM(impressions) as totalImpressions,
      SUM(clicks) as totalClicks,
      SUM(conversions) as totalConversions,
      ROUND(SUM(spend), 2) as totalSpend
    FROM campaigns
    GROUP BY targetJobTitles
    ORDER BY campaignCount DESC
  `);
  
  return stmt.all().map(row => ({
    ...row,
    targetJobTitles: JSON.parse(row.targetJobTitles)
  }));
}

export default db;
