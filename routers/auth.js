const express = require('express')
const { isUserExists, signUser } = require('../middleware/validate')
const { createUser } = require('../models/user')

const route = express.Router()

/**
 * creates a new user, in case the user already exist
 * return staus code 400
 */
const signUp = async (req, res) => {
  const userCheck = await isUserExists(req.body.username)
  if (userCheck) {
    res.status(400).json({
      error: 'User Already exist! Try signIn.!',
    })
  } else {
    const user = await createUser(req.body)
    if (user.error !== undefined) {
      res.status(500).json({
        error: 'Unable to create new user!',
        errorMessage: user.error,
      })
    } else {
      res.status(200).json({
        data: 'User Created successfully!',
        token: signUser({
          username: req.body.username,
          user_type: req.body.user_type,
          user_id: user,
        }),
      })
    }
  }
}

/**
 * log in user, in case the user not exist
 * return staus code 400
 */
const signIn = async (req, res) => {
  const userCheck = await isUserExists(req.body.username)

  if (userCheck !== false) {
    res.status(200).json({
      data: 'User SignedIn successfully!',
      token: signUser({
        username: req.body.username,
        user_id: userCheck.id,
        user_type: userCheck.user_type,
      }),
    })
  } else {
    res.status(404).json({
      error: 'User Do not exist! Try signUp.!',
    })
  }
}

route.post('/signup', signUp)
route.post('/signin', signIn)

module.exports = route
