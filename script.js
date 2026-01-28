// ----- Local Storage -----
const STORAGE_KEY = "contacts_v1";

// ----- State -----
let contacts = loadContacts();

// ----- DOM -----
const form = document.querySelector("#contactForm");
const nameInput = document.querySelector("#nameInput");
const phoneInput = document.querySelector("#phoneInput");
const contactList = document.querySelector("#contactList");
const errorMessage = document.querySelector("#errorMessage");
const clearBtn = document.querySelector("#clearBtn");



function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}

function saveContacts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

function loadContacts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * För att Skapa ny kontakt och hindra att man ska kunna skapa en tom kontakt
 */
function createContact(name, phone) {
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();

  if (trimmedName === "" || trimmedPhone === "") {
    showError("Du måste fylla i både namn och telefonnummer.");
    return;
  }

  clearError();

  const newContact = {
    id: crypto.randomUUID(),
    name: trimmedName,
    phone: trimmedPhone,
  };

  contacts.push(newContact);
  saveContacts();
  renderContacts();
}

/**
 * För att radera kontakt
 */
function deleteContact(id) {
  contacts = contacts.filter((c) => c.id !== id);
  saveContacts();
  renderContacts();
  clearError();
}

/**
 * För att uppdatera kontakt och visa felmeddelande om en användare skulle spara en tom kontakt
 */
function updateContact(id, newName, newPhone) {
  const trimmedName = newName.trim();
  const trimmedPhone = newPhone.trim();

  if (trimmedName === "" || trimmedPhone === "") {
    showError("Du kan inte spara en tom kontakt.");
    return false; // visar att sparning misslyckades
  }

  const index = contacts.findIndex((c) => c.id === id);
  if (index === -1) return false;

  contacts[index].name = trimmedName;
  contacts[index].phone = trimmedPhone;

  saveContacts();
  clearError();
  renderContacts();
  return true;
}

/**
 * Radera hela listan
 */
function clearAllContacts() {
  contacts = [];
  saveContacts();
  renderContacts();
  clearError();
}

/**
 * Bygg DOM-element för en kontakt (disabled inputs + knappar)
 */
function createContactElement(contact) {
  const wrapper = document.createElement("div");
  wrapper.className = "contact";
  wrapper.dataset.id = contact.id;

  const nameField = document.createElement("input");
  nameField.type = "text";
  nameField.value = contact.name;
  nameField.disabled = true;

  const phoneField = document.createElement("input");
  phoneField.type = "text";
  phoneField.value = contact.phone;
  phoneField.disabled = true;

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.textContent = "Ändra";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.textContent = "Radera";

  // Toggle edit / save
  editBtn.addEventListener("click", function () {
    const isLocked = nameField.disabled;

    if (isLocked) {
      // Gå in i edit-läge
      nameField.disabled = false;
      phoneField.disabled = false;
      editBtn.textContent = "Spara";
      clearError();
      nameField.focus();
      nameField.select();
      return;
    }

    // Försök spara
    const ok = updateContact(contact.id, nameField.value, phoneField.value);

 
    if (!ok) {
      nameField.focus();
    }
  });

  // Radera kontakt
  deleteBtn.addEventListener("click", function () {
    deleteContact(contact.id);
  });

  wrapper.appendChild(nameField);
  wrapper.appendChild(phoneField);
  wrapper.appendChild(editBtn);
  wrapper.appendChild(deleteBtn);

  return wrapper;
}

/**
 * Rendera hela listan från contacts-arrayen
 */
function renderContacts() {
  contactList.innerHTML = "";

  if (contacts.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Inga kontakter än.";
    contactList.appendChild(empty);
    return;
  }

  for (const contact of contacts) {
    contactList.appendChild(createContactElement(contact));
  }
}



form.addEventListener("submit", function (event) {
  event.preventDefault();
  createContact(nameInput.value, phoneInput.value);
  nameInput.value = "";
  phoneInput.value = "";
});

clearBtn.addEventListener("click", function () {
  clearAllContacts();
});

// Start
renderContacts();


