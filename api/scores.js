let cachedScores = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; 

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const currentTime = Date.now();

  if (cachedScores && (currentTime - lastFetchTime < CACHE_DURATION)) {
    return res.status(200).json({ source: 'vercel_cache', data: cachedScores });
  }

  try {
    const response = await fetch('https://api-sports.io', {
      headers: { 
        'x-apisports-key': process.env.API_SPORTS_KEY 
      }
    });
    
    const rawData = await response.json();
    cachedScores = rawData.response || []; 
    lastFetchTime = currentTime;

    return res.status(200).json({ source: 'live_api_fetch', data: cachedScores });
  } catch (error) {
    if (cachedScores) {
      return res.status(200).json({ source: 'emergency_fallback', data: cachedScores });
    }
    return res.status(500).json({ error: 'Failed to access sports telemetry data stream.' });
  }
}
