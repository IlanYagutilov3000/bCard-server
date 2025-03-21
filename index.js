const express = require("express")
require("dotenv").config()
const mongoose = require("mongoose")
const morgan = require("morgan")
const errorLogger = require("./errorLogger")
const cors = require("cors")
const users = require("./routes/users")
const cards = require("./routes/cards")
const seedDataBase = require("./seeder")

const app = express()
const port = process.env.PORT || 5000;

// changed to morgan but do I need to change the time zone to Israel?? maybe even place it in diffrenet model and import it to the main index
const logger = morgan(':method :url :status :res[content-lenght] - :response-time ms :date[web]')

mongoose.connect(process.env.DB).then(async () => {
    console.log("Connetcted to MongoDB server");
    await seedDataBase()
}).catch((error) => {
    console.log(error);
});

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(errorLogger);
app.use("/users", users)
app.use("/cards", cards)

app.listen(port, () => console.log("Server is running on port", port));