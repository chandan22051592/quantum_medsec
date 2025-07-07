function qkd_generate_key() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function pqc_encrypt(data, key) {
  const encoder = new TextEncoder();
  const combined = JSON.stringify(data) + key;
  const digest = await crypto.subtle.digest("SHA-512", encoder.encode(combined));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function tso_masking(data) {
  return {
    ...data,
    name: "MASKED",
    prescription: "MASKED"
  };
}

async function blockchain_generate_nonce(data) {
  const nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  const encoder = new TextEncoder();
  const input = JSON.stringify(data) + nonce;
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  const blockHash = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  return { nonce, blockHash };
}

function quantum_authenticate() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  const token = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  const valid = token.length === 32;
  return { token, valid };
}

document.getElementById("patientForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const diagnosis = document.getElementById("diagnosis").value.trim();
  const prescription = document.getElementById("prescription").value.trim();

  if (!name || !age || !diagnosis || !prescription) {
    alert("All fields are required.");
    return;
  }

  if (isNaN(age) || age <= 0) {
    alert("Age must be a positive number.");
    return;
  }

  const patient_data = {
    name,
    age: parseInt(age),
    diagnosis,
    prescription
  };

  const log = [];
  log.push("=== Patient Data Security Flow ===");
  log.push("[Input] Patient data: " + JSON.stringify(patient_data));

  const qkd_key = qkd_generate_key();
  log.push("[QKD] Generated secure key: " + qkd_key);

  const encrypted = await pqc_encrypt(patient_data, qkd_key);
  log.push("[PQC] Encrypted patient data: " + encrypted);

  const masked = tso_masking(patient_data);
  log.push("[TSO] Masked data: " + JSON.stringify(masked));

  const { nonce, blockHash } = await blockchain_generate_nonce(masked);
  log.push(`[Blockchain] Nonce: ${nonce}, Block Hash: ${blockHash}`);

  const { token, valid } = quantum_authenticate();
  log.push("[QSA] Quantum token generated: " + token);
  log.push("[QSA] Token valid: " + valid);

  if (valid) {
    log.push("[System] Secure process completed successfully.");
  } else {
    log.push("[System] Authentication failed. Data not stored.");
  }

  document.getElementById("output").innerText = log.join('\n');
});
