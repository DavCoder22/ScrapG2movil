// background.js
chrome.action.onClicked.addListener(async (tab) => {
  const cookies = await chrome.cookies.getAll({ url: "https://instagram.com" });
  
  const cookieData = cookies.map(c => ({
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path
  })).filter(c => 
    c.name === 'sessionid' || 
    c.name === 'ds_user_id' || 
    c.name === 'csrftoken'
  );
  
  const json = JSON.stringify(cookieData, null, 2);
  
  // Copiar al portapapeles
  navigator.clipboard.writeText(json);
  
  // Mostrar alerta
  chrome.tabs.sendMessage(tab.id, {
    action: "showMessage",
    message: "Cookies copiadas al portapapeles!"
  });
});