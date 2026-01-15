const form = document.getElementById('loginForm')
const errorText = document.getElementById('error')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const username = document.getElementById('username').value
  const password = document.getElementById('password').value

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error)
    }

    // ✅ Guardar token
    localStorage.setItem('token', data.token)

    // ✅ Redirigir al dashboard
    window.location.href = '/dashboard.html'

  } catch (error) {
    console.error('Error en el login', error)
    errorText.textContent = error.message
  }
})


