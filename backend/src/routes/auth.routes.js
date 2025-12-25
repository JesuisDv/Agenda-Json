 import { Router } from 'express'
 import { loginAdmin } from '../controllers/auth.controller.js'
 
 console.log('✅ auth.routes cargado')
 
 const router = Router()

 //router.post/auth/login
 router.post('/login', loginAdmin)


router.get('/test', (req, res) => {
  res.json({ ok: true })
})

 export default router

