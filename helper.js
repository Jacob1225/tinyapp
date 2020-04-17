//============ ALL HELPER FUNCTIONS HERE =================

//Looks if an email already exists in the users database for a user
const getUserByEmail = (email, database) => {
    let users = Object.keys(database);
    
    for (let user of users) {
      if (database[id]['email'] === email) {
        return user ;
      }
    }
    return false;
    };

module.exports = getUserByEmail;


