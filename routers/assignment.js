const express = require('express')
const {
  insertRecord,
  getRecord,
  deleteRecord,
  assignmentFeedTutorAll,
  assignmentFeedTutor,
  assignmentFeedStudentAll,
  assignmentFeedStudentOverdue,
  assignmentFeedStudentPublishAt,
  assignmentFeedStudent,
  updateRecord,
} = require('../models/assignmentModel')
const { getUser } = require('../models/user')
const route = express.Router()

/**
 * check if the usertyoe and permission level
 * validate data in json payload
 * update the status of assignmet in payload
 * create the assignment
 */
const createAssignment = async (req, res) => {
  //check for type of user
  const userType = await getUser(req.header.user.user_id)
  if (userType.toUpperCase() === 'student'.toUpperCase()) {
    res.status(403).json({
      data: 'You do not have access to open this module',
    })
  } else {
    // Validating Date - YYYY-MM-DD
    const dateFormat = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/
    const { published_at, deadline_at } = req.body
    if (!published_at.match(dateFormat) || !deadline_at.match(dateFormat)) {
      res.status(400).json({
        error: 'Invalid Date Format or Date, Please follow YYYY-MM-DD',
      })
    } else {
      //Logic for status of assignment
      const currentDate = new Date().getTime()
      const publishDate = new Date(published_at).getTime()
      let status
      if (publishDate > currentDate) status = 'Scheduled'
      else status = 'Ongoing'
      const posted_by = req.header.user.user_id
      const assignmentData = { ...req.body, status, posted_by }
      const assignment = await insertRecord(assignmentData)
      if (assignment.error !== undefined) {
        res.status(500).json({
          error: 'Unable to create assignment',
          errorMessage: assignment.error,
        })
      } else {
        res.status(200).json({
          data: `Assignment created Successfully!! With ID = ${assignment}`,
        })
      }
    }
  }
}

/**
 * update the assignment - only for tutor
 */
const updateAssignment = async (req, res) => {
  const userId = req.header.user.user_id
  const requestPayload = { ...req.body, userId }
  const updatedAssignment = await updateRecord(requestPayload)

  if (updatedAssignment === undefined) {
    return res.status(500).json({
      error: 'Invalid Request or Record not exist',
    })
  } else {
    return res.status(200).json({
      data: 'Updated Successfully',
    })
  }
}

/**
 * Delete the assignment - only for tutor
 */
const deleteAssignment = async (req, res) => {
  //check for type of user
  const userType = await getUser(req.header.user.user_id)
  if (userType.toUpperCase() === 'student'.toUpperCase()) {
    res.status(403).json({
      data: 'You do not have access to open this module',
    })
  } else {
    // deleteing assignment
    const assignment = await deleteRecord(req.body.assignmentid)
    if (assignment == true) {
      res.status(200).json({
        data: 'Deleted Successfully',
      })
    } else {
      res.status(500).json({
        error: 'Unable to delete assignment! Provided Id do not exist',
        errorMessage: assignment.error,
      })
    }
  }
}

/**
 * get all details of assignment according to usertype if it is submitted
 */
const getAssignment = async (req, res) => {
  let isTutor = false
  const userType = await getUser(req.header.user.user_id)
  if (userType.toUpperCase() === 'tutor'.toUpperCase()) isTutor = true
  const userId = req.header.user.user_id
  const assignmentDetails = await getRecord({ userId, isTutor })
  if (assignmentDetails === undefined) {
    res.status(500).json({
      data: 'Invalid Request or No data present',
    })
  } else {
    res.status(500).json({
      data: 'Success',
      assignmentDetails,
    })
  }
}

/**
 * get all details of assignment according to the query parameter provided
 */
const getAssignmentFeed = async (req, res) => {
  let isTutor = false
  const userType = await getUser(req.header.user.user_id)
  if (userType.toUpperCase() === 'tutor'.toUpperCase()) isTutor = true
  const userId = req.header.user.user_id
  const { publishedAt, status } = req.query

  let assignmentFeeddata
  if (isTutor) {
    if (publishedAt === undefined)
      assignmentFeeddata = await assignmentFeedTutorAll({ userId })
    else assignmentFeeddata = await assignmentFeedTutor({ userId, publishedAt })
  } else {
    if (publishedAt)
      assignmentFeeddata = await assignmentFeedStudentPublishAt({
        userId,
        publishedAt,
      })
    else if (status === 'PENDING' || status === 'SUBMITTED')
      assignmentFeeddata = await assignmentFeedStudent({ userId, status })
    else if (status === 'OVERDUE')
      assignmentFeeddata = await assignmentFeedStudentOverdue({ userId })
    else assignmentFeeddata = await assignmentFeedStudentAll({ userId })
  }

  if (assignmentFeeddata === undefined) {
    return res.status(500).json({
      data: 'Invalid Request or No data present',
    })
  } else {
    res.status(200).json({
      data: 'Success',
      assignmentFeeddata,
    })
  }
}

route.post('/create', createAssignment)
route.put('/update', updateAssignment)
route.delete('/delete', deleteAssignment)
route.get('/get', getAssignment)
route.get('/get/query', getAssignmentFeed)

module.exports = route
