const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail, addNewUrl, updateUrl, addUser, comparePassword, urlsForUser } = require('./helper');

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

//========== DATABASES ==============

const urlDatabase = {
};

const users = {};


//============  Middleware to make the body data from a post request readable =========================

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//=========== ROUTES BELOW ====================

app.use(cookieSession({
  name: 'session',
  keys: ['12fasf5ywefgd']
}));

app.get('/', (req, res) => {
  res.redirect('/urls');
});

// =========== BRINGS USER TO THEIR MAIN URL HOME PAGE & LIST URL BELONGING TO THAT USER ================
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase), 
    user: users[req.session.user_id]
  };

  if (!templateVars.user){
    res.status(403).send('please log in or register');
  
  } else {
    res.render("urls_index", templateVars);
  }
});

//============= BRINGS USER TO CREATE A NEW URL PAGE ===============
  app.get("/urls/new", (req, res) => {
    let templateVars = {user: users[req.session.user_id]};
    
    if (!templateVars.user) {
      res.redirect('/login');
    
    } else {
      res.render("urls_new", templateVars);
    }
  });


  //========== BRINGS USER TO THEIR NEWLY CREATED URL PAGE & ALLOWS USER TO UPDATE THE URL =============
  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL, 
      user: users[req.session.user_id]
    };
    
    if (!templateVars.user) {
      res.status(403).send('Please Login');

    } else if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
      res.render("urls_show", templateVars);

    } else {
      res.status(403).send('You do not have access to this content');
    }
  });

  //=========== REDIRECTING USER TO THE LONGURL PAGE ===============
  app.get("/u/:shortURL", (req, res) => {
     const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  });

  // ========== REGISTRATION PAGE ============
  app.get('/register', (req, res) => {
    let templateVars = {user: users[req.session.user_id]};
      res.render("registration", templateVars);
    
  });

  //=========== CREATING NEW URL FOR THE USER ==============
  app.post('/urls', (req, res) => {
    const userID = users[req.session.user_id]['id'];
    const longURL = req.body['longURL'];
    const shortURL = addNewUrl(longURL, userID, urlDatabase);
  
    res.redirect(`urls/${shortURL}`);
  });

  //============== UPDATING THE CONTENT OF THE LONGURL IN THE URL DATABASE ========= 
  app.post('/urls/:shortURL', (req, res) => {
  
    const shortURL = req.params.shortURL;
  
    const longURL = req.body['longURL'];  
    
    if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
      updateUrl(shortURL, longURL, urlDatabase);
      res.redirect(`/urls`);
    
    } else {
      res.status(400).send('Request Denied');
    }
  });

  //========= DELETES THE URL CREATED BY THE USER ============
  app.post('/urls/:shortURL/delete', (req, res) => {
      const shortUrl =  req.params.shortURL;
      if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
         delete urlDatabase[shortUrl];
         res.redirect(`/urls`);

      } else {
        res.send('Request denied');
      }
  });

  //============ ROUTE THAT TAKES IN THE INFORMATION OF THE USER AND ADDS THEM TO THE USERSDB ==============
  app.post('/register',(req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    if (!email || !password) {
      res.status(400).send('Fields cannot be blank!');
    
    } else if (getUserByEmail(email, users)) {
      res.status(400);
      res.send('An Account with this email already exists!');
    
    } else {
      const id = addUser(email, hashedPassword, users);
      req.session.user_id = id;
      res.redirect('/urls');
      
    }
  });

  //======== DISPLAYS THE LOGIN FORM TO THE USER =================
  app.get('/login', (req, res) => {
    let templateVars = {user: users[req.session.user_id]};
      res.render('login', templateVars);
  
  });

  //========== AUTHENTICATING THE USER =================
  app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const userId = comparePassword(email, password, users);

    if (!email || !password) {
      res.status(400).send('Fields cannot be blank!');
    
    } else if (!getUserByEmail(email, users)) {
      res.status(300).send('You are not registered');
    
      } else {
        if (!userId) {
          res.status(403).send('Incorrect Password');
      
        } else {
          req.session.user_id = userId;
          res.redirect('/urls');
        }
      }
  });

  //========= LOGGING OUT THE CURRENT USER ============
  app.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/urls');
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});