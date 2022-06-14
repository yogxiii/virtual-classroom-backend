const express = require('express')
const { insertSubmission } = require('../models/submissionModel')
const { getUser } = require('../models/user')

const route = express.Router()

/**
 * create submission for student
 * and update the status to submitted with remarks if provide 
 * in payload
 */
const createSubmission = async (req, res) => {
  const userType = await getUser(req.header.user.user_id)
  if (userType.toUpperCase() !== 'student'.toUpperCase()) {
    return res.status(403).json({
      data: 'Only Student can make submission',
    })
  }
  const studentId = req.header.user.user_id
  const submission = { ...req.body, studentId }
  const submitted = await insertSubmission(submission)
  if (submitted === undefined) {
    return res.status(500).json({
      data: 'Invalid Assignment Id',
    })
  }
  if (submitted) {
    return res.status(200).json({
      data: 'Assignment Submitted Successfully',
    })
  } else {
    if (!submitted) {
      return res.status(500).json({
        data: 'You can only submit it once',
      })
    }
    return res.status(500).json({
      data: submitted,
    })
  }
}

route.post('/', createSubmission)

module.exports = route
