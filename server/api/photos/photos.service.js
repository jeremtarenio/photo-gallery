const pool = require("../../config/database");

// service file, code that communicates with the mysql database
// all basic CRUD queries

module.exports = {
  createPhoto: (data, cb) => {
    pool.query(
      `INSERT INTO photos (url, caption) VALUES (?, ?);`,
      [data.url, data.caption],
      (err, results, fields) => {
        if (err) {
          return cb(err);
        }

        return cb(null, results);
      }
    );
  },
  getPhotos: (cb) => {
    pool.query(`SELECT * FROM photos;`, [], (err, results, fields) => {
      if (err) {
        return cb(err);
      }

      return cb(null, results);
    });
  },
  updateCaption: (data, cb) => {
    pool.query(
      `UPDATE photos SET caption = ? WHERE id = ?`,
      [data.caption, data.id],
      (error, results, fields) => {
        if (error) {
          cb(error);
        }

        return cb(null, results);
      }
    );
  },
  deletePhoto: (id, cb) => {
    pool.query(
      `DELETE FROM photos WHERE id = ?`,
      [id],
      (error, results, fields) => {
        if (error) {
          cb(error);
        }

        return cb(null, results);
      }
    );
  },
};
