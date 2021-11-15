import express from "express";
import pg from "pg";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";

const { Pool } = pg;

const pgConfig = {
  user: "bw_unix",
  host: "localhost",
  database: "birding",
  port: 5432,
};

const pool = new Pool(pgConfig);
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(cookieParser());

// SQL query error handling
const handleError = (err, result, response) => {
  if (err) {
    console.error("Error executing error", err.stack);
    response.status(503).send(result.rows);
  } else {
    response.status(403).send("Sorry, no results to show");
  }
};

///////////////////////////////////
// Routes Functions
///////////////////////////////////
// Show Home page
const goHome = (request, response) => {
  const allQuery = `SELECT * FROM notes`;
  pool.query(allQuery, (err, result) => {
    if (err || result.rows.length === 0) {
      handleError(err, result, response);
    }
    let allNotes = result.rows;
    response.render("pages/home", { allNotes });
  });
};

// Create new note
const newNote = (request, response) => {
  response.render("pages/new_note");
};

const doNewNote = (request, response) => {
  const arr = Object.values(request.body);
  arr.push(request.cookies.userID);
  const newNoteQuery = `INSERT INTO notes (habitat, date, appearance, behavior, vocalisation, flock_size, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
  pool.query(newNoteQuery, arr, (err, result) => {
    if (err || result.rows.length === 0) {
      handleError(err, result, response);
    }
  });
  response.redirect(301, "/");
};

// Show note
const showNote = (request, response) => {
  const { idToShow } = request.params;
  const noteQuery = `SELECT * FROM notes WHERE id=${idToShow}`;
  pool.query(noteQuery, (err, result) => {
    if (err || result.rows.length === 0) {
      handleError(err, result, response);
    }
    const noteContents = result.rows[0];
    response.render("pages/full_note", { noteContents });
  });
};

// Delete note
const deleteNote = (request, response) => {
  const { idToDelete } = request.params;
  const deleteQuery = `DELETE FROM notes WHERE id=${idToDelete}`;
  pool.query(deleteQuery, (err, result) => {
    if (err) {
      handleError(err, result, response);
    }
    response.redirect(301, "/");
  });
};

// Edit note
const editNote = (request, response) => {
  const { idToEdit } = request.params;
  const editQuery = `SELECT * FROM notes WHERE id=${idToEdit}`;
  pool.query(editQuery, (err, result) => {
    if (err || result.rows.length === 0) {
      handleError(err, result, response);
    }
    const noteContents = result.rows[0];
    console.log(noteContents);
    if (noteContents.user_id == request.cookies.userID) {
      response.render("pages/edit", { noteContents });
    } else{
      response.send("You do not have editing rights!");
    }
  });
};

const doEditNote = (request, response) => {
  const arr = Object.values(request.body);
  const { idToEdit } = request.params;
  const doEditQuery = `UPDATE notes SET habitat= $1, date= $2, appearance= $3, behavior= $4, vocalisation= $5, flock_size= $6  WHERE id=${idToEdit}`;
  pool.query(doEditQuery, arr, (err, result) => {
    if (err) {
      handleError(err, result, response);
    }
    response.redirect(301, "/");
  });
};

// Create sign-up
const newSignup = (request, response) => {
  response.render("pages/signup");
};

const doNewSignup = (request, response) => {
  const arr = Object.values(request.body);
  const newSignupQuery = `INSERT INTO users (email, password) VALUES ($1, $2)`;
  pool.query(newSignupQuery, arr, (err, result) => {
    if (err) {
      handleError(err, result, response);
    }
  });
  response.redirect(301, "/");
};

// Log-in
const newLogin = (request, response) => {
  response.render("pages/login");
};

const doNewLogin = (request, response) => {
  let { input_email, input_password } = request.body;
  const doLogin = `SELECT * FROM users WHERE email =$1`;
  pool.query(doLogin, [input_email], (err, result) => {
    if (err) {
      handleError(err, result, response);
      return;
    }
    const userPass = result.rows[0].password;
    if (userPass === input_password) {
      response.cookie("loggedIn", true);
      response.cookie("userID", result.rows[0].id);
      response.redirect(301, "/");
    } else {
      response
        .status(403)
        .send("Email or password did not match, pls try again");
    }
  });
};

// Log-out
const doLogout = (request, response) => {
  response.clearCookie("loggedIn");
  response.clearCookie("userID");
  response.send("Logged out");
};

///////////////////////////////////
// Routes
///////////////////////////////////
app.get("/", goHome);

app.route("/note").get(newNote).post(doNewNote);

app.get("/note/:idToShow", showNote);
app.delete("/note/delete/:idToDelete", deleteNote);

app.route("/note/edit/:idToEdit").get(editNote).put(doEditNote);

app.route("/signup").get(newSignup).post(doNewSignup);

app.route("/login").get(newLogin).post(doNewLogin);

app.get("/logout", doLogout);

app.listen(3004);
