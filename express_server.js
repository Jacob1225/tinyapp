const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
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

const addNewUrl = longURL => {
    
    const shortUrl = Math.random().toString(36).substring(2, 8);

    //add it to the urlDatabase

    urlDatabase[shortURL] = longURL;

    return shortURL;
};

const updateUrl = function (shortURL, longURL) {
    urlDatabase[shortURL] = longURL;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/urls", (req, res) => {
    let username = req.cookies.username;
    let templateVars = { urls: urlDatabase, username: username};
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    let templateVars = { username: req.cookies.username};
    res.render("urls_new", templateVars);
  });

  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.username};
    res.render("urls_show", templateVars);
  });

  app.get("/u/:shortURL", (req, res) => {
     const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  });

  app.get('/register', (req, res) => {
    res.render("registration");
  })
  app.post('/urls', (req, res) => {
  
    const longURL = req.body['longURL'];
    const shortURL = addNewUrl(longURL);
  
    res.redirect(`urls/${shortUrl}`);
  });

  app.post('/urls/:shortURL', (req, res) => {
  
    const shortURL = req.params.shortURL;
  
    const longURL = req.body['longURL'];  
  
    updateUrl(shortURL, longURL);
  
    res.redirect(`/urls`);
  
  });

  app.post('/urls/:shortURL/delete', (req, res) => {
      const shortUrl =  req.params.shortURL;
      delete urlDatabase[shortUrl];

      res.redirect(`/urls`);
  });

 
  app.post('/login', (req, res) => {
    const username = req.body['username'];
    res.cookie('username', username);

    res.redirect('/urls');
    });

    app.post('/logout', (req, res) => {
      const username = req.body['username'];
      res.clearCookie('username');

      res.redirect('/urls');
    });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});