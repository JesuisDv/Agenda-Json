// ===============================
// Protección del dashboard
// ===============================
const token = localStorage.getItem('token')

if (!token) {
    window.location.href = '/admin.html'
}

// ===============================
// Obtener citas desde el backend
// ===============================

async function loadAppointments() {
    try{
        const res = await fetch('http://localhost:3000/api/appointments', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const data = await res.json()

        if (!res.ok){
            throw new Error(data.error || 'Error al cargar citas')
        }

        renderAppointments(data.data)

    }catch(error){
        console.error(error)
        alert('Error cargando citas')
    }
}

// ===============================
// Pintar citas en el HTML
// ===============================

function renderAppointments(appointments){
    const container = document.getElementById('appointmentsList')
    container.innerHTML = ''

    if(appointments.length === 0){
        container.innerHTML = '<p>No Hay Citas</p>'
        return
    }

    appointments.forEach(app =>{
        const div = document.createElement('div')
        div.classList.add('appointment')

        div.innerHTML = `
            <strong>${app.customer_name}</strong><br>
            📞 ${app.customer_phone}<br>
            📅 ${app.appointment_date} ⏰ ${app.appointment_time}<br>
            🏷 Estado: ${app.status}
        `

        container.appendChild(div)
    })
}

//Se ejecuta la carga en el dashboard
loadAppointments()