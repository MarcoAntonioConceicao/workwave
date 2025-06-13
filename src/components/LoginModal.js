import React, { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import logo from "../assets/logo1.png";
import "./LoginModal.css";

const LoginModal = ({ onClose, onLoginSuccess, onRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const role = userData.role || "user";

        onLoginSuccess({ ...user, role });
      } else {
        console.error("Documento de usuário não encontrado.");
      }
    } catch (err) {
      setError("Erro ao fazer login: " + err.message);
    }
  };

  return (
    <div className="login-modal-content">
      {/* Substituindo o título pelo logo */}
      <img src={logo} alt="WorkWave Logo" className="login-logo" />
      <form onSubmit={handleLogin} className="login-form">
        <div className="input-container">
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-container">
          <input
            type="password"
            id="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="login-error">{error}</p>}
        <button type="submit" className="login-submit"></button>
      </form>
      <button className="register-button" onClick={onRegister}>
        Registre-se
      </button>
    </div>
  );
};

export default LoginModal;
