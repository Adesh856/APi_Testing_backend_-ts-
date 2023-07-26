import jwt from "jsonwebtoken"
import {  Request, Response,NextFunction } from "express";
import dotenv from 'dotenv';
dotenv.config();

const auth  =async (req:Request,res:Response,next:NextFunction): Promise<void> =>{
     const token :string = req.cookies.token
     
    if(token!==""){
     jwt.verify(token,`${process.env.JWT_ACCESS_TOKEN_SECRET_KEY}`, function(err:any, decoded:any) {
        if(decoded){
            req.body.userId = decoded.userId
            req.body.name = decoded.name
            req.body.email = decoded.email
            // console.log(decoded)
            next()
        }else if(err){
      res.status(400).send({err:err.msg})

        }
      });
    }else{
      res.status(400).send({"msg":"Please Login"})
    }
}

export default auth