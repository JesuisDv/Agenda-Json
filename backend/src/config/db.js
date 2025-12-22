import mysql from 'mysql2/promise'

/*
Creamos un pool de conexiones.
un pool: -reutiliza conexiones
         -Es mas eficiente
         -Evita saturar MySQL
*/ 

const pool = mysql.createPool({
    host:process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})


/*Esta funcion prueba la conexion al iniciar el servidor con la base de datos
si falla, el backend no se levanta*/ 

const testConnection = async()=>{
    try{
        const connection = await pool.getConnection()
        console.log(`✅ MySQL connected successfully`)
    }catch(error){
        console.error('❌ MySQL connection failed:', error.message)
        process.exit(1)
    }
}

testConnection()

export default pool;