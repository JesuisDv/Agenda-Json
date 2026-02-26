
// ===============================
// Protección del dashboard
// ===============================
const token = localStorage.getItem('token')
const logoutbtn = document.getElementById('logoutBtn')


logoutbtn.addEventListener('click', (e)=>{
  e.preventDefault()
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
    canceled: 'Cancelada'
  }
  return map[status] || status
}

// Mostrar alerta con estilos de Bootstrap (danger, warning, success, info)
function showAlert(message, type = 'danger') {
  const modalEl = document.getElementById('alertModal')
  const bodyEl = document.getElementById('alertModalBody')
  if (!modalEl || !bodyEl) return
  bodyEl.className = `alert alert-${type} mb-0`
  bodyEl.textContent = message
  const modal = new bootstrap.Modal(modalEl)
  modal.show()
}

// ===============================
// Obtener citas desde el backend
// ===============================

async function loadAppointments() {
    try{
        const res = await fetch(`${window.API_BASE_URL || 'http://localhost:3000'}/api/appointments`, {
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
        showAlert('Error cargando citas', 'danger')
    }
}

// ===============================
// Pintar citas en el HTML
// ===============================

function renderAppointments(appointments){
    const container = document.getElementById('appointmentsList')
    container.innerHTML = ''
    container.className = 'row g-3'

    if(appointments.length === 0){
        container.innerHTML = '<p class="text-muted">No hay citas</p>'
        return
    }

    appointments.forEach(appointment => {
    const isPending = String(appointment.status).toLowerCase() === 'pending'
    const actionsHtml = isPending
      ? `
          <div class="actions d-flex flex-column gap-2">
            <button type="button" class="btn btn-success btn-sm confirm-btn" data-id="${appointment.id}">Confirmar</button>
            <button type="button" class="btn btn-danger btn-sm cancel-btn" data-id="${appointment.id}">Cancelar</button>
          </div>
        `
      : `
          <div class="actions">
            <button type="button" class="btn btn-outline-danger btn-sm delete-btn" data-id="${appointment.id}">Borrar</button>
          </div>
        `

    const col = document.createElement('div')
    col.classList.add('col-12', 'col-sm-6', 'col-lg-3')

    col.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body d-flex justify-content-between align-items-start gap-3">
          <div class="flex-grow-1 min-w-0">
            <h5 class="card-title mb-2">${appointment.customer_name}</h5>
            <p class="card-text mb-1 small">📞 ${appointment.customer_phone}</p>
            <p class="card-text mb-1 small">📅 ${formatDate(appointment.appointment_date)}</p>
            <p class="card-text mb-2 small">⏰ ${appointment.appointment_time}</p>
            <p class="card-text mb-0"><strong>Estado:</strong> ${formatStatus(appointment.status)}</p>
          </div>
          <div class="flex-shrink-0">
            ${actionsHtml}
          </div>
        </div>
      </div>
    `

    container.appendChild(col)
    })

}


// FUNCIÓN PATCH para cambiar el estado de una cita
async function updateStatus(id, status) {
  try {
    const token = localStorage.getItem('token')

    const res = await fetch(`${window.API_BASE_URL || 'http://localhost:3000'}/api/appointments/${id}/status`,
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
    showAlert('No se pudo actualizar la cita', 'danger')
  }
}

// FUNCIÓN DELETE para eliminar una cita (confirmadas o canceladas)
async function deleteAppointment(id) {
  try {
    const token = localStorage.getItem('token')

    const res = await fetch(`${window.API_BASE_URL || 'http://localhost:3000'}/api/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Error al eliminar la cita')
    }

    await loadAppointments()
  } catch (error) {
    console.error('Error', error)
    showAlert(error.message || 'No se pudo eliminar la cita', 'danger')
  }
}


//Se ejecuta la carga en el dashboard
loadAppointments()

document.addEventListener('click', async (e) => {
    // Confirmar
    if (e.target.classList.contains('confirm-btn')) {
        const id = e.target.dataset.id
        await updateStatus(id, 'confirmed')
    }

    // Cancelar
    if (e.target.classList.contains('cancel-btn')) {
        const id = e.target.dataset.id
        await updateStatus(id, 'canceled')
    }

    // Borrar (citas confirmadas o canceladas)
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id
        if (confirm('¿Eliminar esta cita?')) {
            await deleteAppointment(id)
        }
    }
})

