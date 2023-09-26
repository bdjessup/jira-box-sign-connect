const axios = require("axios");

async function exchangeCodeForToken(code) {
  const tokenEndpoint = "https://api.box.com/oauth2/token";
  const clientId = "YOUR_BOX_CLIENT_ID";
  const clientSecret = "YOUR_BOX_CLIENT_SECRET";

  try {
    const response = await axios.post(tokenEndpoint, {
      grant_type: "authorization_code",
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching the token:", error);
    return null;
  }
}

module.exports = { exchangeCodeForToken };
