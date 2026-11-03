const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//JSON Handling variables
const jazz = {
  subject: {
    name: "Miles Davis",
    dates: "1926–1991",
    description: "American jazz trumpeter, composer and bandleader"
  },
  biography: [
    {
      heading: "Early Life",
      content: "Miles Davis was born in Alton, Illinois, in 1926."
    },
    {
      heading: "Birth of the Cool",
      content: "Davis helped establish the cool jazz movement."
    }
  ]
};

//Content folder path
const CONTENT = path.join(__dirname, 'content');

//one of the main functions to get the object from the content folder
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

//ROUTES
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

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

//EJS views
app.get('/jazz', (req, res) => {
  res.render('jazz', { data: jazz });
});

//SERVER STARTS ETX
const PORT = process.env.PORT || 9000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Local server: http://localhost:${PORT}`);
  });
}

// Export the app for Vercel deployment
module.exports = app;

