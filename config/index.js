const sqlite3 = require('sqlite3').verbose()
const { open } = require('sqlite')

/**
 * sqlite3 library is synchronous, to use asynchronous call
 * used sqlite wrapper, creates initial schema in first api call
 * @returns database connection instance
 */
const dbConnect = async () => {
  const db = await open({
    filename: './Classroom.db',
    driver: sqlite3.Database,
  })

  await db.run(
    `CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    user_type varchar(10) NOT NULL)`,
    (err) => {
      if (err) {
        console.log(err)
      }
    },
  )
  await db.run(
    `
          create table if not exists assignment(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            posted_by integer NOT NULL,
            published_at DATE NOT NULL,
            deadline_at DATE NOT NULL,
            status TEXT NOT NULL
          )`,
    (err) => {
      if (err) {
        console.log(err)
      }
    },
  )
  await db.run(
    `
          create table if not exists student_assignment_mapping(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            assignment_id INTEGER NOT NULL,
            status TEXT DEFAULT 'PENDING',
            remark TEXT,
            FOREIGN KEY(assignment_id) REFERENCES assignment(id)
          )`,
    (err) => {
      if (err) {
        console.log(err)
      }
    },
  )

  return db
}

//  Old synchronous sqlite3 api call

// const con = new sqlite3.Database('Toddle.db',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
//   if(err){
//       console.error(err);
//   }else{
//       console.log('Server is ready to store records');
//   }
// });

// con.serialize(() => {
//   con.run(`CREATE TABLE IF NOT EXISTS users(
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     username TEXT,
//     password TEXT,
//     user_type varchar(10))`, err => {
//               if(err) {
//                   console.log(err);
//               }
//           });
//   con.run(`
//           create table if not exists assignment(
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             description text,
//             posted_by integer,
//             published_at date,
//             deadline_at date
//           )`, err => {
//       if(err) {
//           console.log(err);
//       }
//   });
//   con.run(`
//           create table if not exists map_student_assignment(
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             fk_student_id integer,
//             fk_assignment_id integer,
//             status text
//           )`, err => {
//       if(err) {
//           console.log(err);
//       }
//   });
// });

/**
 * kept jwtSecret in config file
 * It can be held in .env file for simplicity used here
 */
module.exports = {
  jwtSecret: '1234567890',
  dbConnect,
}
