import bcrypt from 'bcrypt'
import pool from '../src/config/db.js'

//usuario y contraseño iniciales
const username = 'admin'
const password = 'admin123'

async function createAdmin() {
    //Encryptamos la contraseña
    const passwordHash = await bcrypt.hash(password, 10)
    
    //Guardamos en db
    await pool.query(
        `INSERT INTO admins (username, password_hash) VALUES (?, ?)`,
        [username, passwordHash]
    )

    console.log('Admin creado correctamente ✅')
    process.exit()
}

createAdmin()

