// ===============================
// Protección del dashboard
// ===============================
const token = localStorage.getItem('token')
const logoutbtn = document.getElementById('logoutBtn')


logoutbtn.addEventListener('click', ()=>{

  //borramos el token
  localStorage.removeItem('token')

  //Redirigimos al login
  window.location.href = '/admin.html'
})


if (!token) {
    window.location.href = '/admin.html'
}

//Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO')
}

//Estados al espanol
function formatStatus(status) {
  const map = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada'
  }
  return map[status] || status
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

    appointments.forEach(appointment => {
    const appointmentDiv = document.createElement('div')
    appointmentDiv.classList.add('appointment')

    appointmentDiv.innerHTML = `
        <h3>${appointment.customer_name}</h3>
        <p>📞 ${appointment.customer_phone}</p>
        <p>📅 ${formatDate(appointment.appointment_date)}</p>
        <p>⏰ ${appointment.appointment_time}</p>
        <p><strong>Estado:</strong> ${formatStatus(appointment.status)}</p>

        <div class="actions">
        <button class="confirm-btn" data-id="${appointment.id}">
            Confirmar
        </button>
        <button class="cancel-btn" data-id="${appointment.id}">
            Cancelar
        </button>
        </div>
    `
    if (appointment.status !== 'pending') {
        appointmentDiv.querySelector('.actions').style.display = 'none'
    }

    container.appendChild(appointmentDiv)
    })

}


// FUNCIÓN PATCH para cambiar el estado de una cita
async function updateStatus(id, status) {
  try {
    const token = localStorage.getItem('token')

    const res = await fetch(`http://localhost:3000/api/appointments/${id}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      }
    )

    if (!res.ok) {
      throw new Error('Error al actualizar el estado')
    }

    await loadAppointments()

  } catch (error) {
    console.error('Error', error)
    alert('No se pudo actualizar la cita')
  }
}


//Se ejecuta la carga en el dashboard
loadAppointments()

document.addEventListener('click', async(e)=>{
    const token = localStorage.getItem('token')

    //Confirmar
    if(e.target.classList.contains('confirm-btn')){
        const id = e.target.dataset.id
        await updateStatus(id, 'confirmed', token)
    }

    //Cancelar
    if(e.target.classList.contains('cancel-btn')){
        const id = e.target.dataset.id
        await updateStatus(id, 'canceled', token)
    }
})

