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
      fetch(`https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=us,eu&markets=h2h&oddsFormat=american&bookmakers=fanduel,draftkings,betmgm,betrivers,caesars,fanatics,pinnacle`)
        .then(r => r.json())
        .catch(() => [])
    );
    const results = await Promise.all(promises);
    const allGames = results.flat().filter(g => g && g.id);
    res.json(allGames);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Running on http://localhost:3000'));