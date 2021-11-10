import express from "express";
import pg from "pg";
import methodOverride from "method-override";

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

// Show Home page
const goHome = (request, response) => {
  const allQuery = `SELECT * FROM notes`;
  pool.query(allQuery, (allQueryErr, allQueryResult) => {
    if (allQueryErr) {
      console.error("Error", allQueryErr);
      return;
    }
    let allNotes = allQueryResult.rows;
    response.render("pages/home", { allNotes });
  });
};

// Create new note
const newNote = (request, response) => {
  response.render("pages/new_note");
};

const doNewNote = (request, response) => {
  const newNote = request.body;
  const newNoteQuery = `INSERT INTO notes (habitat, date, appearance, behavior, vocalisation, flock_size) VALUES ('${newNote.habitat}', '${newNote.date}', '${newNote.appearance}', '${newNote.behavior}', '${newNote.vocalisation}', '${newNote.flock_size}')`;
  pool.query(newNoteQuery);
  response.redirect(301, "/");
};

// Show note
const showNote = (request, response) => {
  const { idToShow } = request.params;
  const noteQuery = `SELECT * FROM notes WHERE id=${idToShow}`;
  pool.query(noteQuery, (noteQueryErr, noteQueryResult) => {
    if (noteQueryErr) {
      console.error("Error", noteQueryErr);
      return;
    }
    const noteContents = noteQueryResult.rows[0];
    response.render("pages/full_note", { noteContents });
  });
};

// Delete note
const deleteNote = (request, response) => {
  const { idToDelete } = request.params;
  const deleteQuery = `DELETE FROM notes WHERE id=${idToDelete}`;
  pool.query(deleteQuery, (deleteQueryErr, deleteQueryResult) => {
    if (deleteQueryErr) {
      console.error("Error", deleteQueryErr);
      return;
    }
    response.redirect(301, "/");
  });
};

// Edit note
const editNote = (request, response) => {
  const { idToEdit } = request.params;
  const editQuery = `SELECT * FROM notes WHERE id=${idToEdit}`;
  pool.query(editQuery, (editQueryErr, editQueryResult) => {
    if (editQueryErr) {
      console.error("Error", editQueryErr);
      return;
    }
    const noteContents = editQueryResult.rows[0];
    response.render("pages/edit", { noteContents });
  });
};

const doEditNote = (request, response) => {
  const editedNote = request.body;
  const { idToEdit } = request.params;
  console.log(editedNote)
  const doEditQuery = `UPDATE notes SET habitat= '${editedNote.habitat}', date= '${editedNote.date}', appearance= '${editedNote.appearance}', behavior= '${editedNote.behavior}', vocalisation= '${editedNote.vocalisation}', flock_size= '${editedNote.flock_size}'  WHERE id=${idToEdit}`;
  pool.query(doEditQuery, (doEditQueryErr, doEditQueryResult) => {
    if (doEditQueryErr) {
      console.error("Error", doEditQueryErr);
      return;
    }
    response.redirect(301, '/')
  });
};

app.get("/note", newNote);
app.post("/note", doNewNote);
app.get("/note/:idToShow", showNote);
app.get("/", goHome);
app.delete("/note/delete/:idToDelete", deleteNote);
app.get("/note/edit/:idToEdit", editNote);
app.put("/note/edit/:idToEdit", doEditNote);

app.listen(3004);
