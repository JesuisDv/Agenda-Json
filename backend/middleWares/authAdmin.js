//Middleware de proteccion clave

import jwt from 'jsonwebtoken'

export const authAdmin = (req, res, next)=>{
    try{
        const authHeader = req.headers.authorization

        //Debe venir: Bearer TOKEN
        if(!authHeader){
            return res.status(401).json({
             error: 'Token Requerido'
            })
        }

        const token = authHeader.split(' ')[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.adminId = decoded.adminId
        next()

    }catch(error){
        console.error('Error con el TOKEN en el sistema', error)
        return res.status(401).json({
            error: 'Token invalido'
        })
    }
}