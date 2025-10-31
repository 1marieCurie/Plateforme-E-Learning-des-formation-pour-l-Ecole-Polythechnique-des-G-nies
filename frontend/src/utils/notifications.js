// src/utils/notifications.js

// 🔔 Système de notifications pour les erreurs d'authentification
export const showNotification = (message, type = 'info') => {
  // Créer l'élément de notification
  const notification = document.createElement('div');
  notification.className = `
    fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300
    ${type === 'error' ? 'bg-red-500 text-white' : 
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'warning' ? 'bg-yellow-500 text-white' : 
      'bg-blue-500 text-white'}
  `;
  
  notification.innerHTML = `
    <div class="flex items-center">
      <span class="flex-1">${message}</span>
      <button class="ml-3 text-white hover:text-gray-200 focus:outline-none" onclick="this.parentElement.parentElement.remove()">
        ×
      </button>
    </div>
  `;
  
  // Ajouter au DOM
  document.body.appendChild(notification);
  
  // Animation d'entrée
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 100);
  
  // Suppression automatique après 5 secondes
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
};

// 🚨 Notification spécifique pour les erreurs d'authentification
export const notifyAuthError = (message = "Votre session a expiré. Vous allez être redirigé vers la page de connexion.") => {
  showNotification(message, 'error');
};

// ✅ Notification de succès
export const notifySuccess = (message) => {
  showNotification(message, 'success');
};

// ⚠️ Notification d'avertissement
export const notifyWarning = (message) => {
  showNotification(message, 'warning');
};

// ℹ️ Notification d'information
export const notifyInfo = (message) => {
  showNotification(message, 'info');
};
