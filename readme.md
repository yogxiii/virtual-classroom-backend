### Setup
 cd CLASSROOM
 npm install
 npm start
 ```
 
### Libraries Used
```sh
express - minimal web framework,
jsonwebtoken - used to implement JWT auth,
sqlite3 - database driver,
sqlite - database driver
```

### Project Structure
```sh
/middleware - contains middleware for auth and centralized validation.
/config - a wrapper over database connection and other intial configs.
/routes - routing configuration with their respective handlers for the application.
/models - directory for models use by router.
index.js - main startup file
```