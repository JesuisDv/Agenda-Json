//app.js = Configura como se comporta Express, Reglas del servidor

import express from 'express'
import cors from 'cors'
import './config/db.js'
import healthRoutes from './routes/health.routes.js'

//Creamos al app en express
const app = express()

//Permite la comunicacion del front con el back
app.use(cors())

//Permite recibir JSON en el body (POST, PUT, etc.)
app.use(express.json())

//Rutas del sistema
app.use('/api/health', healthRoutes)

export default app;

