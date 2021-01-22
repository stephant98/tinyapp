const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers')
const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const PORT = 8080;

const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

}))

app.set("view engine", "ejs");



const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user2RandomID"} ,
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"} 
  
};


const userDatabase = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  l3jggvl: {
    id: 'l3jggvl',
    email: 'stephantruchsess@gmail.com',
    password: '$2b$10$SkItsnFL98C5S09T6pVsQO.cToN4cLgZWqZx8YIiwocMwjR7PwypG'
  }
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  const userObject = userDatabase[req.session.user_id];
  const templateVars = { urls: urlDatabase , user: userObject};
  res.render('login', templateVars);
});

app.post("/login", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const user = getUserByEmail(inputEmail, userDatabase);

  if(!user || !bcrypt.compareSync(inputPassword, user.password)) {
    res.render("badCredentials");
    return;
  }

  req.session["user_id"] = user.id
  res.redirect('/urls');
  return;
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const userObject = userDatabase[req.session.user_id];
  const templateVars = { urls: urlDatabase , user: userObject};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(inputPassword, 10);

  if(inputEmail === "" || inputPassword === "") {
    res.render("badCredentials");
    return;
  }

    if(getUserByEmail(inputEmail, userDatabase)){
      res.render("emailExists")
      return;
    }
  
    const newUser = {
      id: userID,
      email: inputEmail,
      password: hashedPassword
    }
     
    userDatabase[userID] = newUser;
    req.session["user_id"] = userID;
    res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if(userDatabase[req.session.user_id]){
    const userObject = userDatabase[req.session.user_id];
    const templateVars = { urls: urlsForUser(userObject.id, urlDatabase) , user: userObject };
    res.render("urls_index",templateVars);
  } else {
    res.render("loginFirst")
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { 
    longURL: req.body.longURL,
    userID: userDatabase[req.session.user_id].id
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  if(userDatabase[req.session.user_id]) {
    const userObject = userDatabase[req.session.user_id];
    const templateVars = { urls: urlDatabase , user: userObject};
    res.render('urls_new', templateVars);
  } else {
    res.redirect("/login");
  }
  
});

app.get('/u/:shortURL', (req, res) => {
  const urlObject = urlDatabase[req.params.shortURL];
  if(!urlObject || !urlObject.longURL) {
    res.sendStatus(400);
  } else {
    res.redirect(urlObject.longURL);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userObject = userDatabase[req.session.user_id];
  if(userObject && userObject.id === urlDatabase[req.params.shortURL].userID) {
  const templateVars = { 
    shortURL: req.params.shortURL , 
    longURL:  urlDatabase[req.params.shortURL].longURL, 
    user: userObject
  };
  res.render("urls_show", templateVars);
} else if(userObject){
  res.render("notOwner");
} else {
  res.render("loginFirst");
}
});

app.post('/urls/:id', (req, res) => {
  if(req.session.user_id){
    const shortURL = req.params.id;
    const longURL = req.body.inputOfUser;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
  } else {
    res.redirect("/urls");
  }
})

app.post('/urls/:shortURL/delete', (req, res) => {
  if(req.session.user_id){
    const idToDelete = req.params.shortURL;
    delete urlDatabase[idToDelete];
    res.redirect('/urls');
  } else {
    res.redirect("/urls");
  }
  
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});