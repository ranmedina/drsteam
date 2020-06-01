require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const { init_mysql } = require('./config/connection');
const init_queries = require('./config/queries');
const import_steam_prices = require('./config/steamdata');
const passport = require('./config/passport');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const itemRouter = require('./routes/item');
const metadataRouter = require('./routes/metadata');
const { connection } = require('./config/connection');
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({}, connection);
const port = process.env.PORT || 3001;
const rateLimit = require('express-rate-limit');
const socket_init = require('./config/socket');

console.log(`» Starting SteamInventory server on port ${port}...`);

Promise.resolve()
  .then(() => init_mysql())
  .then(() => init_queries());
// .then(() =>
//   import_steam_prices({
//     items: false,
//     apps: true,
//   })
// );
// Uncomment for the server to update prices on startup

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());
app.use(
  session({
    key: 'ssid',
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      originalMaxAge: 1000 * 60 * 5,
      maxAge: 1000 * 60 * 60 * 24,
      secure: false,
      path: '/',
      sameSite: 'none',
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({
  windowMs: 1000 * 20,
  max: 50,
});
app.use(limiter);

app.use('/auth', authRouter);
app.use('/metadata', metadataRouter);
app.use('/user', userRouter);
app.use('/item', itemRouter);

const DIST_DIR = path.join(__dirname, '../client/dist');
app.use(express.static(__dirname + '/'));
app.use(express.static(DIST_DIR));

app.get('*', function (_req, res) {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

const server = app.listen(port, () => console.log(`» Server is running!`));
socket_init(server);

module.exports = app;
