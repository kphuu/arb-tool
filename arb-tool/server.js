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

app.get('/api/odds', async (req, res) => {
  try {
    const promises = SPORTS.map(sport =>
      fetch(`https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=us,eu&markets=h2h&oddsFormat=american&bookmakers=fanduel,draftkings,betmgm,betrivers,pinnacle`)
        .then(r => r.json())
        .catch(() => [])
    );

    const results = await Promise.all(promises);
    const now = new Date();
    const allGames = results.flat().filter(g => g && g.id);
    const pregame = allGames.filter(g => new Date(g.commence_time) > now);
    const live = allGames.filter(g => new Date(g.commence_time) <= now);

    const hrProps = await fetch(
      `https://api.the-odds-api.com/v4/sports/baseball_mlb/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=us&markets=batter_home_runs&oddsFormat=american&bookmakers=fanduel,draftkings,betmgm,betrivers`
    ).then(r => r.json()).catch(() => []);

    res.json({
      games: pregame,
      liveGames: live,
      hrProps: Array.isArray(hrProps) ? hrProps : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Running on http://localhost:3000'));