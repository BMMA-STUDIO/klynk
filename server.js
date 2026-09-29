const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const CONTENT = path.join(__dirname, 'content');

function getObject(id) {
  const dir = path.join(CONTENT, id);

  if (!fs.existsSync(dir)) return null;

  return {
    id,
    markdown: fs.readFileSync(
      path.join(dir, 'resume.md'),
      'utf8'
    ),
    data: JSON.parse(
      fs.readFileSync(
        path.join(dir, 'data.json'),
        'utf8'
      )
    )
  };
}

app.get('/model/:id', (req, res) => {
  const object = getObject(req.params.id);

  if (!object) {
    return res.status(404).send('Not found');
  }

  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${object.data.name}</title>
      </head>
      <body>
        <pre>${object.markdown}</pre>
      </body>
    </html>
  `);
});

app.get('/api/:id', (req, res) => {
  const object = getObject(req.params.id);

  if (!object) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(object.data);
});

app.get('/md/:id', (req, res) => {
  const object = getObject(req.params.id);

  if (!object) {
    return res.status(404).send('Not found');
  }

  res.type('text/markdown').send(object.markdown);
});

app.use(express.static(path.join(__dirname, 'public')));



const PORT = process.env.PORT || 9000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Local server: http://localhost:${PORT}`);
  });
}


module.exports = app;

