let userEmail = "";
const scriptURL = "https://script.google.com/macros/s/AKfycbzdgUx0I52TGvuNYfGQgaOyLvrbQqO413SPfVVAu0fJrthrD9AWX-G6OZQw8aUd9rmDQA/exec"; // <-- Replace with your actual Apps Script Web App URL

function onSignIn(response) {
  const credential = response.credential;
  const decoded = JSON.parse(atob(credential.split('.')[1]));
  userEmail = decoded.email;
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('main-section').classList.remove('hidden');
  document.getElementById('welcome').innerText = `Selamat datang, ${decoded.name}`;
}

async function searchRestaurant() {
  const name = document.getElementById('searchInput').value.trim();
  if (!name) return alert("Sila masukkan nama.");

  const res = await fetch(`${scriptURL}?name=${encodeURIComponent(name)}`);
  const data = await res.json();

  const resultDiv = document.getElementById('searchResult');
  resultDiv.innerHTML = "";
  resultDiv.classList.remove('hidden');

  if (data.matches && data.matches.length > 0) {
    resultDiv.innerHTML = `<strong>${data.matches.length} hasil dijumpai:</strong><ul>` +
      data.matches.map(x => `<li>${x.Name} – ${x.Type} (${x.District})</li>`).join('') +
      `</ul>`;
  } else {
    resultDiv.innerHTML = "<em>Tiada padanan dijumpai. Sila isi maklumat baharu.</em>";
    document.getElementById('formSection').classList.remove('hidden');
    document.getElementById('name').value = name;
  }
}

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

  const res = await fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });

  const result = await res.json();
  if (result.status === 'success') {
    alert("Maklumat berjaya dihantar.");
    document.getElementById('formSection').classList.add('hidden');
  } else if (result.status === 'duplicate') {
    alert("Rekod ini telah wujud.");
  } else {
    alert("Ralat semasa menghantar.");
  }
}
