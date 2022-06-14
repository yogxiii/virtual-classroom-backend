const express = require('express')
const { validateUser } = require('./middleware/validate')
const authRouter = require('./routers/auth')
const assignmentRouter = require('./routers/assignment')
const submissionRouter = require('./routers/submission')

const app = express()
const port = 3000

app.use(express.json())

app.use('/auth', authRouter)

app.use(validateUser)
app.use('/assignment', assignmentRouter)
app.use('/submission', submissionRouter)

app.listen(port, console.log('Server is listening on port 3000'))
