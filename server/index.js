// web server
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

// debugging
const consola = require('consola');

// nuxt builder
const { Nuxt, Builder } = require('nuxt');

// web requests
const axios = require('axios');

// xml parsing
const parseString = require('xml2js').parseString;

// file system
const fs = require('fs');
const os = require('os');

// server processes
const { spawn } = require('child_process');

// BusyLibrarian settings
let settings = JSON.parse(fs.readFileSync(__dirname + '/../settings.json'));

// torrent client
const Transmission = require('transmission');
let transmission = new Transmission({
  host: settings.downloader.url,
  port: parseInt(settings.downloader.port),
  username: settings.downloader.username,
  password: settings.downloader.password
})

// logging utility
const winston = require('winston')
const logger = winston.createLogger({
  level: 'verbose',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
  ),

  transports: [
    new winston.transports.File({
      filename: __dirname + '/../log.txt',
      maxFiles: 1,
      maxsize: 500000
    })
  ]
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// auth module
if (settings.general.login) {
  const auth = require('http-auth');
  var basic = auth.basic({
    realm: "BusyLibrarian",
  }, (username, password, callback) => {
    callback(username === settings.general.username && password === settings.general.password)
  });
  app.use(auth.connect(basic));
}

// session middleware
app.use(session({
  secret: 'busysaaaalt!',
  resave: false,
  saveUninitialized: false,
}))

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js');
config.dev = process.env.NODE_ENV !== 'production';

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Init Nuxt.js
const nuxt = new Nuxt(config)

const { host, port } = nuxt.options.server;

// Build only in dev mode
if (config.dev) {
  const builder = new Builder(nuxt);
  builder.build();
} else {
  nuxt.ready();
}

// api endpoints
app.post('/api/goodreads_search', async (req, res) => {
  logger.verbose('Starting a GoodReads search');

  if (!req.body.q) {
    logger.verbose('Rejecting a badly formed API request');
    return res.status(400).send();
  }

  try {
    let { data } = await axios.get('https://www.goodreads.com/search/index.xml', {
      params: {
        // I GRANT you this api key. Use it WISELY young PADAWAN !
        key: '1ITsOd1oN71P8V2KndqGQ',
        q: req.body.q
      }
    });

    parseString(data, { mergeAttrs: true }, (err, xml) => {
      if (err) {
        logger.warn('Unable to parse GoodReads api xml: ' + err);
        res.status(500).send(err);
      } else {
        let formatted = [];
        let tmp_items = xml.GoodreadsResponse.search[0].results[0].work;
        if (!tmp_items) tmp_items = [];
        tmp_items.forEach(el => {
          formatted.push({
            id: el.id[0]._,
            title: el.best_book[0].title[0],
            author: el.best_book[0].author[0].name[0],
            image: el.best_book[0].image_url[0]
          });
        });
        res.send(formatted);
      }
    }
    );


  } catch (e) {
    logger.error(e);
    res.status(500).send(e);
  }

})

app.post('/api/test_torznab', async (req, res) => {

  if (!req.body.url || !req.body.apiKey) {
    logger.verbose('Rejecting a badly formed API request');
    return res.status(400).send();
  }

  try {
    let test = await axios.get(req.body.url, {
      params: {
        apikey: req.body.apiKey
      }
    });

    parseString(test.data, { mergeAttrs: true, explicitArray: false }, (err, xml) => {

      if (err) {
        logger.warn('Unable to parse torznab xml: ' + err);
        return res.json({
          success: false,
          error: err
        });
      }

      if (xml.error) {
        return res.json({
          success: false,
          error: 'Error ' + xml.error.code + ': ' + xml.error.description
        });
      }

      return res.json({
        success: true
      })

    });
  } catch (e) {
    logger.error(e);
    res.json({
      success: false,
      error: e.message
    });
  }

});

app.post('/api/logs', (req, res) => {

  fs.readFile(__dirname + '/../log.txt', (err, data) => {
    if (err) {
      logger.error('Can\'t send the log file to the client !')
      return res.status(500).send();
    }


    let logs = [];

    let lines = data.toString().split(os.EOL);

    lines.forEach(el => {
      // skip empty lines
      if (el) {
        let tokenize = el.split(' ');
        // the resulting array is something like: ['2019-08-01', '13:41:38', 'info:', 'starting', search']

        let timestamp = tokenize[0] + ' ' + tokenize[1];
        let log = '';
        for (let i = 3; i < tokenize.length - 1; i++) {
          log += tokenize[i] + ' ';
        }
        log += tokenize[tokenize.length - 1];

        logs.push({
          date: timestamp,
          // remove the ":"
          level: tokenize[2].slice(0, -1).toUpperCase(),
          log: log
        });
      }
    });
    res.json(logs);

  });

});

app.post('/api/settings', (req, res) => {
  fs.readFile(__dirname + '/../settings.json', (err, data) => {

    let settings = JSON.parse(data);

    if (err) {
      logger.error('Error reading the settings.json file: ' + err)
      res.json({
        success: false,
        error: err
      });
    } else {
      res.json({
        success: true,
        settings
      });
    }
  });

});

app.post('/api/set_settings', (req, res) => {

  if (!req.body.settings) {
    logger.verbose('Rejecting a badly formed API request');
    return res.status(400).send();
  }

  settings = req.body.settings;

  fs.writeFile(__dirname + '/../settings.json', JSON.stringify(req.body.settings, null, 4), (err) => {
    if (err) {
      logger.error('Error writing to the settings.json file: ' + err)
      return res.json({
        success: false,
        error: 'Could not write to disk: ' + err
      })
    } else {
      logger.info('New settings saved to settings.json');
      return res.json({
        success: true
      })
    }
  })
});

app.post('/api/torznab', async (req, res) => {

  if (!req.body.q || !req.body.url || !req.body.apiKey) {
    logger.verbose('Rejecting a badly formed API request');
    return res.status(400).send();
  }

  try {
    let { data } = await axios.get(req.body.url, {
      params: {
        q: req.body.q,
        // ebook category
        cat: 8010,
        apikey: req.body.apiKey
      }
    })

    parseString(data, { mergeAttrs: true }, (err, xml) => {

      if (err) {
        logger.warn('Unable to parse the torznab response: ' + err);
        return res.status(500).send()
      }

      let provider = {
        title: xml.rss.channel[0].title[0],
        description: xml.rss.channel[0].description[0],
        url: xml.rss.channel[0].link[0],
      }

      let items = [];
      let tmp_items = xml.rss.channel[0].item;
      if (!tmp_items) tmp_items = [];

      tmp_items.forEach(el => {

        // skip audiobooks
        if (!el.title[0].toLowerCase().includes('mp3') || req.body.q.includes('mp3')) {
          items.push({
            title: el.title[0],
            enclosure: el.enclosure[0].url[0],
            guid: el.guid[0]
          })
        }

      });

      res.json({
        success: true,
        provider,
        items
      });

    });

  } catch (e) {
    logger.error('Could not get to the torznab api: ' + e);
    res.json({
      success: false,
      error: e
    })
  }

});

app.post('/api/add_torrent', (req, res) => {

  if (!req.body.url) {
    logger.verbose('Rejecting a badly formed API request');
    return res.status(400).send();
  }

  transmission.addUrl(req.body.url, {
    "download-dir": settings.downloader.dir
  }, (err, result) => {
    if (err) {
      logger.error('Can\'t add the torrent to transmission: ' + err);
      return res.json({
        success: false,
        error: err
      });
    } else {
      logger.info('Added a torrent to transmission.');
      if (settings.processing.calibre) {
        transmission.waitForState(result.id, 'SEED', handleFinishedDownload);
      }

      return res.json({
        success: true
      });
    }
  });
});

function handleFinishedDownload(err, torrent) {

  if (err) {
    logger.error('Error with the download: ' + err);
  } else {

    let calibreArgs = [
      'add', '-r', settings.downloader.dir,
      '--library-path', settings.processing.url,
      '--username', settings.processing.username,
      '--password', settings.processing.password
    ];

    let calibre = spawn('calibredb', calibreArgs);

    calibre.on('close', code => {
      if (code === 0) {
        logger.info('Added new books to calibre.');
      } else {
        logger.error('Calibre process exited with error code ' + code + ' !');
      }
    });
  }
}

// Give nuxt middleware to express
app.use(nuxt.render);

// Listen the server
app.listen(port, host);
consola.ready({
  message: `Server listening on http://${host}:${port}`,
  badge: true
});
