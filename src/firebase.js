import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyASrOqYIciOmQG09y8z8lVhYLtYXVjSjAg",
  authDomain: "workwave-3bdb2.firebaseapp.com",
  projectId:  "workwave-3bdb2",
  storageBucket: "workwave-3bdb2.appspot.com",
  messagingSenderId: "483904691894",
  appId: "1:483904691894:web:ec765defa834674031d017",
   measurementId: "G-Z85H1C04P4"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); 
// Exporta a autenticação
export { db, auth, storage };