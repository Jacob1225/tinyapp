//============ ALL HELPER FUNCTIONS HERE =================

const bcrypt = require('bcrypt');

//Looks if an email already exists in the users database for a user
const getUserByEmail = (email, database) => {
    let users = Object.keys(database);
    
    // const user = users.find(user => user.email === email)

    // return user;

    for (let user of users) {
      if (database[user]['email'] === email) {
        return user;
      }
    }
};

//Adds a new url in the form of an object the the url database
const addNewUrl = (longURL, userID, database) => {
    const shortURL = Math.random().toString(36).substring(2, 8);

    database[shortURL] = {
      longURL, 
      userID
    };

    return shortURL;
};

//Updates the longURL in the shorURL object with the new LongURL entered by the user

const updateUrl = (shortURL, longURL, database) => {
   database[shortURL].longURL = longURL;
};

//Adds a new user to the users database with their id, email and password
const addUser = (email, password, database) => {
    const id = Math.random().toString(36).substring(2, 8);
    const newUser = {
      id: id,
      email: email,
      password: password
    };
  
    database[id] = newUser;
    return id;
  };

  //Used to validate if a password entered by the user matches the password for that user already stored in the users database
const comparePassword = (email, password, database) => {
  
  const user = getUserByEmail(email, database);
  for (let id in database) {
    if (user && bcrypt.compareSync(password, database[id]['password'])) {
      return id;
    }
  }
};

  //Function that returns all the urls that are owned by a specific user  
const urlsForUser = (id, database) => {
    let userUrls = {};
    for (urls in database) {
      if (database[urls].userID === id) {
        userUrls[urls] = database[urls].longURL
      }
    }
    return userUrls;
  };

module.exports = { 
    getUserByEmail,
    addNewUrl,
    updateUrl,
    addUser,
    comparePassword,
    urlsForUser,
 };


