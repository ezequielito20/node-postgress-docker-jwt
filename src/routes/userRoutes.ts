import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/usersController";

const router = express.Router()
const JWT_SECRET =  process.env.JWT_SECRET || 'default-secret'

// Middleware de JWT para ver si estamos autenticados
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.status(401).json('No authorized')
        // Verificar si el token es válido
    jwt.verify(token, JWT_SECRET, (err, decoded)=>{
        if (err) {
            console.error('Error de autenticacion: ', err)
            return res.status(403).json({error: 'No authorized'})
        }
        next()

    })

}

router.post('/', authenticateToken, createUser )
router.get('/', authenticateToken, getAllUsers)
router.get('/:id', authenticateToken, getUserById)
router.put('/:id', authenticateToken, updateUser)
router.delete('/:id', authenticateToken, deleteUser)



export default router;