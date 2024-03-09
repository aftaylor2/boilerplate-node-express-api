// Uses process.env.LOGGER to dynamically load either morgan or pino
// as a logging dependency

export const createLogger = async (app, logger) => {
  const LOGGER = logger || process.env.LOGGER || undefined;

  if (LOGGER === 'pino') {
    const pino = await import('pino');
    const pinoLogger = pino.default();
    app.use((req, res, next) => {
      pinoLogger.info(req.path);
      next();
    });
    return pinoLogger;
  }
  
  if (LOGGER === 'morgan') {
    const morgan = await import('morgan');
    morgan.token('date', () => new Date().toISOString());
    app.use(morgan.default((tokens, req, res) => morganSettings(tokens, req, res)));
    return morgan;
  } 

  throw new Error('Unsupported logger');
};


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
