document.getElementById('exportBtn').addEventListener('click', async () => {
  // Obtener cookies de instagram.com
  const cookies = await chrome.cookies.getAll({ url: "https://instagram.com" });
  
  // Filtrar solo las necesarias
  const needed = ['sessionid', 'ds_user_id', 'csrftoken'];
  const filtered = cookies
    .filter(c => needed.includes(c.name))
    .map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path
    }));
  
  const json = JSON.stringify(filtered, null, 2);
  
  // Mostrar en textarea
  document.getElementById('output').value = json;
  
  // Copiar al portapapeles
  await navigator.clipboard.writeText(json);
  
  document.getElementById('status').textContent = '✓ Copiado al portapapeles!';
  
  // Guardar en archivo (opcional)
  // Puedes pegar esto directamente en cookies/session_cookies.json
});