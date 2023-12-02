// Create and connect to the SQLite database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./DB/twitter.db'); // Replace ':memory:' with the path to your database file

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY,
      password TEXT,
      name TEXT UNIQUE
    )`);
  
    db.run(`CREATE TABLE IF NOT EXISTS Posts (
      post_id INTEGER PRIMARY KEY,
      post_content TEXT,
      author_id INTEGER,
      FOREIGN KEY(author_id) REFERENCES Users(id)
    )`);
  
    db.run(`CREATE TABLE IF NOT EXISTS Comments (
      comment_id INTEGER PRIMARY KEY,
      comment_content TEXT,
      author_id INTEGER,
      post_id INTEGER,
      FOREIGN KEY(author_id) REFERENCES Users(id),
      FOREIGN KEY(post_id) REFERENCES Posts(post_id)
    )`);

    db.run(`INSERT INTO Users (id, password, name) VALUES (1, 'hacker', 'I_CANT_HACK')`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Attacker user added");
      }
    });
  
    db.run(`INSERT INTO Users (id, password, name) VALUES (2, 'amazon', 'AMAZON.COM')`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Amazon user added");
      }
    });

    db.run(`INSERT INTO Users (id, password, name) VALUES (3, 'john', 'John')`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("John user added");
      }
    });

    db.run(`INSERT INTO Posts (post_content, author_id) VALUES ('Hi everyone this seems like a cool platform (Twitter doesnt compare!) Hope it doesnt have any security vulnerabilities', 1)`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Post 1 added");
      }
    });

    db.run(`INSERT INTO Posts (post_content, author_id) VALUES ('ready for black friday? https://www.amazon.com/blackfriday', 2)`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Post 2 added");
      }
    });

    db.run(`INSERT INTO Comments (comment_content, author_id, post_id) VALUES ('Yes this is a very secure website for sure! I heard they are using web-assembly must be super fast', 3, 1)`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Comment 1 added");
      }
    });

    db.run(`INSERT INTO Comments (comment_content, author_id, post_id) VALUES ('Seems legit', 3, 2)`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Comment 2 added");
      }
    });
});