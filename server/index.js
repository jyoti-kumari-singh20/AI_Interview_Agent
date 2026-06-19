import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/connectDB.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";

dotenv.config()

const app=express()
app.use(cors({
    origin:"https://ai-interview-agent1-w1nd.onrender.com",
    credentials:true
}
))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/interview",interviewRouter)

const PORT=process.env.PORT || 6000
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
    connectDB();
})