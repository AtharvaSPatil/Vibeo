import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path: './.env'
})

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`The server is live on port: ${process.env.PORT}`)
    })
}).catch((err) => {
    console.log("MongoDB connect fail", err)
})