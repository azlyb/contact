const form = document.getElementById("contact-form");
const tableBody = document.querySelector("#contact-table tbody");
const exportBtn = document.getElementById("exportVCF");
const clearBtn = document.getElementById("clearAll");

let contacts = [];
let editIndex = null;

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const contact = {
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    company: form.company.value.trim(),
    phone1: form.phone1.value.trim(),
    phone2: form.phone2.value.trim(),
    email: form.email.value.trim(),
    address: form.address.value.trim()
  };

  if (editIndex !== null) {
    contacts[editIndex] = contact;
    editIndex = null;
    rebuildTable();
  } else {
    contacts.push(contact);
    appendToTable(contact, contacts.length - 1);
  }

  form.reset();
});

function appendToTable(contact, index) {
  const row = tableBody.insertRow();
  row.insertCell().textContent = contact.firstName;
  row.insertCell().textContent = contact.lastName;
  row.insertCell().textContent = contact.company;
  row.insertCell().textContent = contact.phone1;
  row.insertCell().textContent = contact.phone2;
  row.insertCell().textContent = contact.email;
  row.insertCell().textContent = contact.address;

  const editCell = row.insertCell();
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.onclick = () => loadContactForEdit(index);
  editCell.appendChild(editBtn);
}

function loadContactForEdit(index) {
  const contact = contacts[index];
  form.firstName.value = contact.firstName;
  form.lastName.value = contact.lastName;
  form.company.value = contact.company;
  form.phone1.value = contact.phone1;
  form.phone2.value = contact.phone2;
  form.email.value = contact.email;
  form.address.value = contact.address;
  editIndex = index;
}

function rebuildTable() {
  tableBody.innerHTML = "";
  contacts.forEach((contact, i) => appendToTable(contact, i));
}

function createVCF(contact) {
  return `BEGIN:VCARD
VERSION:3.0
N:${contact.lastName};${contact.firstName};;;
FN:${contact.firstName} ${contact.lastName}
ORG:${contact.company}
TEL;TYPE=CELL:${contact.phone1}
TEL;TYPE=HOME:${contact.phone2}
EMAIL;TYPE=INTERNET:${contact.email}
ADR;TYPE=HOME:;;${contact.address};;;;
END:VCARD`;
}

exportBtn.addEventListener("click", () => {
  if (contacts.length === 0) return;

  const vcfData = contacts.map(createVCF).join("\n");
  const blob = new Blob([vcfData], { type: "text/vcard;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "contacts.vcf";
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  document.body.removeChild(link);
});

clearBtn.addEventListener("click", () => {
  contacts = [];
  tableBody.innerHTML = "";
});
