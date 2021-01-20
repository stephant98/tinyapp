const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser())

const PORT = 8080;


function generateRandomString() {
  const randomNumber = Math.random().toString(36).substring(7);
  return randomNumber;
}

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  
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
  }
}



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls')
})

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls')
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const userObject = userDatabase[req.cookies.user_id]
  const templateVars = { urls: urlDatabase , user: userObject};
  res.render("register", templateVars);
})

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;

  if(inputEmail === "" || inputPassword === "") {
    res.sendStatus(400)
  }
  
  for (const key in userDatabase) {
    
    if(userDatabase[key].email === inputEmail) {
      res.sendStatus(400)
      return;
    }
  }


    const newUser = {
      id: userID,
      email: inputEmail,
      password: inputPassword
    }
    // 
    userDatabase[userID] = newUser;

    console.log(userDatabase);
    console.log(userID)
    res.cookie("user_id", userID)
    res.redirect("/urls")


})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userObject = userDatabase[req.cookies.user_id];
  const templateVars = { urls: urlDatabase , user: userObject};
  res.render("urls_index",templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  const userObject = userDatabase[req.cookies.user_id]
  const templateVars = { urls: urlDatabase , user: userObject};
  res.render('urls_new', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const userObject = userDatabase[req.cookies.user_id]
  const templateVars = { 
    shortURL: req.params.shortURL , 
    longURL:  urlDatabase[req.params.shortURL], 
    user: userObject
  };
  res.render("urls_show", templateVars);
});

// inputOfUser matches name of input form
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.inputOfUser;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls')
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const idToDelete = req.params.shortURL;
  delete urlDatabase[idToDelete];
  res.redirect('/urls');
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});