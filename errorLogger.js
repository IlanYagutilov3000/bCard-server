const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

// Create the logs folder if it doesn't exist
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format for errors with status code 400+
const errorLogFormat = ':date[iso] :method :url :status :error-message';

// Custom morgan token to capture error messages (for 400+ errors)
morgan.token('error-message', (req, res) => {
    if (res.statusCode >= 400) {
        return res.statusMessage || "Error occurred";
    }
    return "-"; // Default if no error
});

// Create a writable stream for the log file
const logFileName = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
const logStream = fs.createWriteStream(logFileName, { flags: 'a' });

// Create the errorLogger that writes to the file stream
const errorLogger = morgan(errorLogFormat, {
    stream: logStream,
    skip: (req, res) => res.statusCode < 400
});

module.exports = errorLogger;