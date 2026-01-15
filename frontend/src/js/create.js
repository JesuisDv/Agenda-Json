const form = document.getElementById('appointmentForm')
const message = document.getElementById('message')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const appointment = {
    client_name: document.getElementById('client_name').value,
    client_phone: document.getElementById('client_phone').value,
    appointment_date: document.getElementById('appointment_date').value,
    appointment_time: document.getElementById('appointment_time').value,
  }

  try {
    const res = await fetch('https://TU-URL/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment)
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error)
    }

    message.textContent = 'Cita creada con éxito 🎉'
    form.reset()

  } catch (err) {
    console.error(err)
    message.textContent = 'Error: no se pudo crear la cita'
  }
})
