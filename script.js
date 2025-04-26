// --- Helper Functions ---

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

// --- Main App Logic ---

const contactForm = document.getElementById('contact-form');
const contactTableBody = document.querySelector('#contact-table tbody');
const exportButton = document.getElementById('exportVCF');
const clearButton = document.getElementById('clearAll');

let contacts = [];

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const photoInput = document.getElementById('photo');

  if (photoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const photoBase64 = e.target.result.split(',')[1]; // Remove data prefix
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

// --- Rest of your existing functions ---
// (renderContacts, editContact, generateVCF, exportVCF, clearAll)

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
