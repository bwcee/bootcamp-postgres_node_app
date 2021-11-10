import pg from "pg";

const { Client } = pg;

const config = {
  user: "bw_unix",
  host: "localhost",
  database: "bw_unix",
  port: 5432,
};

const client = new Client(config);

client.connect();

const whenQueryDone = (err, result) => {
  if (err) {
    console.log("error", err);
  } else {
    console.log(result.rows);
  }
  client.end();
};

const entry = [
  process.argv[3],
  process.argv[4],
  process.argv[5],
  process.argv[6],
];

const sqlQuery = `INSERT INTO meals (type, description, amount_of_alcohol, was_hungry_before_eating) VALUES ('${entry[0]}', '${entry[1]}', ${entry[2]}, ${entry[3]})`;

const sqlReport = `SELECT * FROM meals`;

const functionality = process.argv[2];
if (functionality === "log") {
  client.query(sqlQuery, whenQueryDone);
} else {
  client.query(sqlReport, whenQueryDone);
}
