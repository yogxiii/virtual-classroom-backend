const { dbConnect } = require('../config')

/**
 * used to insert record in assignment table
 * @param {json} data = all fields of assignemnt table
 * @returns error or AssignemntId
 */
const insertRecord = async (data) => {
  const db = await dbConnect()
  const studentList = data.studentlist

  const createAssignementQuery = await db.run(`INSERT INTO assignment(description,posted_by,published_at,deadline_at,status) 
    VALUES('${data.description}','${data.posted_by}','${data.published_at}','${data.deadline_at}','${data.status}')`)

  if (createAssignementQuery.lastID >= 1) {
    for (let id in studentList) {
      const insertMappingQuery = await db.run(`INSERT INTO student_assignment_mapping(student_id,assignment_id)
            VALUES('${studentList[id]}','${createAssignementQuery.lastID}')`)
      if (insertMappingQuery.changes == 0)
        return {
          error: insertMappingQuery,
        }
    }
  }

  if (createAssignementQuery.lastID >= 1) {
    return createAssignementQuery.lastID
  } else {
    return {
      error: createAssignementQuery,
    }
  }
}

/**
 * Usedto update assignment in table with given assignemntId and TutorId
 * @param {json} data 
 * @returns error or changes in table
 */
const updateRecord = async (data) => {
  const db = await dbConnect()
  const updateAssignmentQuery = await db.run(
    `UPDATE assignment SET 
        description = CASE WHEN '${data.description}' <> '${undefined}' THEN '${data.description}' END,
        published_at = CASE WHEN '${data.published_at}' <> '${undefined}' THEN '${data.published_at}' END, 
        deadline_at = CASE WHEN '${data.deadline_at}' <> '${undefined}' THEN '${data.deadline_at}' END
        WHERE posted_by = '${data.userId}' AND id = '${data.id}'`,
  )
  return updateAssignmentQuery
}

/**
 * used to delete assignmet with given tutorId
 * @param {*} assignmentId 
 * @returns true or error
 */
const deleteRecord = async (assignmentId) => {
  const db = await dbConnect();

  const deleteAssignmentQuery = await db.run(
    `DELETE FROM assignment WHERE id = '${assignmentId}'`,
  )
  if (deleteAssignmentQuery.changes != 0) {
    return true
  } else {
    return {
      error: deleteAssignmentQuery,
    }
  }
}

/**
 * if student = get assignment details for student if submitted
 * if tutot = get assignment details which are submitted by student
 * @param {*} data 
 * @returns error or fetched record in json
 */
const getRecord = async (data) => {
  const db = await dbConnect()
  let getAssignmentDetailsQuery
  if (data.isTutor) {
    getAssignmentDetailsQuery = await db.all(
      `SELECT A.posted_by,M.student_id,M.assignment_id,M.remark FROM assignment AS A 
        JOIN student_assignment_mapping AS M
        ON A.id = M.assignment_id 
        WHERE A.posted_by = '${data.userId}' AND M.status = 'SUBMITTED'`,
    )
  } else {
    getAssignmentDetailsQuery = await db.all(
      `SELECT student_id,assignment_id,remark FROM student_assignment_mapping
            WHERE student_id = '${data.userId}' AND status = 'SUBMITTED'`,
    )
  }

  return getAssignmentDetailsQuery
}

/**
 * fetches all record for assignment posted by tutor
 * @param {json} data without any query parameter
 * @returns error or fetched data as json
 */
const assignmentFeedTutorAll = async (data) => {
  const db = await dbConnect()
  let getAssignmentDetailsQuery
  getAssignmentDetailsQuery = await db.all(
    `SELECT * FROM assignment
        WHERE posted_by = '${data.userId}'`,
  )
  return getAssignmentDetailsQuery
}

/**
 * fetches all record for assignment posted by tutor where status = publishedAt
 * @param {json} data with query parameter status
 * @returns error or fetched data as json
 */
const assignmentFeedTutor = async (data) => {
  const db = await dbConnect()
  let getAssignmentDetailsQuery
  getAssignmentDetailsQuery = await db.all(
    `SELECT * FROM assignment
        WHERE posted_by = '${data.userId}' and status = '${data.publishedAt}'`,
  )
  return getAssignmentDetailsQuery
}

/**
 * fetches all record for student assignment assign to particular student
 * @param {json} data without any query parameter
 * @returns error or fetched data as json
 */
const assignmentFeedStudentAll = async (data) => {
  const db = await dbConnect()
  let getAssignmentDetailsQuery
  getAssignmentDetailsQuery = await db.all(
    `SELECT M.student_id,A.*,M.status AS 'Submission' FROM student_assignment_mapping M JOIN
        assignment A ON M.assignment_id = A.id
        WHERE M.student_id = '${data.userId}'`,
  )
  return getAssignmentDetailsQuery
}

/**
 * fetches all record for student assignment assigned and if it is overdue
 * @param {json} data with query parameter status = overdue
 * @returns error or fetched data as json
 */
const assignmentFeedStudentOverdue = async (data) => {
  const db = await dbConnect()
  let getAssignmentDetailsQuery
  getAssignmentDetailsQuery = await db.all(
    `SELECT M.student_id,A.*,M.status AS 'Submission' FROM student_assignment_mapping M JOIN
        assignment A ON M.assignment_id = A.id
        WHERE M.student_id = '${data.userId}' and A.status = 'PENDING' AND deadline_at > DATE()`,
  )
  return getAssignmentDetailsQuery
}

/**
 * fetches all record for student assignment assigned 
 * @param {json} data with query parameter publishedAt = ONGOING OR SCHEDULED
 * @returns error or fetched data as json
 */
const assignmentFeedStudentPublishAt = async (data) => {
  const db = await dbConnect()
  let getAssignmentDetailsQuery
  getAssignmentDetailsQuery = await db.all(
    `SELECT M.student_id,A.*,M.status AS 'Submission' FROM student_assignment_mapping M JOIN
        assignment A ON M.assignment_id = A.id
        WHERE M.student_id = '${data.userId}' and A.status = '${data.publishedAt}'`,
  )
  return getAssignmentDetailsQuery
}

/**
 * fetches all record for student assignment assigned 
 * @param {json} data with query parameter status = PENDING or SUBMITTED 
 * @returns error or fetched data as json
 */
const assignmentFeedStudent = async (data) => {
  const db = await dbConnect()
  getAssignmentDetailsQuery = await db.all(
    `SELECT M.student_id,A.*,M.status AS 'Submission' FROM student_assignment_mapping M JOIN
        assignment A ON M.assignment_id = A.id
        WHERE M.student_id = ${data.userId} AND M.status = '${data.status}'`,
  )
  return getAssignmentDetailsQuery
}

module.exports = {
  insertRecord,
  getRecord,
  updateRecord,
  deleteRecord,
  assignmentFeedTutorAll,
  assignmentFeedTutor,
  assignmentFeedStudentAll,
  assignmentFeedStudentOverdue,
  assignmentFeedStudentPublishAt,
  assignmentFeedStudent,
}
