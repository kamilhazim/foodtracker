let userEmail = "";
const scriptURL = "https://script.google.com/macros/s/AKfycbzdgUx0I52TGvuNYfGQgaOyLvrbQqO413SPfVVAu0fJrthrD9AWX-G6OZQw8aUd9rmDQA/exec";

// --- Google Sign-In ---
function onSignIn(response) {
  const credential = response.credential;
  const decoded = JSON.parse(atob(credential.split('.')[1]));
  userEmail = decoded.email;

  // Save login session
  localStorage.setItem("userEmail", decoded.email);
  localStorage.setItem("userName", decoded.name);

  showMain(decoded.name);
}

window.onload = () => {
  const email = localStorage.getItem("userEmail");
  const name = localStorage.getItem("userName");

  if (email && name) {
    userEmail = email;
    showMain(name);
  }
};

function showMain(name) {
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('main-section').classList.remove('hidden');
  document.getElementById('welcome').innerText = `Selamat datang, ${name}`;
}

function logout() {
  localStorage.clear();
  location.reload();
}

// --- SEARCH ---
async function searchRestaurant() {
  const name = document.getElementById('searchInput').value.trim();
  if (!name) return alert("Sila masukkan nama.");

  const resultDiv = document.getElementById('searchResult');
  resultDiv.innerHTML = "";
  resultDiv.classList.remove('hidden');
  document.getElementById('formSection').classList.add('hidden'); // Hide form by default

  try {
    const res = await fetch(`${scriptURL}?name=${encodeURIComponent(name)}`);
    const data = await res.json();

    if (data.matches && data.matches.length > 0) {
      resultDiv.innerHTML = `<strong>${data.matches.length} hasil dijumpai:</strong><ul>` +
        data.matches.map(x => 
          `<li><strong>${x.Name}</strong> – ${x.Type}<br>
          Tarikh: ${x["Meal Date"]} | Masa: ${x["Meal Time"]}<br>
          Dilaporkan oleh PKD: <strong>${x.District}</strong></li><br>`
        ).join('') +
        `</ul>`;
    } else {
      resultDiv.innerHTML = "<em>Tiada padanan dijumpai. Sila isi maklumat baharu.</em>";
      document.getElementById('formSection').classList.remove('hidden');
      document.getElementById('name').value = name;
    }
  } catch (err) {
    resultDiv.innerHTML = `<span style="color:red;">Ralat semasa mencari: ${err.message}</span>`;
  }
}

// --- FORM SUBMIT ---
async function submitForm() {
  const data = {
    name: document.getElementById('name').value.trim(),
    type: document.getElementById('type').value,
    full_address: document.getElementById('address').value.trim(),
    meal_date: document.getElementById('mealDate').value,
    meal_time: document.getElementById('mealTime').value,
    district: document.getElementById('district').value.trim(),
    ic_number: document.getElementById('ic').value.trim(),
    submitted_by: userEmail
  };

  if (!data.name || !data.full_address || !data.meal_date || !data.meal_time || !data.district || !data.ic_number) {
    alert("Sila lengkapkan semua ruangan.");
    return;
  }

  try {
    await fetch(scriptURL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assume success due to no-cors
    alert("Maklumat berjaya dihantar.");
    document.getElementById('formSection').classList.add('hidden');

  } catch (err) {
    alert("Ralat sambungan: " + err.message);
  }
}

// --- Show Form ---
function showForm() {
  const nameInput = document.getElementById('searchInput').value.trim();
  if (nameInput) {
    document.getElementById('name').value = nameInput;
  }
  document.getElementById('formSection').classList.remove('hidden');
}
