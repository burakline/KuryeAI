import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Buradaki bilgileri Firebase Console -> Proje Ayarları -> SDK Setup kısmından almalısın.
// Eğer henüz projen yoksa, bunlar geçici olarak sistemi ayağa kaldırır ama veriler kaydedilmez.
const firebaseConfig = {
  apiKey: "AIzaSyB-ÖZEL-ANAHTARINIZ",
  authDomain: "kuryeai-demo.firebaseapp.com",
  projectId: "kuryeai-demo",
  storageBucket: "kuryeai-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef12345"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);