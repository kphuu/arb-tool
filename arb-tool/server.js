require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.static('public'));

const SPORTS = ['baseball_mlb', 'basketball_nba', 'icehockey_nhl', 'americanfootball_nfl'];

async function fetchSharpAPI(sport) {
  const res = await fetch(`https://api.sharpapi.io/api/v1/odds?sport=${sport}`, {
    headers: { 'X-API-Key': process.env.SHARP_API_KEY }
  });
  return res.json();
}

async function fetchOddsAPI(sport) {
  const res = await fetch(
&bookmakers=fanduel,draftkings,betmgm,betrivers,caesars,fanatics,pinnacle  );
  return res.json();
}

app.get('/api/odds', async (req, res) => {
  try {
    let allGames = [];

    // Try SharpAPI first
    try {
      const promises = SPORTS.map(sport => fetchSharpAPI(sport).catch(() => []));
      const results = await Promise.all(promises);
      allGames = results.flat().filter(g => g && g.id);
    } catch (e) {
      console.log('SharpAPI failed, falling back to Odds API');
    }

    // Fallback to Odds API if SharpAPI returns nothing
    if (allGames.length === 0) {
      const promises = SPORTS.map(sport => fetchOddsAPI(sport).catch(() => []));
      const results = await Promise.all(promises);
      allGames = results.flat().filter(g => g && g.id);
    }

    // HR props from Odds API
    const hrProps = await fetch(
      `https://api.the-odds-api.com/v4/sports/baseball_mlb/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=us&markets=batter_home_runs&oddsFormat=american&bookmakers=fanduel,draftkings,betmgm,betrivers`
    ).then(r => r.json()).catch(() => []);

    res.json({ games: allGames, hrProps: Array.isArray(hrProps) ? hrProps : [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Running on http://localhost:3000'));