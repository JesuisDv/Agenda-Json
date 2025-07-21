const apiURL = "http://localhost:3000/tareas";

const form = document.querySelector("#formData");
const input = document.querySelector("#date");




async function getData() {
  try {
    const response = await fetch(apiURL);
    const tareas = await response.json();
    console.log(tareas);

    //Filtrando las tareas
    const todas = tareas; //Todas las tareas
    const porHacer = tareas.filter(t => t.estado === "por-hacer") //Por hacer
    const enProgreso = tareas.filter(t => t.estado === "en-proceso") //En proceso
    const completadas = tareas.filter(t => t.estado === "completada") // Completadas

    document.getElementById("todasList").innerHTML = "";
    document.getElementById("toDoList").innerHTML = "";
    document.getElementById("inProgressList").innerHTML = "";
    document.getElementById("completedList").innerHTML = "";
    
    renderizarTareas(todas, "todasList");
    renderizarTareas(porHacer, "toDoList");
    renderizarTareas(enProgreso, "inProgressList");
    renderizarTareas(completadas, "completedList");

  }catch(error){
    console.error("Error al renderizar las tareas: ", error)
  }
}
  getData()
// Headers y body
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newObject = {
    id: String(Date.now()),
    titulo: input.value,
    completada: false,
    estado: "por-hacer"
  };

  await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newObject),
  });
  getData();
});

// Actualizar checkboxes
async function toggleEstado(id, completada) {
  const nuevoEstado = completada ? "completada" : "por-hacer"

  try{
  await fetch(`${apiURL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completada, estado: nuevoEstado }),
    })
  }catch (error) {
    console.error("Error actualizando el estado: ", error);
  }
  getData();

};

// Filtrar tareas por completadas, pendientes o todas
function renderizarTareas(lista, idColumna){
  const columna = document.getElementById(idColumna);
  if (!columna) {
    console.error(`No se encontró la columna con id "${idColumna}"`);
    return;
  }

  lista.forEach((tarea) => {
    const li = document.createElement("li");

    const label = document.createElement("label");
    label.textContent = tarea.titulo + ''
    
    const select = document.createElement("select");
    select.innerHTML = `
    <option value="por-hacer" ${tarea.estado === "por-hacer" ? "selected" : ""}>Por hacer</option>
    <option value="en-proceso" ${tarea.estado === "en-proceso" ? "selected" : ""}>En proceso</option>
    <option value="completada" ${tarea.estado === "completada" ? "selected" : ""}>Completada</option>
    `

    select.onchange = () => cambiarEstado(tarea.id, select.value)

    label.appendChild(select);
    li.appendChild(label);

    columna.appendChild(li);
  });  
}


//Funcion de cambiar de estado con select, justo arriba de este comentario.

async function cambiarEstado(id, nuevoEstado) {
  const completada = nuevoEstado === 'completada';

  try{
    await fetch(`${apiURL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado, completada }),
    });

    getData()
  }catch{
    console.error('Error al cambiar de estado: ', error)
  }

}

