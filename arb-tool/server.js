require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.static('public'));

const SPORTS = [
  'baseball_mlb',
  'basketball_nba',
  'icehockey_nhl',
  'americanfootball_nfl'
];

async function fetchOdds(sport) {
  const res = await fetch(
    `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=us,eu&markets=h2h,spreads,totals&oddsFormat=american&bookmakers=fanduel,draftkings,betmgm,betrivers,pinnacle`
  );
  return res.json();
}

async function fetchMLBProps() {
  const markets = 'batter_home_runs,batter_hits,batter_rbis,pitcher_strikeouts,pitcher_hits_allowed';
  const res = await fetch(
    `https://api.the-odds-api.com/v4/sports/baseball_mlb/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=us&markets=${markets}&oddsFormat=american&bookmakers=fanduel,draftkings,betmgm,betrivers`
  );
  return res.json();
}

async function fetchNBAProps() {
  const markets = 'player_points,player_rebounds,player_assists,player_threes';
  const res = await fetch(
    `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=us&markets=${markets}&oddsFormat=american&bookmakers=fanduel,draftkings,betmgm,betrivers`
  );
  return res.json();
}

app.get('/api/odds', async (req, res) => {
  try {
    const now = new Date();
    const gamePromises = SPORTS.map(sport => fetchOdds(sport).catch(() => []));
    const gameResults = await Promise.all(gamePromises);
    const allGames = gameResults.flat().filter(g => g && g.id);
    const pregame = allGames.filter(g => new Date(g.commence_time) > now);
    const live = allGames.filter(g => new Date(g.commence_time) <= now);
    const [mlbProps, nbaProps] = await Promise.all([
      fetchMLBProps().catch(() => []),
      fetchNBAProps().catch(() => [])
    ]);
    res.json({
      games: pregame,
      liveGames: live,
      mlbProps: Array.isArray(mlbProps) ? mlbProps : [],
      nbaProps: Array.isArray(nbaProps) ? nbaProps : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Running on http://localhost:3000'));