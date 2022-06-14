const { dbConnect } = require('../config')

/**
 * create new user with signup route
 */
const createUser = async (data) => {
  const db = await dbConnect()

  const createQuery = await db.run(
    `insert into users(username,password,user_type) values('${data.username}', '${data.password}', '${data.user_type}')`,
  )
  if (createQuery.lastID >= 1) {
    return createQuery.lastID
  } else {
    return {
      error: createQuery,
    }
  }
}

/**
 * check if the user exist in database or not
 */
const getUser = async (data) => {
  const db = await dbConnect()

  const getQuery = await db.get(
    `select user_type from users where id = '${data}'`,
  )
  if (getQuery.user_type !== undefined) {
    return getQuery.user_type
  } else {
    return {
      error: 'User not exist!',
      errorMessage: getQuery,
    }
  }
}

module.exports = { createUser, getUser }
