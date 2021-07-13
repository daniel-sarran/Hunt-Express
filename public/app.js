const container = document.querySelector(".content-container");

// Form Elements
const company = document.querySelector("#company");
const position = document.querySelector("#position");
const dateApplied = document.querySelector("#date-applied");
const stage = document.querySelector("#stage");
const notes = document.querySelector("#notes");
const formSubmitButton = document.querySelector("#form-submit");

// Table Elements
const tbody = document.querySelector(".table-body");

async function getData() {
  const response = await fetch("/api/jobs");
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  const data = await response.json();

  if (!data) return;

  console.log(data);
  for (let obj of data) {
    let { stage, notes, _id, company, position, dateApplied, v } = obj;
    date = new Date(dateApplied);
    date = date.toLocaleDateString("en-US");

    // TR
    let row = document.createElement("tr");
    row.setAttribute("id", `${_id}`);
    tbody.appendChild(row);

    // TD
    let cell = document.createElement("td");
    row.appendChild(cell);

    //DIV
    let content = document.createElement("div");
    cell.appendChild(content);

    // SPAN
    rowData = document.createElement("span");
    content.appendChild(rowData);
    rowData.textContent = `Company: ${company} | Position: ${position} |
    Date Applied: ${date} | Stage: ${stage} | Notes: ${notes}`;

    // BUTTON
    let editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fas fa-pen"></i>';
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';

    content.appendChild(editButton);
    content.appendChild(deleteButton);
  }
}

async function postData(formData) {
  const response = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  response.json().then((entry) => console.log(entry));
  clearTable(container);
  getData();
}

function clearTable(container) {
  container.innerHTML = "";
}

// Todo make inputs red if empty
function checkEmptyInputs(inputsArray) {
  for (let inputNode of inputsArray) {
    if (!inputNode.value) {
      inputNode.parentNode.style.color = "red";
    } else {
      inputNode.parentNode.style.color = "black";
    }
  }
}

function createFormListener() {
  formSubmitButton.addEventListener("click", (e) => {
    if (
      !company.value ||
      !position.value ||
      !dateApplied.value ||
      !stage.value
    ) {
      checkEmptyInputs([company, position, dateApplied, stage]);
      e.preventDefault();
      return;
    }
    // Assemble Payload
    let formData = {
      company: company.value,
      position: position.value,
      dateApplied: dateApplied.value,
      stage: stage.value,
      notes: notes.value,
    };
    console.log(formData);
    // postData(formData);
    e.preventDefault();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getData();
  createFormListener();
});
