const express = require('express');
const bodyParser = require('body-parser');
const dns = require('dns');
const { URL } = require('url');
const cors = require('cors');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Basic Configuration
const port = process.env.PORT || 3000;
const store = []; // { original_url, short_url }

// POST
app.post('/api/shorturl', (req, res) => {
  const input = req.body.url;
  if (!input) return res.json({ error: 'invalid url' });

  let hostname;
  try { hostname = new URL(input).hostname; }
  catch (err) { return res.json({ error: 'invalid url' }); }

  dns.lookup(hostname, (err) => {
    if (err) return res.json({ error: 'invalid url' });

    const found = store.find(s => s.original_url === input);
    if (found) return res.json(found);

    const short = store.length + 1;
    const newObj = { original_url: input, short_url: short };
    store.push(newObj);
    res.json(newObj);
  });
});

// GET
app.get('/api/shorturl/:short', (req, res) => {
  const short = parseInt(req.params.short);
  console.log(short);
  const item = store.find(s => s.short_url === short);
  if (!item) return res.json({ error: 'No short URL found for the given input' });
  res.redirect(item.original_url);
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
