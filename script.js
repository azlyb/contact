// --- Utility Functions ---

// Formats phone numbers while typing/pasting
function applyPhoneFormat(value) {
  value = value.replace(/\D/g, ''); // remove all non-digits

  if (value.startsWith('6')) value = '+' + value;
  else value = '+6' + value;

  if (value.length > 5) value = value.slice(0, 5) + '-' + value.slice(5);
  if (value.length > 10) value = value.slice(0, 10) + ' ' + value.slice(10);

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

// Formats raw phone string for VCF export
function formatPhoneForVCF(raw) {
  if (!raw) return '';

  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10) return '';

  let formatted = '+6';
  formatted += digits.slice(0, 3) + '-';
  formatted += digits.slice(3, 7) + ' ';
  formatted += digits.slice(7, 11);

  return formatted;
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

  const contact = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    company: document.getElementById('company').value.trim(),
    phone1: document.getElementById('phone1').value.trim(),
    phone2: document.getElementById('phone2').value.trim(),
    email: document.getElementById('email').value.trim(),
    address: document.getElementById('address').value.trim(),
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
  vcf += `FN:${contact.firstName} ${contact.lastName}\n`;
  vcf += `N:${contact.lastName};${contact.firstName};;;\n`;
  if (contact.company) vcf += `ORG:${contact.company}\n`;

  const phone1Formatted = formatPhoneForVCF(contact.phone1);
  const phone2Formatted = formatPhoneForVCF(contact.phone2);

  if (phone1Formatted) vcf += `TEL;TYPE=CELL:${phone1Formatted}\n`;
  if (phone2Formatted) vcf += `TEL;TYPE=HOME:${phone2Formatted}\n`;

  if (contact.email) vcf += `EMAIL:${contact.email}\n`;
  if (contact.address) vcf += `ADR;TYPE=HOME:;;${contact.address};;;;\n`;

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
