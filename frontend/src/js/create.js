const form = document.getElementById('appointmentForm')
const message = document.getElementById('message')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

const horaSeleccionada = document.getElementById('appointment_time').value

if (horaSeleccionada < "09:00" || horaSeleccionada > "18:00") {
  message.textContent = "❌ Solo atendemos de 09:00 a 18:00"
  return
}

const appointment = {
  customer_name: document.getElementById('client_name').value,
  customer_phone: document.getElementById('client_phone').value,
  appointment_date: document.getElementById('appointment_date').value,
  appointment_time: document.getElementById('appointment_time').value,
}

  try {
    const res = await fetch(`${window.API_BASE_URL || 'http://localhost:3000'}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment)
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error)
    }

    mensaje.innerHTML = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        Cita creada correctamente 🎉
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
  `;

    form.reset()

  } catch (err) {
    console.error(err)
    mensaje.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        Error al crear la cita
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  }
})
