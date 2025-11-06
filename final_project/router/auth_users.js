const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.body.username;

  console.log("Inside put method");
  console.log(username);
  
  if(!username){
    return res.status(401).json({message: "You must be logged in to post a review."});  
  }

  if(!review){
    return res.status(401).json({message: "Review text is required."});  
  }

  if(!books[isbn]){
    return res.status(404).json({message: `Book with ISBN ${isbn} not found.` });  
  }

  const isNew = !books[isbn].reviews[username];
  books[isbn].reviews[username] = review;

  return res.status(200).json({message: isNew? "Review successfully added." : "Review successfully updated.",
                               book: books[isbn] });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.body.username;
  
    console.log("Inside delete method");
    console.log(username);
    
    if(!username){
      return res.status(401).json({message: "You must be logged in to delete a review."});  
    }
    
    if(!books[isbn]){
      return res.status(404).json({message: `Book with ISBN ${isbn} not found.` });  
    }
  
    if(books[isbn].reviews[username]){
        console.log("Review for user " +username+" delete!");
        delete books[isbn].reviews[username];
    }
    
  
    return res.status(200).json({message: "Review successfully deleted for user."+username,
                                book: books[isbn]});
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
