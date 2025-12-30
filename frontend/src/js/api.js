// Conexion con API

const API_URL = 'http://localhost:3000/api'

//helper generico
export async function apiRequest(endpoint, options = {}){
    //Injecta el token automaticamente
    const token = localStorage.getItem('token')

    //Fetch sin repetirlo 
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
        },
        ...options
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(data.message || 'Error en la peticion')
    }

    return data
}
