class User {
  constructor(email, name, phone, gender, address) {
    this.email = email;
    this.name = name;
    this.phone = phone;
    this.gender = gender;
    this.address = address;
  }
}

class UI {
  static addUserToList(User) {
    const list = document.querySelector("#user-list");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${User.email}</td> 
      <td>${User.name}</td>
      <td>${User.phone}</td>
      <td>${User.gender}</td>
      <td>${User.address}</td>`;
    list.appendChild(row);
  }

  static addUserCard(User) {
    const container = document.querySelector("#user-cards");

    const cards = document.createElement("div");
    cards.className = "col-md-4 mb-3";

    cards.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${User.name}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${User.email}</h6>
          <p class="card-text">
            <strong>Phone:</strong> ${User.phone}<br>
            <strong>Gender:</strong> ${User.gender}<br>
            <strong>Address:</strong> ${User.address}<br>
          </p>
        </div>
      </div>`;
    container.appendChild(cards);
  }
}

let usersArray = [];
const errorElemnt = document.getElementById("error");
const nameError = document.getElementById("nameError");
const successMessage = document.getElementById("successMessage");

document.querySelector("#userForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.querySelector("#email").value;
  const name = document.querySelector("#name").value;
  const phone = document.querySelector("#phone").value;
  const gender = document.querySelector("#gender").value;
  const address = document.querySelector("#address").value;

  let messages = [];

  if (!email.includes("@") || !email.includes(".")) {
    document.getElementById("email").classList.add("is-invalid");
    document.getElementById("emailError").innerText = "Email is invalid!";
    messages.push("Invalid email");
  } else {
    document.getElementById("email").classList.remove("is-invalid");
    document.getElementById("emailError").innerText = "";
  }

  if (name.length === 0) {
    document.getElementById("name").classList.add("is-invalid");
    nameError.innerText = "Please enter a valid name";
    messages.push("Name is empty");
  } else {
    document.getElementById("name").classList.remove("is-invalid");
    nameError.innerText = "";
  }

  let letters = true;
  for (let i = 0; i < name.length; i++) {
    let ch = name[i];
    if (!(ch >= "A" && ch <= "Z") && !(ch >= "a" && ch <= "z")) {
      letters = false;
    }
  }
  if (!letters) {
    messages.push("Name must contain letters only!");
  }

  let digits = true;
  for (let i = 0; i < phone.length; i++) {
    if (phone[i] < "0" || phone[i] > "9") {
      digits = false;
      break;
    }
  }

  if (phone.length < 10 || !digits) {
    document.getElementById("phone").classList.add("is-invalid");
    document.getElementById("phoneError").innerText =
      phone.length < 10
        ? "Phone number must be at least 10 digits!"
        : "Phone must contain numbers only!";
    messages.push("Invalid phone");
  } else {
    document.getElementById("phone").classList.remove("is-invalid");
    document.getElementById("phoneError").innerText = "";
  }

  if (gender === "") {
    document.getElementById("gender").classList.add("is-invalid");
    document.getElementById("genderError").innerText =
      "Please select a gender!";
    messages.push("Gender not selected");
  } else {
    document.getElementById("gender").classList.remove("is-invalid");
    document.getElementById("genderError").innerText = "";
  }

  if (address === "") {
    document.getElementById("address").classList.add("is-invalid");
    document.getElementById("addressError").innerText =
      "Address cannot be empty!";
    messages.push("Address is empty");
  } else {
    document.getElementById("address").classList.remove("is-invalid");
    document.getElementById("addressError").innerText = "";
  }

  if (messages.length > 0) {
   
    return;
  }

  const newUser = new User(email, name, phone, gender, address);
  usersArray.push(newUser);
  UI.addUserToList(newUser);
  UI.addUserCard(newUser);

  successMessage.classList.remove("d-none");
  setTimeout(() => {
    successMessage.classList.add("d-none");
  }, 3000);

  errorElemnt.classList.add("d-none");
  document.querySelector("#userForm").reset();
});
