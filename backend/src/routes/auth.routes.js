 import { Router } from 'express'
 import { loginAdmin } from '../../controllers/auth.controller.js'
 
 const router = Router()

 //router.post/auth/login
 router.post('/login', loginAdmin)

 export default router

