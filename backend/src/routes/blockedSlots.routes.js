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