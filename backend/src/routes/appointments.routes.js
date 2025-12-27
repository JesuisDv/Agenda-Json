// Importamos Router desde express
// Router nos permite crear rutas separadas del archivo principal (app.js)
import { Router } from 'express'
// Importamos la conexión a MySQL
// pool es el objeto que nos permite ejecutar consultas SQL
import pool from '../config/db.js'

//Proteger rutas sensibles
import { authAdmin } from '../../middleWares/authAdmin.js'

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

        // VALIDACIÓN 3: horario bloqueado
        const [blocked] = await pool.query(
            `
            SELECT id
            FROM blocked_slots
            WHERE block_date = ?
            AND block_time = ?
            `,
            [appointment_date, appointment_time]
        )

            if (blocked.length > 0) {
                return res.status(400).json({
                error: 'Este horario no está disponible 🚫'
            })
        }


        //VALIDACIÓN 4: evitar doble cita (misma fecha y hora)
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


// ======================================================
// Editar una cita por ID
// PUT /api/appointments/:id
// ======================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params // Extraemos el ID de la URL
    const { customer_name, customer_phone, appointment_date, appointment_time } = req.body // Extraemos los nuevos datos del body

    // Validación básica: verificar que todos los campos sean proporcionados
    if (!customer_name || !customer_phone || !appointment_date || !appointment_time) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios para editar la cita.'
      })
    }

    // Validación: no permitir editar citas en el pasado
    const now = new Date()
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`)
    if (appointmentDateTime < now) {
      return res.status(400).json({
        error: 'No se puede editar la cita para una fecha pasada.'
      })
    }

    // Verificar que no exista otra cita con la misma fecha y hora (para evitar dobles citas)
    const [existing] = await pool.query(
      'SELECT * FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND id != ?',
      [appointment_date, appointment_time, id]
    )
    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Ya existe una cita en ese horario.'
      })
    }

    // Actualizamos la cita en la base de datos
    await pool.query(
        `UPDATE appointments
         SET customer_name = ?, customer_phone = ?, appointment_date = ?, appointment_time = ? 
         WHERE id = ?`,
        [customer_name, customer_phone, appointment_date, appointment_time, id]
    )

    //Respues de exito al actualizar
    return res.status(200).json({
        message: 'Cita actualizada con exito'
    })

    }catch(error){
        console.error('Error al editar la cita: ',error)

        return res.status(500).json({
            error: 'Error interno del servidor, editar'
        })
    }
})


// ======================================================
// Eliminar una cita por ID
// DELETE /api/appointments/:id
// ======================================================

router.delete('/:id', async (req, res)=>{
    try{
        const { id } = req.params 

        //Verificar que la cita si existe antes de eliminarla
        const [existing] = await pool.query(`SELECT * FROM appointments WHERE id = ?`,[id])
        if(existing.length === 0){
            return res.status(404).json({
                error: 'Cita no encontrada'
            })
        }

        //Aqui se elimina la cita
        await pool.query('DELETE FROM appointments WHERE id= ?', [id])

        //Respuesta de exito
        return res.status(200).json({
            message: 'Cita eliminada correctamente'
        })

    }catch(error){
        console.error('Error al eliminar la cita, ',error)
        return res.status(500).json({
            error: 'Error interno del servidor'
        })
    }
})




export default router