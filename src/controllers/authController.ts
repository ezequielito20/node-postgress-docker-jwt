import { Request, Response } from "express";

import { hashPassword, comparePassword } from "../services/password.service";
import prisma from "../models/user";
import { generateToken } from "../services/auth.service";
import { error } from "console";
import { ifError } from "assert";



export const register = async (req: Request, res: Response): Promise<void> => {

    const { email, password } = req.body;

    try {
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return
        }

        if (!password) {
            res.status(400).json({ message: "Password is required" });
            return
        };

        const hashedPassword = await hashPassword(password)
        console.log(hashedPassword);
        
        const user = await prisma.create(
            {
                data: {
                    email: email,
                    password: hashedPassword
                }
            }
        )
        const token = generateToken(user)
        res.status(201).json({ token })
    } catch (error: any) {
        console.log(error);
        if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
            res.status(400).json({ message: "Email already exists" })

        }
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if(!email){
        res.status(400).json({ message: "Email is required" });
        return
    }

    if (!password) {
        res.status(400).json({ message: "Password is required" });
        return
        
    }

    try {
        const user = await prisma.findUnique({ where: { email } })
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return
        }

        const passwordMatch = await comparePassword(password, user.password)
        if (!passwordMatch) {
            res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user)
        res.status(200).json({ token })


    } catch (error:any) {
        console.log(error);
        

    }



}