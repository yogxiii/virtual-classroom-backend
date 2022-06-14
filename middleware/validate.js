const jwt = require('jsonwebtoken')
const { jwtSecret, dbConnect } = require('../config')

/**
 * Used to verify token is correct or not
 * @param {*} token 
 * @returns user data from token if correct else -1
 */
const verifyJwt = (token) => {
  try {
    const userData = jwt.verify(token, jwtSecret)
    return userData
  } catch (e) {
    return -1
  }
}

/**
 * middleware to verify api call
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const validateUser = (req, res, next) => {
  const data = verifyJwt(req.headers.user)
  if (data == -1) {
    res.status(401).json({
      error: 'Invalid User Token! SignIn again to get new token!',
    })
  } else {
    req.header.user = data
    next()
  }
}

/**
 * sign jwt token with user data
 * @param {user object} contain username, type of user, user id 
 * @returns signed jwt token
 */
const signUser = ({ username, user_type, user_id }) => {
  const token = jwt.sign({ username, user_type, user_id }, jwtSecret)
  return token
}

/**
 * verify if user exist in database or not to provide validation while login
 * @param {*} username 
 * @returns false if not exist else userobject
 */
const isUserExists = async (username) => {
  const db = await dbConnect()
  let res = await db.get(`select * from users where username = '${username}'`)
  if (res === undefined) {
    return false
  }
  return { id: res.id, user_type: res.user_type }
}

module.exports = {
  validateUser,
  isUserExists,
  signUser,
}
