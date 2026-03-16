import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import styles from '@/styles/home.module.css';

export default function Home() {
  const [config, setConfig] = useState({
    jobTitles: [],
    industries: [],
    locations: [],
    companySizes: [],
    engagementLevels: [],
  });

  const [results, setResults] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('config'); // config, history, comparison

  // Targeting-Optionen
  const jobTitlesOptions = [
    { id: 'ceo', label: 'CEO / Founder', avgCPM: 28 },
    { id: 'vp', label: 'VP / Director', avgCPM: 22 },
    { id: 'manager', label: 'Manager / Senior Specialist', avgCPM: 15 },
    { id: 'ic', label: 'Individual Contributor', avgCPM: 10 },
  ];

  const industriesOptions = [
    { id: 'tech', label: 'Technology & Software', avgCPM: 26 },
    { id: 'finance', label: 'Financial Services', avgCPM: 29 },
    { id: 'healthcare', label: 'Healthcare & Life Sciences', avgCPM: 24 },
    { id: 'consulting', label: 'Consulting & Professional Services', avgCPM: 20 },
    { id: 'manufacturing', label: 'Manufacturing', avgCPM: 12 },
    { id: 'retail', label: 'Retail & E-Commerce', avgCPM: 11 },
  ];

  const locationsOptions = [
    { id: 'de', label: 'Deutschland', avgCPM: 14 },
    { id: 'at', label: 'Österreich', avgCPM: 13 },
    { id: 'ch', label: 'Schweiz', avgCPM: 16 },
    { id: 'eu', label: 'Weitere EU-Länder', avgCPM: 12 },
  ];

  const companySizesOptions = [
    { id: '1-10', label: '1-10 Mitarbeiter', avgCPM: 9 },
    { id: '11-50', label: '11-50 Mitarbeiter', avgCPM: 11 },
    { id: '51-200', label: '51-200 Mitarbeiter', avgCPM: 14 },
    { id: '201-500', label: '201-500 Mitarbeiter', avgCPM: 18 },
    { id: '500+', label: '500+ Mitarbeiter', avgCPM: 24 },
  ];

  const engagementOptions = [
    { id: 'high', label: 'Hochgradig engagiert', avgCPM: 22 },
    { id: 'medium', label: 'Durchschnittlich engagiert', avgCPM: 15 },
    { id: 'low', label: 'Gelegentliche Aktivität', avgCPM: 8 },
  ];

  // Lade Campaign History beim Mount
  useEffect(() => {
    loadCampaignHistory();
  }, []);

  const loadCampaignHistory = async () => {
    try {
      const response = await axios.get('/api/campaigns');
      setCampaigns(response.data.data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const toggleOption = (category, id) => {
    setConfig(prev => ({
      ...prev,
      [category]: prev[category].includes(id)
        ? prev[category].filter(item => item !== id)
        : [...prev[category], id]
    }));
  };

  const calculateResults = async () => {
    if (!config.jobTitles.length || !config.industries.length) {
      alert('Bitte wählen Sie mindestens einen Job-Titel und eine Branche aus');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/audience-insights', {
        targeting: config,
      });

      const data = response.data;
      
      // Berechne aggregierte Metriken
      const insights = calculateAggregatedMetrics(data);
      setResults(insights);
      setActiveTab('results');
    } catch (error) {
      console.error('Error calculating results:', error);
      alert('Fehler bei der Berechnung. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAggregatedMetrics = (data) => {
    const { performanceMetrics, campaignHistory, summary } = data;
    
    // Berechne gewichtete Durchschnitte basierend auf historischen Daten
    const filteredCampaigns = campaignHistory.filter(c => {
      const matches = (
        (!config.jobTitles.length || config.jobTitles.some(jt => c.targeting?.jobTitles?.includes(jt))) &&
        (!config.industries.length || config.industries.some(ind => c.targeting?.industries?.includes(ind))) &&
        (!config.locations.length || config.locations.some(loc => c.targeting?.locations?.includes(loc)))
      );
      return matches;
    });

    const avgCPM = filteredCampaigns.length > 0
      ? (filteredCampaigns.reduce((sum, c) => sum + c.cpm, 0) / filteredCampaigns.length).toFixed(2)
      : performanceMetrics.averageCPM;

    const avgCTR = filteredCampaigns.length > 0
      ? (filteredCampaigns.reduce((sum, c) => sum + c.ctr, 0) / filteredCampaigns.length).toFixed(4)
      : performanceMetrics.averageCTR;

    const avgConversionRate = filteredCampaigns.length > 0
      ? (filteredCampaigns.reduce((sum, c) => sum + c.conversionRate, 0) / filteredCampaigns.length).toFixed(4)
      : performanceMetrics.averageConversionRate;

    const avgROI = filteredCampaigns.length > 0
      ? (filteredCampaigns.reduce((sum, c) => sum + c.roi, 0) / filteredCampaigns.length).toFixed(2)
      : performanceMetrics.averageROI;

    // Berechne Audience Size (Mock)
    const baseAudienceSize = 500000;
    const reduction = (config.jobTitles.length + config.industries.length + config.locations.length + config.companySizes.length + config.engagementLevels.length) * 50000;
    const audienceSize = Math.max(100000, baseAudienceSize - reduction);

    return {
      audienceSize: Math.round(audienceSize),
      avgCPM: parseFloat(avgCPM),
      avgCTR: parseFloat(avgCTR),
      avgConversionRate: parseFloat(avgConversionRate),
      avgROI: parseFloat(avgROI),
      estimatedDailyImpressions: Math.round(audienceSize * 0.05),
      dailyBudgetSuggestion: Math.round((avgCPM * (audienceSize * 0.05)) / 1000),
      relevantCampaigns: filteredCampaigns,
      totalCampaigns: campaignHistory.length,
    };
  };

  const exportConfig = () => {
    if (!results) return;

    const configData = {
      timestamp: new Date().toISOString(),
      configuration: {
        jobTitles: config.jobTitles.map(id => jobTitlesOptions.find(i => i.id === id)?.label),
        industries: config.industries.map(id => industriesOptions.find(i => i.id === id)?.label),
        locations: config.locations.map(id => locationsOptions.find(i => i.id === id)?.label),
        companySizes: config.companySizes.map(id => companySizesOptions.find(i => i.id === id)?.label),
        engagementLevels: config.engagementLevels.map(id => engagementOptions.find(i => i.id === id)?.label),
      },
      metrics: results,
    };

    const dataStr = JSON.stringify(configData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linkedin-config-${Date.now()}.json`;
    link.click();
  };

  const reset = () => {
    setConfig({
      jobTitles: [],
      industries: [],
      locations: [],
      companySizes: [],
      engagementLevels: [],
    });
    setResults(null);
  };

  return (
    <>
      <Head>
        <title>LinkedIn Audience Configurator</title>
        <meta name="description" content="LinkedIn Audience Targeting Configuration Tool" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>LinkedIn Audience Configurator</h1>
          <p>Zielgruppen konfigurieren, Performance verstehen, Kampagnen optimieren</p>
        </header>

        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'config' ? styles.active : ''}`}
            onClick={() => setActiveTab('config')}
          >
            ⚙️ Konfiguration
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📊 Kampagnenhistorie ({campaigns?.length || 0})
          </button>
          {results && (
            <button
              className={`${styles.tab} ${activeTab === 'results' ? styles.active : ''}`}
              onClick={() => setActiveTab('results')}
            >
              ✓ Ergebnisse
            </button>
          )}
        </nav>

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className={styles.content}>
            <div className={styles.grid}>
              <div className={styles.section}>
                <h3>Job-Titel & Seniority</h3>
                {jobTitlesOptions.map(option => (
                  <label key={option.id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.jobTitles.includes(option.id)}
                      onChange={() => toggleOption('jobTitles', option.id)}
                    />
                    <span>{option.label}</span>
                    <span className={styles.cpm}>€{option.avgCPM}</span>
                  </label>
                ))}
              </div>

              <div className={styles.section}>
                <h3>Branche / Sektor</h3>
                {industriesOptions.map(option => (
                  <label key={option.id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.industries.includes(option.id)}
                      onChange={() => toggleOption('industries', option.id)}
                    />
                    <span>{option.label}</span>
                    <span className={styles.cpm}>€{option.avgCPM}</span>
                  </label>
                ))}
              </div>

              <div className={styles.section}>
                <h3>Geografischer Standort</h3>
                {locationsOptions.map(option => (
                  <label key={option.id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.locations.includes(option.id)}
                      onChange={() => toggleOption('locations', option.id)}
                    />
                    <span>{option.label}</span>
                    <span className={styles.cpm}>€{option.avgCPM}</span>
                  </label>
                ))}
              </div>

              <div className={styles.section}>
                <h3>Unternehmensgröße</h3>
                {companySizesOptions.map(option => (
                  <label key={option.id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.companySizes.includes(option.id)}
                      onChange={() => toggleOption('companySizes', option.id)}
                    />
                    <span>{option.label}</span>
                    <span className={styles.cpm}>€{option.avgCPM}</span>
                  </label>
                ))}
              </div>

              <div className={styles.section}>
                <h3>Engagement-Level</h3>
                {engagementOptions.map(option => (
                  <label key={option.id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.engagementLevels.includes(option.id)}
                      onChange={() => toggleOption('engagementLevels', option.id)}
                    />
                    <span>{option.label}</span>
                    <span className={styles.cpm}>€{option.avgCPM}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.buttonPrimary}
                onClick={calculateResults}
                disabled={loading}
              >
                {loading ? 'Berechnung läuft...' : 'Konfiguration berechnen'}
              </button>
              <button className={styles.buttonSecondary} onClick={reset}>
                Zurücksetzen
              </button>
            </div>
          </div>
        )}

        {/* Campaign History Tab */}
        {activeTab === 'history' && campaigns && (
          <div className={styles.content}>
            <h2>Historische Kampagnen (Letzte 12 Monate)</h2>
            <div className={styles.campaignsList}>
              {campaigns.length > 0 ? (
                campaigns.map(campaign => (
                  <div key={campaign.id} className={styles.campaignCard}>
                    <div className={styles.campaignHeader}>
                      <h4>{campaign.name}</h4>
                      <span className={styles.dateRange}>
                        {campaign.startDate} bis {campaign.endDate}
                      </span>
                    </div>
                    <div className={styles.metricsGrid}>
                      <div className={styles.metric}>
                        <label>Budget</label>
                        <value>€{campaign.budget.toLocaleString()}</value>
                      </div>
                      <div className={styles.metric}>
                        <label>Impressionen</label>
                        <value>{(campaign.impressions / 1000).toFixed(0)}K</value>
                      </div>
                      <div className={styles.metric}>
                        <label>CPM</label>
                        <value>€{campaign.cpm.toFixed(2)}</value>
                      </div>
                      <div className={styles.metric}>
                        <label>CTR</label>
                        <value>{(campaign.ctr * 100).toFixed(2)}%</value>
                      </div>
                      <div className={styles.metric}>
                        <label>Conversions</label>
                        <value>{campaign.conversions}</value>
                      </div>
                      <div className={styles.metric}>
                        <label>Conv. Rate</label>
                        <value>{(campaign.conversionRate * 100).toFixed(2)}%</value>
                      </div>
                      <div className={styles.metric}>
                        <label>ROI</label>
                        <value className={campaign.roi > 2 ? styles.positive : ''}>{campaign.roi.toFixed(2)}x</value>
                      </div>
                      <div className={styles.metric}>
                        <label>ROAS</label>
                        <value>{campaign.roas.toFixed(2)}</value>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Keine Kampagnen gefunden.</p>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && results && (
          <div className={styles.content}>
            <h2>Konfiguration Ergebnisse</h2>
            
            <div className={styles.resultsGrid}>
              <div className={styles.resultCard}>
                <label>Zielgruppengröße</label>
                <value>{(results.audienceSize / 1000).toFixed(0)}K</value>
                <subtext>LinkedIn-Mitglieder</subtext>
              </div>
              <div className={styles.resultCard}>
                <label>Durchschn. CPM</label>
                <value>€{results.avgCPM.toFixed(2)}</value>
                <subtext>basierend auf Kampagnenhistorie</subtext>
              </div>
              <div className={styles.resultCard}>
                <label>Durchschn. CTR</label>
                <value>{(results.avgCTR * 100).toFixed(3)}%</value>
                <subtext>historischer Durchschnitt</subtext>
              </div>
              <div className={styles.resultCard}>
                <label>Durchschn. Conv. Rate</label>
                <value>{(results.avgConversionRate * 100).toFixed(2)}%</value>
                <subtext>historischer Durchschnitt</subtext>
              </div>
              <div className={styles.resultCard}>
                <label>Durchschn. ROI</label>
                <value className={results.avgROI > 2 ? styles.positive : ''}>{results.avgROI.toFixed(2)}x</value>
                <subtext>Return on Investment</subtext>
              </div>
              <div className={styles.resultCard}>
                <label>Empfohlenes Tagesbudget</label>
                <value>€{results.dailyBudgetSuggestion.toLocaleString()}</value>
                <subtext>für {(results.estimatedDailyImpressions / 1000).toFixed(0)}K Impressionen/Tag</subtext>
              </div>
            </div>

            <div className={styles.benchmarkSection}>
              <h3>Relevante Kampagnen aus Historie</h3>
              <p>Diese {results.relevantCampaigns.length} Kampagnen treffen eure Zielgruppen-Kriterien:</p>
              <div className={styles.campaignsList}>
                {results.relevantCampaigns.map(campaign => (
                  <div key={campaign.id} className={styles.campaignCard} style={{ minHeight: 'auto' }}>
                    <h4>{campaign.name}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '14px', marginTop: '1rem' }}>
                      <div>CPM: €{campaign.cpm.toFixed(2)}</div>
                      <div>CTR: {(campaign.ctr * 100).toFixed(2)}%</div>
                      <div>Conv: {(campaign.conversionRate * 100).toFixed(2)}%</div>
                      <div>ROI: {campaign.roi.toFixed(2)}x</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.buttonPrimary} onClick={exportConfig}>
                Konfiguration exportieren (JSON)
              </button>
              <button className={styles.buttonSecondary} onClick={() => setActiveTab('config')}>
                Neue Konfiguration
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
