//server.js = Enciende el motor
import app from './app.js';

const PORT = ProcessingInstruction.env.PORT || 3000; //usando variable de entorno

//El servido empiza a escuchar aqui
app.listen(PORT, ()=>{
    console.log(`🚀El servidor esta corriendo en http://localhost:${PORT}🚀`)
})

