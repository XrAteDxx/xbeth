document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // Example: send to backend API (update the URL to your backend endpoint)
  try {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();
    if (response.ok && result.success) {
      // Redirect or show success
      window.location.href = "dashboard.html";
    } else {
      document.getElementById('loginError').style.display = 'block';
      document.getElementById('loginError').textContent = result.message || "Invalid credentials.";
    }
  } catch (err) {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('loginError').textContent = "Login failed. Please try again later.";
  }
});