import React, { useState } from "react";
import LoginModal from "../components/LoginModal";
import TaskManager from "../components/TaskManager";
import UserPanel from "../components/UserPanel";
import { auth } from "../firebase";
import logo from "../assets/logo1.png";
import textImage from "../assets/TEXTO.png";
import "./HomePage.css";

const HomePage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleCloseModal = () => {
    setShowLogin(false);
  };

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setUser(user);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    auth.signOut();
  };

  // Define a classe dinamicamente com base no estado
  const homePageClass = isLoggedIn ? "home-page dashboard-background" : "home-page home-background";

  return (
    <div className={homePageClass}>
      {isLoggedIn ? (
        <div style={styles.dashboard}>
          <div style={styles.userPanelContainer}>
            <UserPanel user={user} />
          </div>
          <div style={styles.taskManagerContainer}>
            <TaskManager userId={user.uid} />
          </div>
        </div>
      ) : (
        <>
          <main className="welcome-section">
            <img src={logo} alt="WorkWave Logo" className="welcome-logo" />
            <img
              src={textImage}
              alt="O seu Gerenciador de Tarefas"
              className="welcome-text"
            />
            <button className="login-button" onClick={handleLoginClick}></button>
          </main>
          {showLogin && (
            <div className="login-modal-container">
              <LoginModal
                onClose={handleCloseModal}
                onLoginSuccess={handleLoginSuccess}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  dashboard: {
    display: "flex",
    justifyContent: "space-around",
    width: "100%",
  },
  userPanelContainer: {
    flexBasis: "25%",
  },
  taskManagerContainer: {
    flexBasis: "70%",
  },
};

export default HomePage;
