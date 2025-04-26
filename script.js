// --- Utility Functions ---

// Proper Malaysia phone formatting
function applyPhoneFormat(value) {
  value = value.replace(/\D/g, ''); // remove all non-digits

  // Handle Malaysian numbers
  if (value.startsWith('0')) {
    value = '+60' + value.substring(1);
  } else if (value.startsWith('60')) {
    value = '+' + value;
  } else if (!value.startsWith('+60')) {
    value = '+60' + value;
  }

  if (value.length === 12) {
    value = value.slice(0, 6) + '-' + value.slice(6);
  } else if (value.length === 13) {
    value = value.slice(0, 7) + '-' + value.slice(7);
  }

  return value.slice(0, 15); // max 15 characters
}

// Attach live phone formatting to input fields
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

// --- Main App Logic ---

const contactForm = document.getElementById('contact-form');
const contactTableBody = document.querySelector('#contact-table tbody');
const exportButton = document.getElementById('exportVCF');
const clearButton = document.getElementById('clearAll');

let contacts = [];

// Attach phone formatter to input fields
attachPhoneFormatter(document.getElementById('phone1'));
attachPhoneFormatter(document.getElementById('phone2'));

// Handle form submission
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let phone1 = document.getElementById('phone1').value.trim();
  let phone2 = document.getElementById('phone2').value.trim();

  // Clean and fix phone numbers properly
  phone1 = applyPhoneFormat(phone1);
  phone2 = applyPhoneFormat(phone2);

  const contact = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    company: document.getElementById('company').value.trim(),
    phone1: phone1,
    phone2: phone2,
    email: document.getElementById('email').value.trim(),
    address: document.getElementById('address').value.trim(),
    category: document.getElementById('category').value.trim(),
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

  contacts.splice(index, 1); // Remove from list to allow re-saving
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
  if (contact.photoBase64) vcf += `PHOTO;ENCODING=b;TYPE=JPEG:${contact.photoBase64}\n`;

  vcf += "END:VCARD\n";

  return vcf;
}

// Clear all contacts
clearButton.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all contacts?')) {
    contacts = [];
    renderContacts();
  }
});
