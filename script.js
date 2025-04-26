// --- Utility Functions ---

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

function applyPhoneFormat(value) {
  value = value.replace(/\D/g, ''); // remove all non-digits

  if (!value.startsWith('6')) value = '6' + value; // ensure it starts with 6
  value = '+' + value;

  if (value.length > 5) value = value.slice(0, 5) + '-' + value.slice(5);
  if (value.length > 10) value = value.slice(0, 10) + value.slice(10);

  return value.slice(0, 15);
}

function formatPhoneInput(input) {
  input.addEventListener('input', () => {
    input.value = applyPhoneFormat(input.value);
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    input.value = applyPhoneFormat(pasteData);
  });
}

// --- Main App Logic ---

const contactForm = document.getElementById('contact-form');
const contactTableBody = document.querySelector('#contact-table tbody');
const exportButton = document.getElementById('exportVCF');
const clearButton = document.getElementById('clearAll');

let contacts = [];

formatPhoneInput(document.getElementById('phone1'));
formatPhoneInput(document.getElementById('phone2'));

// Handle form submission
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const photoInput = document.getElementById('photo');

  if (photoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const photoBase64 = e.target.result.split(',')[1];
      saveContact(photoBase64);
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    saveContact('');
  }
});

function saveContact(photoBase64) {
  let phone1 = document.getElementById('phone1').value.trim();
  let phone2 = document.getElementById('phone2').value.trim();

  if (phone1 && !phone1.startsWith('+6')) {
    phone1 = '+6' + phone1.replace(/[^0-9]/g, '');
  }
  if (phone2 && !phone2.startsWith('+6')) {
    phone2 = '+6' + phone2.replace(/[^0-9]/g, '');
  }

  const contact = {
    firstName: capitalizeWords(document.getElementById('firstName').value.trim()),
    lastName: capitalizeWords(document.getElementById('lastName').value.trim()),
    company: document.getElementById('company').value.trim(),
    phone1: phone1,
    phone2: phone2,
    email: document.getElementById('email').value.trim(),
    address: capitalizeWords(document.getElementById('address').value.trim()),
    category: document.getElementById('category').value.trim(),
    photoBase64: photoBase64
  };

  contacts.push(contact);
  renderContacts();
  contactForm.reset();
}

function renderContacts() {
  contactTableBody.innerHTML = '';

  contacts.forEach((contact, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contact.firstName}</td>
      <td>${contact.lastName}</td>
      <td>${contact.company}</td>
      <td>${contact.phone1}</td>
      <td>${contact.phone2}</td>
      <td>${contact.email}</td>
      <td>${contact.address}</td>
      <td>${contact.category}</td>
      <td><button onclick="editContact(${index})">Edit</button></td>
    `;
    contactTableBody.appendChild(row);
  });
}

function editContact(index) {
  const contact = contacts[index];

  document.getElementById('firstName').value = contact.firstName;
  document.getElementById('lastName').value = contact.lastName;
  document.getElementById('company').value = contact.company;
  document.getElementById('phone1').value = contact.phone1;
  document.getElementById('phone2').value = contact.phone2;
  document.getElementById('email').value = contact.email;
  document.getElementById('address').value = contact.address;
  document.getElementById('category').value = contact.category || '';

  contacts.splice(index, 1); // Remove to allow re-saving
}

exportButton.addEventListener('click', () => {
  if (contacts.length === 0) {
    alert('No contacts to export.');
    return;
  }

  let vcfContent = '';

  contacts.forEach(contact => {
    vcfContent += generateVCF(contact) + '\n';
  });

  const blob = new Blob([vcfContent], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = 'contacts.vcf';
  a.click();

  URL.revokeObjectURL(url);
});

function generateVCF(contact) {
  let vcf = "BEGIN:VCARD\nVERSION:3.0\n";

  vcf += `N:${contact.lastName};${contact.firstName};;;\n`;
  vcf += `FN:${contact.firstName} ${contact.lastName}\n`;

  if (contact.company) vcf += `ORG:${contact.company}\n`;
  if (contact.phone1) vcf += `TEL;TYPE=CELL:${contact.phone1}\n`;
  if (contact.phone2) vcf += `TEL;TYPE=HOME:${contact.phone2}\n`;
  if (contact.email) vcf += `EMAIL:${contact.email}\n`;
  if (contact.address) vcf += `ADR;TYPE=HOME:;;${contact.address};;;;\n`;
  if (contact.category) vcf += `CATEGORIES:${contact.category}\n`;
  if (contact.photoBase64) vcf += `PHOTO;ENCODING=b;TYPE=JPEG:${contact.photoBase64}\n`;

  vcf += "END:VCARD\n";

  return vcf;
}

clearButton.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all contacts?')) {
    contacts = [];
    renderContacts();
  }
});
