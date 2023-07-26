import { UserModel, UserInterface } from "../models/user.model";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
import { CookieOptions, Request, Response } from "express";
import jwt, { Jwt, JwtPayload } from "jsonwebtoken";


class UserController {
  public async Register(req: Request, res: Response): Promise<void> {
    try {
      const { password } = req.body;
      const hash: string = bcrypt.hashSync(password, 8);
      const newUser = new UserModel({
        ...req.body,
        password: hash,
      });
      await newUser.save();
      res.status(200).send({ msg: "Register successfully", user: newUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  public async Login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user: UserInterface | null = await UserModel.findOne({ email });
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      const isPasswordValid: boolean = bcrypt.compareSync(
        password,
        user.password
      );
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid Password" });
      }
      const token: string = jwt.sign(
        {
          userId: user._id,
          name: user.name,
          email: user.email,
        },
        `${process.env.JWT_ACCESS_TOKEN_SECRET_KEY}`,
        { expiresIn: "1h" }
      );
      const refresh: string = jwt.sign(
        {
          userId: user._id,
          name: user.name,
          email: user.email,
        },
        `${process.env.JWT_REFRESH_TOKEN_SECRET_KEY}`,
        { expiresIn: "2h" }
      );

      const Token:string = 'token';
      const Refresh:string = "refresh"
      const tokenValue:string = `${token}`;
      const RefershValue:string = `${refresh}`;
      const RefreshOptions:CookieOptions = {
        httpOnly: true, // This prevents client-side JavaScript from accessing the cookie.
        expires: new Date(Date.now() + 7200000), // Cookie expiration time (1 hour from now).
        // Add any other cookie options as needed.
      };
      const tokenOptions:CookieOptions = {
        httpOnly: true, // This prevents client-side JavaScript from accessing the cookie.
        expires: new Date(Date.now() + 3600000), // Cookie expiration time (1 hour from now).
        // Add any other cookie options as needed.
      };
      // Set the cookie in the response.
      res.cookie(Token, tokenValue, tokenOptions);
      res.cookie(Refresh, RefershValue, RefreshOptions);
      res.status(200).send({ msg: "Login Successfully", token, refresh });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  public async Logout(req:Request,res:Response):Promise<void> {
     try {
      res.cookie("token", '', { maxAge: -1 });
      res.cookie("refresh", '', { maxAge: -1 });
      res.status(201).send({"msg":"Logout Succesfully"})
     } catch (error:any) {
      res.status(500).json({ error: error.message });
     }
  }
  public async  GenrateNewToken(req:Request,res:Response):Promise<void> {
    const {refresh} = req.cookies
    try {
      if(!refresh){
        console.log("HereBlacklist")
        res.status(400).send({msg:"Please login"})
    }
    jwt.verify(refresh,`${process.env.JWT_REFRESH_TOKEN_SECRET_KEY}`,(err:any,decoded:any)=>{   
      if(decoded){
    const newToken:string|JsonWebKey = jwt.sign( {userId:decoded._id,email:decoded.email,},`${ process.env.JWT_ACCESS_TOKEN_SECRET_KEY}`,{expiresIn:"1h"})
    const Token:string = 'token';
    const tokenValue:string = `${newToken}`;
    const tokenOptions:CookieOptions = {
      httpOnly: true, // This prevents client-side JavaScript from accessing the cookie.
      expires: new Date(Date.now() + 3600000), // Cookie expiration time (1 hour from now).
      // Add any other cookie options as needed.
    };
   res.cookie(Token,tokenValue,tokenOptions)
      } 
      })
      res.status(200).send({"msg":"New token has been set"})
    } catch (error:any) {
      res.status(500).json({ error: error.message });
      
    }
  }
}
export default UserController;
