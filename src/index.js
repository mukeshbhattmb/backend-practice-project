//           2nd METHOD

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config()
// dotenv.config({
//     path : "./.env"
// })

const port = process.env.PORT || 9000

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("ERROR :", error);
        throw error
    })

    app.listen(port, () => {
        console.log(`Server is running on port : ${port}`)
    })


})
.catch((err) => {
    console.log("MONGO DB connection failed !!", err);
})









//            1st METHOD

/*
import mongoose from "mongoose"
import { DB_NAME } from "./constants"
import express from "express"

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        
        app.on("error", (error) => {
            console.log("ERROR : ", error)
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR : ",error)
        throw error
    }
})

*/