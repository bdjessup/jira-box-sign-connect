import express from 'express';
import bodyParser from 'body-parser';
import ace from 'atlassian-connect-express';
import dotenv from 'dotenv';
import Sequelize from 'sequelize';
import axios from 'axios';

dotenv.config();

import config from './config.json';
config.development.boxClientId = process.env.BOX_CLIENT_ID;
config.development.boxClientSecret = process.env.BOX_CLIENT_SECRET;
config.development.boxRedirectUri = `${process.env.NGROK_URL}/oauth-callback`;

const app = express();
const addon = ace(app);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './store.db'
});

const BoxToken = sequelize.define('BoxToken', {
  userId: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  accessToken: {
    type: Sequelize.STRING,
    allowNull: false
  },
  refreshToken: {
    type: Sequelize.STRING
  }
});

sequelize.sync();

// Middleware setup
app.use(bodyParser.json());
app.use(addon.middleware());

app.get('/startBoxAuth', (req, res) => {
  const redirectUri = encodeURIComponent(process.env.NGROK_URL + '/boxCallback');
  res.redirect(`https://account.box.com/api/oauth2/authorize?response_type=code&client_id=${process.env.BOX_CLIENT_ID}&redirect_uri=${redirectUri}`);
});

app.get('/boxCallback', async (req, res) => {
  const authCode = req.query.code;
  try {
    const response = await axios.post('https://api.box.com/oauth2/token', {
      grant_type: 'authorization_code',
      code: authCode,
      client_id: process.env.BOX_CLIENT_ID,
      client_secret: process.env.BOX_CLIENT_SECRET
    });

    const { access_token, refresh_token } = response.data;

    await BoxToken.upsert({
      userId: 'some-unique-id-for-user',
      accessToken: access_token,
      refreshToken: refresh_token
    });

    res.send('Box authentication successful!');
  } catch (error) {
    res.send('Error during Box authentication.');
  }
});

// Serve Atlassian Connect descriptor (atlassian-connect.json)
app.get('/atlassian-connect.json', (req, res) => {
  res.sendFile('atlassian-connect.json', { root: __dirname });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}`);
});
