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

app.get("/", (request, response) => {
  console.log("request came in");
  const whenDoneWithQuery = (error, result) => {
    if (error) {
      console.log("Error executing query", error.stack);
      response.status(503).send(result.rows);
      return;
    }
    console.log(result.rows[0].name);
    response.send(result.rows);
  };
  // Query using pg.Pool instead of pg.Client
  pool.query("SELECT * from cats", whenDoneWithQuery);
});
app.listen(3004);
