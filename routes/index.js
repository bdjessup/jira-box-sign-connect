const { exchangeCodeForToken } = require("./utils");

// eslint-disable-next-line no-unused-vars
export default function routes(app, addon) {
  // Redirect root path to /atlassian-connect.json,
  // which will be served by atlassian-connect-express.
  app.get("/", (req, res) => {
    res.redirect("/atlassian-connect.json");
  });

  app.get("/login", (req, res) => {
    res.render("login-with-box");
  });

  app.get("/start-auth", (req, res) => {
    const clientId = process.env.BOX_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      "http://localhost:3000/oauth-callback"
    );
    const responseType = "code";
    const boxAuthUrl = `https://account.box.com/api/oauth2/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}`;
    res.redirect(boxAuthUrl);
  });

  app.get("/oauth-callback", async (req, res) => {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send("No code provided");
    }

    // Exchange the code for an access token
    const token = await exchangeCodeForToken(code);
    if (!token) {
      return res.status(400).send("Error fetching the token");
    }

    // You should securely store this token for future API calls.
    // In a real-world scenario, you might use a database or secure session storage.

    res.send("Successfully authenticated!"); // Redirect or handle as desired
  });
}
