SPATIA — Java + MySQL edition
================================

IMPORTANT: The SPATIA interface and its existing modules are retained. The old
browser localStorage persistence has been replaced with calls to a Java server.
Java uses JDBC to store/retrieve the interface state in MySQL's app_data table.

REQUIREMENTS
1. JDK 17 or newer
2. MySQL Server running locally
3. MySQL Connector/J JAR (mysql-connector-j-*.jar)

ONE-TIME SETUP
1. Open MySQL Workbench or the MySQL command line.
2. Run the complete spatia.sql file.
3. Open SpatiaServer.java and replace YOUR_PASSWORD with your MySQL root password.
4. Download MySQL Connector/J from the official MySQL Connector/J download page.
   Put the JAR in this same project folder.

RUN ON WINDOWS (Command Prompt, in this folder)
1. Compile (replace the JAR name with the one you downloaded):
   javac -cp ".;mysql-connector-j-9.5.0.jar" SpatiaServer.java
2. Start the server:
   java -cp ".;mysql-connector-j-9.5.0.jar" SpatiaServer
3. Open this URL in Chrome:
   http://localhost:8080

Do NOT open final spatia.html by double-clicking it. Open it through
http://localhost:8080 so that its Java/MySQL API calls work.
Keep the Java server terminal open while using the app.

WHAT USES JAVA AND MYSQL?
- Java: HTTP server, API requests, JDBC connection, prepared SQL statements,
  GET/PUT/DELETE handling and error reporting.
- MySQL: app_data table permanently stores state used by the existing interface.
- HTML/CSS/JavaScript: retained front end and its existing SPATIA screens.

DATA DESIGN NOTE
To preserve the existing app without redesigning its screens and workflows, the
current front end's state objects (spaces, bookings, issues, timetable, profile,
branding and role) are stored as JSON text by key in app_data. This is real MySQL
persistence through Java/JDBC, but it is a compatibility-oriented design rather
than a normalized one-row-per-booking schema. For a production system, normalize
bookings, spaces and maintenance into separate relational tables.

TROUBLESHOOTING
- Access denied: check DB_USER/DB_PASSWORD in SpatiaServer.java.
- Driver not found: ensure the Connector/J JAR filename in the -cp command is exact.
- Port 8080 busy: close the other process or change PORT in SpatiaServer.java.
- Java server errors appear in the terminal; check MySQL is running and spatia.sql ran.
