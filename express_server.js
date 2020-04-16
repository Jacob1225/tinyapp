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

const users = {};



//Middleware to make the body data from a post request readable for humans
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Helper Functions

const addNewUrl = longURL => {
    
    const shortURL = Math.random().toString(36).substring(2, 8);

    //add it to the urlDatabase

    urlDatabase[shortURL] = longURL;

    return shortURL;
};

const updateUrl = function (shortURL, longURL) {
    urlDatabase[shortURL] = longURL;
};

const addUser = function (email, password) {
  const id = Math.random().toString(36).substring(2, 8);
  const newUser = {
    id: id,
    email: email,
    password: password
  };

  users[id] = newUser;
  return id;
};

const emailLookUp = function (email) {
  let ids = Object.keys(users);

  for (let id of ids) {
    if (users[id]['email'] === email) {
      return true;
    }
  }
  return false;
};

const comparePassword = function (email, password) {
  let ids = Object.keys(users);

  for (let id of ids) {
    if (users[id]['email'] === email && users[id]['password'] === password) {
      return id;
    }
  }
  return false;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/urls", (req, res) => {

    let templateVars = {urls: urlDatabase, user: users[req.cookies.user_id]};
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    let templateVars = {user: users[req.cookies.user_id]};
    
    //verfiy user is logged in to access tiny url
    if (!templateVars.user) {
      res.redirect('/login');
    
    } else {
      res.render("urls_new", templateVars);
    }
  });

  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id]};
    res.render("urls_show", templateVars);
  });

  app.get("/u/:shortURL", (req, res) => {
     const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  });

  app.get('/register', (req, res) => {
    let templateVars = {user: users[req.cookies.user_id]};
    res.render("registration", templateVars);
  })
  app.post('/urls', (req, res) => {
  
    const longURL = req.body['longURL'];
    const shortURL = addNewUrl(longURL);
  
    res.redirect(`urls/${shortURL}`);
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

  app.post('/register',(req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    if (!email || !password) {
      res.status(400);
      res.send('Fields cannot be blank!');
    
    } else if (emailLookUp(email)) {
      res.status(400);
      res.send('An Account with this email already exists!');
    
    } else {
      const id = addUser(email, password);
      
      res.cookie('user_id', id);
      res.redirect('/urls');
      
    }
  });

  app.get('/login', (req, res) => {
    let templateVars = {user: users[req.cookies.user_id]};
    res.render('login', templateVars);
  })

  app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      res.status(400);
      res.send('Fields cannot be blank!');
    
    } else if (!emailLookUp(email)) {
      res.status(403);
      res.send('You are not registered');
    
      } else {
        if (!comparePassword(email, password)) {
          res.status(403);
          res.send('Incorrect Password');
      
        } else {
          const id = comparePassword(email, password);
          res.cookie('user_id', id);
          res.redirect('/urls');

        }
      }
  });

    app.post('/logout', (req, res) => {
      res.clearCookie('user_id');
      res.redirect('/urls');
    });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});