const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' }
};

const users = {};


//Middleware to make the body data from a post request readable for humans
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//Helper Functions below

const addNewUrl = (longURL, userID) => {
    
    const shortURL = Math.random().toString(36).substring(2, 8);

    //add it to the urlDatabase

    urlDatabase[shortURL] = {longURL: longURL, userID: userID};

    return shortURL;
};
//Updates the longURL in the shorURL object with the new LongURL entered by the user
const updateUrl = (shortURL, longURL) => {
    urlDatabase[shortURL].longURL = longURL;
};

//Adds a new user to the users database with their id, email and password
const addUser = (email, password) => {
  const id = Math.random().toString(36).substring(2, 8);
  const newUser = {
    id: id,
    email: email,
    password: password
  };

  users[id] = newUser;
  return id;
};

//Looks if an email already exists in the users database for a user
const emailLookUp = (email) => {
  let ids = Object.keys(users);

  for (let id of ids) {
    if (users[id]['email'] === email) {
      return true;
    }
  }
  return false;
};

//Used to validate if a password entered by the user matches the password for that user already stored in the users database
const comparePassword = (email, password) => {
  let ids = Object.keys(users);

  for (let id of ids) {
    if (users[id]['email'] === email && bcrypt.compareSync(password, users[id]['password']))  {
      return id;
    }
  }
  return false;
};

//Function that returns all the urls that are owned by a specific user
const urlsForUser = id => {
  let userUrls = {};
  for (urls in urlDatabase) {
    if (urlDatabase[urls].userID === id) {
      userUrls[urls] = urlDatabase[urls].longURL
    }
  }
  return userUrls;
};

//Routes below

app.use(cookieSession({
  name: 'session',
  keys: ['12fasf5ywefgd']
}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
  });

app.get('/urls', (req, res) => {
  let templateVars = {urls: urlsForUser(req.session.user_id), user: users[req.session.user_id]};

  if (!templateVars.user){
    res.send('please log in or register');
  
  } else {
    res.render("urls_index", templateVars);
  }
});

  app.get("/urls/new", (req, res) => {
    let templateVars = {user: users[req.session.user_id]};
    
    //verfiy user is logged in to access tiny url
    if (!templateVars.user) {
      res.redirect('/login');
    
    } else {
      res.render("urls_new", templateVars);
    }
  });

  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id]};
    
    if (!templateVars.user) {
      res.send('Please log in or register');
      res.redirect('/login')

    } else if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
      res.render("urls_show", templateVars);
    } else {
      res.send('You do not have access to this content');
    }
  });

  app.get("/u/:shortURL", (req, res) => {
     const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  });

  app.get('/register', (req, res) => {
    let templateVars = {user: users[req.session.user_id]};
    res.render("registration", templateVars);
  })
  app.post('/urls', (req, res) => {
    const userID = users[req.session.user_id]['id'];
    console.log(userID);
    const longURL = req.body['longURL'];
    const shortURL = addNewUrl(longURL, userID);
    console.log(longURL);
  
    res.redirect(`urls/${shortURL}`);
  });

  app.post('/urls/:shortURL', (req, res) => {
  
    const shortURL = req.params.shortURL;
  
    const longURL = req.body['longURL'];  
  
    if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
      updateUrl(shortURL, longURL);
      res.redirect(`/urls`);
    } else {
      res.send('Request Denied');
    }
  });

  app.post('/urls/:shortURL/delete', (req, res) => {
      const shortUrl =  req.params.shortURL;
      if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
         delete urlDatabase[shortUrl];
         res.redirect(`/urls`);

      } else {
        res.send('Request denied');
      }
  });

  app.post('/register',(req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    if (!email || !password) {
      res.status(400);
      res.send('Fields cannot be blank!');
    
    } else if (emailLookUp(email)) {
      res.status(400);
      res.send('An Account with this email already exists!');
    
    } else {
      const id = addUser(email, hashedPassword);
      req.session.user_id = id;
      res.redirect('/urls');
      
    }
  });

  app.get('/login', (req, res) => {
    let templateVars = {user: users[req.session.user_id]};
    res.render('login', templateVars);
  });

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
          req.session.user_id = id;
          res.redirect('/urls');

        }
      }
  });

    app.post('/logout', (req, res) => {
      req.session = null;
      res.redirect('/urls');
    });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});