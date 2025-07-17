const apiURL = "http://localhost:3000/tareas";

const form = document.querySelector("#formData");
const list = document.querySelector("#tasks");
const input = document.querySelector("#date");

async function getData() {

  try{
    const response = await fetch(apiURL);
    const data = await response.json();
    console.log(data);

  }catch{
    console.error("Error trayendo los datos: ", error)

  }
};

// Headers y body
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newObject = {
      id: Date.now(),
      titulo: input.value,
      completada: false
    };

    fetch(apiURL,{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newObject)
    });
    getData();
});