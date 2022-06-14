const { dbConnect } = require('../config')

/**
 * update the student assignment mapping table for student submission
 * only update the table if particular student does not submitted once
 */
const insertSubmission = async (data) => {
  const db = await dbConnect()
  const checkForSubmission = await db.get(`SELECT status FROM student_assignment_mapping 
    WHERE student_id = '${data.studentId}' AND assignment_id = '${data.assignmentid}'`)

  if (checkForSubmission === undefined) return checkForSubmission

  const submiited = checkForSubmission.status
  if (submiited.toUpperCase() === 'SUBMITTED'.toUpperCase()) {
    return false
  }
  const insertSubmissionQuery = await db.run(`UPDATE student_assignment_mapping SET remark = '${data.remark}',status = 'SUBMITTED' 
     WHERE student_id = '${data.studentId}' AND assignment_id = '${data.assignmentid}'`)

  if (insertSubmissionQuery.changes == 0) {
    return {
      error: 'Unable to submit Assignemnt',
      errorMessage: insertSubmissionQuery,
    }
  } else {
    return true
  }
}

module.exports = {
  insertSubmission,
}
