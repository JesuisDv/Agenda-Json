import { Router } from 'express'
import pool from '../config/db.js'
import { authAdmin } from '../../middleWares/authAdmin.js'

const router = Router()

// ========================================
// Bloquear un horario (solo admin)
// POST /api/blocked-slots
// ========================================

router.post('/', authAdmin, async (req, res)=>{
    try{
        const { block_date, block_time, reason } = req.body

        //Validacion Basica
        if(!block_date || !block_time){
            return res.status(400).json({
                error: "Fecha y horas obligatorias"
            })
        }

        //Validacion para verificar si el horario ya esta bloqueado
        // Verificar si el horario ya está bloqueado
        const [existing] = await pool.query(
            `
            SELECT id 
            FROM blocked_slots 
            WHERE block_date = ? AND block_time = ?
            `,
            [block_date, block_time]
        )

        if (existing.length > 0) {
            return res.status(400).json({
                error: 'Ese horario ya está bloqueado ⛔'
            })
        }


        //Insertar bloqueo
        await pool.query(
            `
            INSERT INTO blocked_slots (block_date, block_time, reason)
            VALUES (?, ?, ?)
            `,
            [block_date, block_time, reason || null]
        )

        return res.status(200).json({
            message: 'Horario bloqueado correctamente '
        })

    }catch(error){
        console.error("Error al bloequear horario", error)
        return res.status(500).json({
            error: 'Error al bloquear horario'
        })
    }
})

export default router