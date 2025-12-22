// Importamos Router desde express
// Router nos permite crear rutas separadas del archivo principal (app.js)
import { Router } from 'express'
// Importamos la conexión a MySQL
// pool es el objeto que nos permite ejecutar consultas SQL
import pool from '../config/db.js'

const router = Router()// Creamos una instancia del router


// ======================================================
//Endpoint para crear citas
// POST /api/appointments
// ======================================================
router.post('/', async (req, res)=>{
    try{
        // Extraemos los datos que vienen en el body del request
        // req.body es el JSON que envía el usuario
        const{
            customer_name,
            customer_phone,
            appointment_date,
            appointment_time
        } = req.body

        //VALIDACIÓN 1: campos obligatorios, si faltan error 400(bad request)
        if(!customer_name || !customer_phone || !appointment_date || !appointment_time){
            return res.status(400).json({
                error: 'Todos los campos son obligatorios 🤐'
            })
        }

        // VALIDACIÓN 2: no permitir fechas pasadas
        const now = new Date()

        // Crear la fecha usando hora local (SIN problemas de zona horaria)
        const appointmentDateTime = new Date(appointment_date)

        const [hours, minutes, seconds] = appointment_time.split(':')
        appointmentDateTime.setHours(
            Number(hours),
            Number(minutes),
            Number(seconds || 0),
            0
        )

        //Si la fecha de la cita es pasada
        if (appointmentDateTime < now) {
            return res.status(400).json({
                error: 'No se puede agendar la cita en el pasado 💀'
            })
        }

        //VALIDACIÓN 3: evitar doble cita (misma fecha y hora)
        // Ejecutamos una consulta SQL para buscar citas existentes
        const [existingAppointments] = await pool.query(
            `
            SELECT id
            FROM appointments
            WHERE appointment_date = ?
            AND appointment_time = ?
            `,
            [appointment_date, appointment_time]// Valores seguros (evita SQL Injection)
        )

        //Si el arreglo tiene resultados, ya existe una cita creada
        if(existingAppointments.length > 0){
            return res.status(400).json({
                error: 'Ya existe una cita en ese horario 🥱'
            })
        }

        //INSERTAR LA CITA A LA DB
        await pool.query(
            `
            INSERT INTO appointments 
            (customer_name, customer_phone, appointment_date, appointment_time)
            VALUES (?, ?, ?, ?)
            `,
            [
                customer_name,
                customer_phone,
                appointment_date,
                appointment_time
            ]
        )

        //Respuesta exxitosa
        return res.status(201).json({
            message: 'Cita generara Correctamente 🤩'
        })

    }catch(error){
        //Error inesperado
        console.error('Error al crear cita', error)

        return res.status(500).json({
            error: 'Error interno del servidor 😵‍💫'
        })
    }
})

export default router

// ======================================================
// Endpoint para OBTENER todas las citas (ADMIN)
// GET /api/appointments
// ======================================================

router.get('/', async (req, res)=>{
    try{
        //Consulta SQL para traer las citas
        //ORDER BY para mostrarlas ordenadas
        const [appointments]= await pool.query(
            `  
                SELECT *
                FROM appointments
                ORDER BY appointment_date ASC, appointment_time ASC
            `
        )

        //Retornamos las citas encontradas
        return res.status(200).json({
            total: appointments.length,
            data: appointments
        })
    }catch(error){
        console.error('Error al obtener citas', error)
        return res.status(500).json({
            error: 'Error interno del servidor 😵‍💫'
        })
    }
})

// ======================================================
// Endpoint para OBTENER Cita por ID
// GET /api/appointments/:id
// ======================================================

router.get('/:id', async(req, res)=>{
    try{
        // Extraemos el parámetro 'id' de la URL (req.params)
        const { id } = req.params

        // Validación básica: asegurar que el ID sea un número
        if(isNaN(id)){
            return res.status(400).json({
                error: 'ID no valido, debe ser un numero'
            })
        }

        //Consulta SQL para obetenr cita por ID
        const [appointment] = await pool.query(
            'SELECT * FROM appointments WHERE id = ?',
            [id] // Evita SQL Injection
        )

        //Si no se encuentra la cita, error 404
        if(appointment.length === 0){
            return res.status(404).json({
                error: 'Cita no encontrada'
            })
        }

        //Si encontramos la cita, la devolvemos
        return res.status(200).json({
            data: appointment[0] //Esto muestra la primera cita
        })

    }catch(error){  
        console.error('Error al obtener cita por ID: ', error)
        return res.status(500).json({
            error: 'Error interno del servidor'
        })
    }
})