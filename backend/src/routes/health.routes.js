//Ruta de testeo para verificar que el backend esta corriendo

import { Router } from 'express';

const router = Router()

//Ruta simple para probar el servidor
router.get('/', (req, res)=>{
    res.json({
        status: 'OK',
        message: 'Backend Running'
    })
})

export default router;