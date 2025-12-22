// Importamos Router desde express
// Router nos permite crear rutas separadas del archivo principal (app.js)
import { Router } from 'express'
// Importamos la conexión a MySQL
// pool es el objeto que nos permite ejecutar consultas SQL
import pool from '../config/db.js'

const router = Router()// Creamos una instancia del router

//Endpoint para crear citas
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
        if(!customer_name || !customer_phone || !appointment_date || appointment_time){
            return res.status(400).json({
                error: 'Todos los campos son obligatorios 🤐'
            })
        }

         // VALIDACIÓN 2: no permitir fechas pasadas
        const now = new Date()

        //Se crea objeto Date para comparar fecha y hora
        const appointmentDateTime = new Date(
            `${appointment_date}T${appointment_time}`
        )

        //Si la fecha de la cita es menor que es pasada
        if(appointmentDateTime < now){
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