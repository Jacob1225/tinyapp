const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//const shortUrl = function generateRandomString() {
    //return Math.random().toString(36).substring(2, 8);
//}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Middleware to make the body data from a post request readable for humans
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Helper Functions

const addNewUrl = longUrl => {
    
    const shortUrl = Math.random().toString(36).substring(2, 8);

    //add it to the urlDatabase

    urlDatabase[shortUrl] = longUrl;

    return shortUrl;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase};
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    res.render("urls_show", templateVars);
  });

  app.get("/u/:shortURL", (req, res) => {
     const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  });

  app.post('/urls', (req, res) => {
  
    const longUrl = req.body['longURL'];
    const shortUrl = addNewUrl(longUrl);
  
    res.redirect(`urls/${shortUrl}`);
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});