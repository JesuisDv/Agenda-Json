import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../src/config/db.js'

//login del admin
export const loginAdmin = async(req, res) =>{
    try{
        const { username, password} = req.body

        //Validacion basica
        if(!username || !password){
            return res.status(400).json({
                error: 'Usuario y contrasena son obligatorios'
            })
        }

        //Buscamos e admin
        const [rows] = await pool.query(
            `SELECT *FROM admins WHERE username = ?`,
            [username]
        )

        if(rows.length === 0 ){
            return res.status(401).json({
                error: 'Credenciales invalidad'
            })
        }

        const admin = rows[0]

        //Comparamos las contras;eas
        const isValid = await bcrypt.compare(password, admin.password_hash)

        if(!isValid){
            return res.status(400).json({
                error: 'Credenciales invalidas'
            })
        }

        //Creamos el token
        const token = jwt.sigh(
            { adminId: admin.id },
            process.env.JWT_SECRET,
            { expiresIn: '8h'}
        )

        return res.status(200).json({
            message: 'Login Exitoso',
            token
        })
        
    }catch(error){
        console.error('Error en el login', error)
        return res.status(500).json({
            error: 'Error en el login'
        })
    }
}