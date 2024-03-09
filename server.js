import express from 'express';
import morgan from 'morgan';
import { createServer } from 'http';
import stoppable from 'stoppable';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import dotenv from 'dotenv';
import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

import errorHandler from './middleware/error.js';
import connectDB from './db.js';
import getIPAddr from './utils/network.js';

dotenv.config({ path: '.env' });

const {APP_NAME, NODE_ENV, TZ} = process.env;

const ipAddr = getIPAddr('IPv4');
const PORT = process.env.PORT || 3000;
const APP_URI = `${ipAddr}:${PORT}`;

// Connect to database
connectDB();

// Route files
import kubernetes from './routes/kubernetes.js';

const app = express();
const server = stoppable(createServer(app));
const ts = () => new Date().toISOString();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

morgan.token('date', () => new Date().toISOString());

app.use(morgan((tokens, req, res) => morganSettings(tokens, req, res)));
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors());

app.use((_req, res, next) => {
  res.set(generateResponseHeaders());
  next();
});

app.use('/', kubernetes);

app.use(errorHandler);

// Dynamically load route files
loadRoutes(app).catch(console.error);

app.listen(PORT, () => outputServerInfo());

// Signal handling
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (err, promise) => shutdown(null, err, promise));


function shutdown(signal, error = null, promise = null) {
  const ts = () => new Date().toISOString(); 

  if (signal) {
    console.log(`${ts()} Received ${signal}. Graceful shutdown…`);
  }

  // Handle unhandled rejection if error is provided
  if (error) {
    console.error(`Unhandled Error: ${error.message}`);
    if (promise) console.log('Promise that was rejected:', promise);
  }

  server.close((err) => {
      // Checks for error when trying to close the server.
    // An error here indicates the server did not close cleanly.
    if (err) {
      console.error(err);  // Log the error encountered during server closure
      process.exit(1);  // Exit with error status due closing server failure
    } else if (error) {
      process.exit(1);  // Shutdown was triggered by an unhandled rejection
    }

    process.exit(0); // If 0 errors occured, successful graceful shutdown
    
  });
}

function morganSettings(tokens, req, res) {
  const userEmail = req.user?.email ?? 'unauth';

  // Simple / Standard Tokens
  const tokensArr = ['date', 'method', 'url', 'status', 'referrer'];

  // Tokens requiring additional options
  const complexTokensArr = [
    { name: 'res', arg: 'content-length' },
    { name: 'response-time', suffix: 'ms' },
  ];

  // Map simple tokens to their values
  const simpleTokens = tokensArr.map(token => tokens[token](req, res));

  // Map complex tokens to their values, handling any additional arguments or suffixes
  const complexTokens = complexTokensArr.map(({ name, arg, suffix }) => 
    `${tokens[name](req, res, arg) || ''}${suffix || ''}`.trim()
  );

  // Handle the IPv4-mapped IPv6 address, removing the prefix
  const remoteAddr = tokens['remote-addr'](req, res).replace(/^::ffff:/, '');

  // Combine all tokens into a single array
  return [
   remoteAddr,
    ...simpleTokens,
    '-',
    ...complexTokens,
   `[${userEmail}]`,
  ].join(' ');
}

function generateResponseHeaders(){
  const allow = 'Authorization,Content-Type,Cache-Control,X-Requested-With';

 return {
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': allow,
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    Vary: 'Origin',
  }
}


async function loadRoutes(app) {
  const getFileExtension = (filename) => filename.split('.').pop();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const files = await readdir(path.join(__dirname, 'routes'));
  const validExtensions = ['js', 'mjs'];

  for (const file of files) {
    const ext = getFileExtension(file);
    if(validExtensions.includes(ext)) {
      const extensionLength = ext && ext.length ? Number(ext.length + 1) : 3;
      const rtName = file.slice(0, -extensionLength);
      // Async import route using filename of route for root endpoint
      const routeModule = await import(`./routes/${file}`);
      app.use(`/${rtName}`, routeModule.default);
    }
  }
}

function outputServerInfo(){
  console.log(`[${NODE_ENV}] ${APP_NAME} running on ${APP_URI}`)
  console.log(`[${NODE_ENV}]`, ts(), TZ);
}