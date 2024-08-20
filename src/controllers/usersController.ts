import { Request, Response } from "express";
import { hashPassword } from '../services/password.service';
import prisma from "../models/user"


export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return
        }

        if (!password) {
            res.status(400).json({ message: "Password is required" });
            return

        }

        const hashedPassword = await hashPassword(password)

        const user = await prisma.create({
            data: {
                email,
                password: hashedPassword
            }
        })
        res.status(201).json(user)

    } catch (error: any) {
        console.log(error);
        if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
            res.status(400).json({ message: "Email already exists" })

        }
        res.status(500).json({ message: "Internal Server Error" });

    }
}

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.findMany()
        res.status(200).json(users)

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });

    }
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {

    const id = parseInt(req.params.id)

    try {

        const user = await prisma.findUnique({ where: { id } })

        if (!user) {
            res.status(404).json({ message: "User not found" })
            return
        }
        res.status(200).json(user)

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });

    }
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id)
    const { email, password } = req.body
    try {
        let dataToUpdate: any = {...req.body}
        if (password) {
            const hashedPassword = await hashPassword(password)
            dataToUpdate.password = hashedPassword
        }
        if (email) {
            dataToUpdate.email = email
        }
        const user = await prisma.update({ where: { id } , data: dataToUpdate})
        res.status(200).json(user)
        



        
    } catch (error:any) {
        if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
            res.status(400).json({ message: "Email already exists" })

        }else if (error?.code === 'P2025'){
            res.status(404).json({ message: "Invalid user" })
        }else{

            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id)

    try {
        await prisma.delete({ where: { id } })
        res.status(200).json({ message: "User deleted" }).end()
        
    } catch (error:any) {
        if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
            res.status(400).json({ message: "Email already exists" })

        }else if (error?.code === 'P2025'){
            res.status(404).json({ message: "Invalid user" })
        }else{

            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}