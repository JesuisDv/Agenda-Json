const apiURL = "http://localhost:3000/tareas";

const form = document.querySelector("#formData");
const list = document.getElementById("tasks");
const input = document.querySelector("#date");

async function getData() {
  try {
    const response = await fetch(apiURL);
    const data = await response.json();
    console.log(data);

    list.innerHTML = "";

    data.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<label><input class="checkBox" type="checkbox" ${item.completada ? 'checked' : ''} onchange="toggleEstado(${item.id}, this.checked)">${item.titulo}</label>`;
      list.appendChild(li);
    });

    

  } catch {
    console.error("Error trayendo los datos: ", error);
  }
}

// Headers y body
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newObject = {
    id: String(Date.now()),
    titulo: input.value,
    completada: false,
  };

  fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newObject),
  });
  getData();
});

// Actualizar checkboxes
async function toggleEstado(id, estado) {
  try{
    const response = fetch(`${apiURL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completada: estado }),
    })
  }catch (error) {
    console.error("Error actualizando el estado: ", error);
  }
  getData();

};

// Filtrar tareas por completadas, pendientes o todas