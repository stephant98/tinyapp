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
  }
}



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  const userObject = userDatabase[req.cookies.user_id]
  const templateVars = { urls: urlDatabase , user: userObject};
  res.render('login', templateVars);
})

app.post("/login", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;

  for (const key in userDatabase) {
    
    if(userDatabase[key].email === inputEmail && userDatabase[key].password === inputPassword) {
      res.cookie('user_id', key)
      res.redirect('/urls')
      return;
    }
  }
  res.sendStatus(403)
  
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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




const urlsForUser = function(id) {
  let newObj = {};
  
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      newObj[key] = urlDatabase[key].longURL 
    }
  }
  return newObj;
}





app.get("/urls", (req, res) => {
  if(userDatabase[req.cookies.user_id]){
    const userObject = userDatabase[req.cookies.user_id];
    const templateVars = { urls: urlsForUser(userObject.id) , user: userObject };
    res.render("urls_index",templateVars);
  } else {
    res.send("Login first")
  }
  
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  if(userDatabase[req.cookies.user_id]) {
    const userObject = userDatabase[req.cookies.user_id]
    const templateVars = { urls: urlDatabase , user: userObject};
    res.render('urls_new', templateVars);
  } else {
    res.redirect("/login")
  }
  
});

app.get('/u/:shortURL', (req, res) => {
  const urlObject = urlDatabase[req.params.shortURL];
  if(!urlObject || !urlObject.longURL) {
    res.sendStatus(400)
  } else {
    res.redirect(urlObject.longURL);
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const userObject = userDatabase[req.cookies.user_id]
  const templateVars = { 
    shortURL: req.params.shortURL , 
    longURL:  urlDatabase[req.params.shortURL].longURL, 
    user: userObject
  };
  res.render("urls_show", templateVars);
});

// inputOfUser matches name of input form
app.post('/urls/:id', (req, res) => {
  if(req.cookies.user_id){
    const shortURL = req.params.id;
    const longURL = req.body.inputOfUser;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls')
  } else {
    res.redirect("/urls")
  }
})

app.post('/urls/:shortURL/delete', (req, res) => {
  if(req.cookies.user_id){
    const idToDelete = req.params.shortURL;
    delete urlDatabase[idToDelete];
    res.redirect('/urls');
  } else {
    res.redirect("/urls")
  }
  
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});