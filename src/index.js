import dotenv from "dotenv"
import  {connectDB}  from "../src/db/config.js";
import { app } from "./app.js";

 dotenv.config({
    path:"./env"
 })
   
   connectDB()
   .then(()=> {
     app.listen(process.env.PORT||8000 , ()=> {
        console.log(`app is listening on port ${process.env.PORT}`);
     })
   })
   .catch((error)=> {
     console.log("mongodb connection failed",error);
   })     
    




