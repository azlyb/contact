// --- Utility Functions ---

// Formats phone numbers while typing/pasting
function applyPhoneFormat(value) {
  value = value.replace(/\D/g, ''); // Remove non-digits
  if (value.startsWith('6')) value = '+' + value;
  else value = '+6' + value;
  if (value.length > 5) value = value.slice(0, 5) + '-' + value.slice(5);
  if (value.length > 10) value = value.slice(0, 10) + value.slice(10);
  return value.slice(0, 14); // +6012-3456789
}

// Auto-capitalize each word
function capitalizeWords(input) {
  input.addEventListener('input', () => {
    input.value = input.value
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  });
}

// --- Main App Logic ---

const contactForm = document.getElementById('contact-form');
const contactTableBody = document.querySelector('#contact-table tbody');
const exportButton = document.getElementById('exportVCF');
const clearButton = document.getElementById('clearAll');
const photoInput = document.getElementById('photo');

let contacts = [];

// Attach phone formatter
function attachPhoneFormatter(input) {
  input.addEventListener('input', () => {
    input.value = applyPhoneFormat(input.value);
  });
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    input.value = applyPhoneFormat(pasteData);
  });
}

attachPhoneFormatter(document.getElementById('phone1'));
attachPhoneFormatter(document.getElementById('phone2'));

// Auto-capitalize fields
capitalizeWords(document.getElementById('firstName'));
capitalizeWords(document.getElementById('lastName'));
capitalizeWords(document.getElementById('address'));
capitalizeWords(document.getElementById('company'));

// Handle form submission
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  let phone1 = document.getElementById('phone1').value.trim();
  let phone2 = document.getElementById('phone2').value.trim();

  if (phone1 && !phone1.startsWith('+6')) {
    phone1 = applyPhoneFormat(phone1);
  }
  if (phone2 && !phone2.startsWith('+6')) {
    phone2 = applyPhoneFormat(phone2);
  }

  let photoBase64 = '';
  if (photoInput.files.length > 0) {
    photoBase64 = await fileToBase64(photoInput.files[0]);
    photoBase64 = photoBase64.split(',')[1]; // remove the "data:image/jpeg;base64," part
  }

  const contact = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    company: document.getElementById('company').value.trim(),
    phone1: phone1,
    phone2: phone2,
    email: document.getElementById('email').value.trim(),
    address: document.getElementById('address').value.trim(),
    category: document.getElementById('category').value.trim(),
    photo: photoBase64
  };

  contacts.push(contact);
  renderContacts();
  contactForm.reset();
});

// Render contacts in table
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

// Edit a contact
function editContact(index) {
  const contact = contacts[index];

  document.getElementById('firstName').value = contact.firstName;
  document.getElementById('lastName').value = contact.lastName;
  document.getElementById('company').value = contact.company;
  document.getElementById('phone1').value = contact.phone1;
  document.getElementById('phone2').value = contact.phone2;
  document.getElementById('email').value = contact.email;
  document.getElementById('address').value = contact.address;
  document.getElementById('category').value = contact.category;

  contacts.splice(index, 1); // remove from list so we re-save it
}

// Export contacts to VCF
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

// Generate a single VCF entry
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
  if (contact.photo) vcf += `PHOTO;ENCODING=b;TYPE=JPEG:${contact.photo}\n`;

  vcf += "END:VCARD\n";
  return vcf;
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// Clear all contacts
clearButton.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all contacts?')) {
    contacts = [];
    renderContacts();
  }
});
