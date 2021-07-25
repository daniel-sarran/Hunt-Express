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

// Create New Job Modal Elements
const modal = document.querySelector("#modal-window");
const addNewBtn = document.querySelector("#new-job");
const closeModal = document.querySelector("#close");

// Unsaved Edit State Row Elements
let activeRowId = null;
let activeRowInputs = [];

// Modal Functionality
addNewBtn.onclick = function () {
  modal.style.display = "block";
};
closeModal.onclick = function () {
  modal.style.display = "none";
};
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

async function getAllJobs() {
  const response = await fetch("/api/jobs");
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  const data = await response.json();

  if (!data) return;

  for (let obj of data) {
    let { stage, notes, _id, company, position, dateApplied } = obj;
    date = new Date(dateApplied);
    date = date.toLocaleDateString("en-US", {timeZone: "UTC"});
    console.log(dateApplied, date)

    let rowData = [company, position, date, stage, notes];

    // Create the row to display one job

    // TR
    let row = document.createElement("tr");
    row.setAttribute("id", `${_id}`);
    row.setAttribute("class", "row");
    tbody.appendChild(row);

    for (let field of rowData) {
      // TD
      let content = document.createElement("td");
      row.appendChild(content);

      // INPUT
      rowField = document.createElement("input");
      rowField.setAttribute("type", "text");
      rowField.setAttribute("value", `${field}`);
      rowField.setAttribute("disabled", true);
      content.appendChild(rowField);
    }

    let content = document.createElement("td");
    row.appendChild(content);

    let editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fas fa-pen"></i>';
    editButton.setAttribute("onclick", `enableRowEditing("${_id}")`);

    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.setAttribute("onclick", `deleteJob("${_id}")`);

    let saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "Save";
    saveButton.setAttribute("class", "hidden");

    let cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    cancelButton.setAttribute("onclick", `cancelUnsavedEditRow()`);
    cancelButton.setAttribute("class", "hidden");

    content.appendChild(editButton);
    content.appendChild(deleteButton);
    content.appendChild(saveButton);
    content.appendChild(cancelButton);
  }
}

async function createJob(formData) {
  const response = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((entry) => console.log(entry, "New Application Successful..."))
    .catch((err) => console.log(err));
  // });
  // if (!response.ok) {
  //   const message = `An error has occured: ${response.status}`;
  //   throw new Error(message);
  // }
  // response.json().then((entry) => console.log(entry, "Post Successful..."));
  destroyTable();
  getAllJobs();
}

async function deleteJob(id) {
  const response = await fetch(`api/jobs/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  tbody.removeChild(document.getElementById(`${id}`));
}

// TODO - this function to be used to add a listener on clicking Edit
// inputs is intended to be an object with 4 values
// need to test: checkEmptyInputs
// I don't think need 3 chars minimum 1 is fine for Joi
// Should not use CREATE NEW JOB since this is a PUT request
function addSaveChangesListener(rowId) {
  const element = document.getElementById(rowId).children[5].children[2]
  element.addEventListener("click", (e) => {
    const row = document.getElementById(rowId)
    const inputCompany = row.children[0].firstElementChild
    const inputPosition = row.children[1].firstElementChild
    const inputDateApplied = row.children[2].firstElementChild
    const inputStage = row.children[3].firstElementChild
    const inputNotes = row.children[4].firstElementChild
    if (
      !inputCompany.value ||
      !inputPosition.value ||
      !inputDateApplied.value ||
      !inputStage.value
    ) {
      checkEmptyInputs([
        inputs.company,
        inputs.position,
        inputs.dateApplied,
        inputs.stage,
      ]);
      e.preventDefault();
      return;
    }
    // Assemble payload
    let formData = {
      company: inputCompany.value,
      position: inputPosition.value,
      dateApplied: inputDateApplied.value,
      stage: inputStage.value,
      notes: inputNotes.value
    };
    console.log("addSaveChangesListener()");
    editJob(rowId, formData);
    e.preventDefault();
  });
}

async function editJob(id, formData) {
  // const formData = {
  //   activeRowInputs.company
  // }
  const response = await fetch(`api/jobs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((updatedEntry) => console.log(updatedEntry, "Edit Application Successful..."))
    .catch((err) => console.log(err));
  // if (!response.ok) {
  //   const message = `An error has occured: ${response.status}`;
  //   throw new Error(message);
  // }
  destroyTable();
  getAllJobs();
}

function enableRowEditing(id) {
  let currentRow = document.getElementById(`${id}`);
  let rowChildren = currentRow.children;
  cancelRowEdit();
  activeRowId = id;
  for (i = 0; i < 5; i++) {
    activeRowInputs.push(rowChildren[i].firstElementChild.value);
  }
  textChildrenIndex = [0, 1, 4];
  for (let i of textChildrenIndex) {
    let child = rowChildren[i].firstElementChild;
    child.disabled = false;
  }
  let stageOptions = [
    "application submitted",
    "online assessment",
    "interview: phone",
    "interview: video",
    "interview: face-to-face",
    "rejection",
    "offer",
  ];
  let editStage = document.createElement("select");
  for (let i = 0; i < stageOptions.length; i++) {
    let option = document.createElement("option");
    option.value = stageOptions[i].toLowerCase();
    option.text = stageOptions[i];
    editStage.appendChild(option);
    if (option.value === activeRowInputs[3]) {
      editStage.selectedIndex = i;
    }
  }
  rowChildren[3].removeChild(rowChildren[3].firstElementChild);
  rowChildren[3].appendChild(editStage);
  // Change date value to date input
  let date = new Date(rowChildren[2].firstElementChild.value)
    .toISOString()
    .split("T")[0];
  let editDateInput = document.createElement("input");
  editDateInput.setAttribute("type", "date");
  editDateInput.setAttribute("value", `${date}`);
  rowChildren[2].removeChild(rowChildren[2].firstElementChild);
  rowChildren[2].appendChild(editDateInput);
  // Hide edit/delete buttons, show save/cancel buttons
  let buttons = rowChildren[rowChildren.length - 1].children;
  buttons[0].setAttribute("class", "hidden");
  buttons[1].setAttribute("class", "hidden");
  buttons[2].classList.remove("hidden");
  buttons[3].classList.remove("hidden");

  addSaveChangesListener(id)
}

function cancelRowEdit() {
  if (!activeRowId) {
    return;
  }
  let row = document.getElementById(`${activeRowId}`);
  let children = row.children;
  for (i = 0; i < 5; i++) {
    children[i].removeChild(children[i].firstElementChild);
  }
  for (i = 0; i < 5; i++) {
    let child = document.createElement("input");
    child.setAttribute("type", "text");
    child.setAttribute("value", `${activeRowInputs[i]}`);
    child.setAttribute("disabled", true);
    row.children[i].appendChild(child);

    activeRowInputs[i].disabled = true;
  }
  activeRowId = null;
  activeRowInputs = [];

  let buttons = children[children.length - 1].children;
  buttons[0].classList.remove("hidden");
  buttons[1].classList.remove("hidden");
  buttons[2].setAttribute("class", "hidden");
  buttons[3].setAttribute("class", "hidden");
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function destroyTable() {
  tbody.innerHTML = "";
}

function checkEmptyInputs(inputsArray) {
  for (let inputNode of inputsArray) {
    if (!inputNode.value) {
      inputNode.parentNode.style.color = "red";
    } else {
      inputNode.parentNode.style.color = "black";
    }
  }
}

function createJobModalListener() {
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
    modal.style.display = "none";
    console.log(formData);
    createJob(formData);
    e.preventDefault();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getAllJobs();
  createJobModalListener();
});
