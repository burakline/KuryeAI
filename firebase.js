const firebaseConfig = {
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  databaseURL: "https://kuryeai-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kuryeai"
};

// Tek instance
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

window.auth = firebase.auth();
window.db = firebase.database();