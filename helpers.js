function generateRandomString() {
  const randomNumber = Math.random().toString(36).substring(7);
  return randomNumber;
};


const getUserByEmail = function(email, database) {
  let user;
  for(const key in database) {
    if(database[key].email === email){
      user = database[key]
    }
  }
  return user
};


const urlsForUser = function(id, urlDatabase) {
  let newObj = {};
  
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      newObj[key] = urlDatabase[key].longURL 
    }
  }
  return newObj;
}


module.exports = { generateRandomString, getUserByEmail, urlsForUser }





