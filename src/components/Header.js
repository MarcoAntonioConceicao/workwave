import React from 'react';
import logo from '../assets/logo1.png';

const Header = ({ onLoginClick, onLogoutClick, isLoggedIn }) => {
  return (
    <header style={styles.header}>
      <div style={styles.logoContainer}>
        <img src={logo} alt="logo" style={styles.logo} /> {/* Logo adicionada diretamente */}
        <h1 style={styles.title}>WorkWave</h1>
      </div>
      {isLoggedIn ? (
        <button style={styles.logoutButton} onClick={onLogoutClick}>
          Sair
        </button>
      ) : (
        <button style={styles.loginButton} onClick={onLoginClick}>
          Iniciar Sessão
        </button>
      )}
    </header>
  );
};

// Estilos para o Header
const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between', // Espaçar logo e botão
    alignItems: 'center', // Alinha os itens verticalmente no centro
    padding: '10px 30px', // Espaçamento nas laterais (30px para afastar da borda)
    backgroundColor: '#f8f9fa',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    position: 'fixed', // Fixa o header no topo
    top: 0, // Para garantir que fique no topo
    width: '100%', // Faz o header ocupar toda a largura da tela
    zIndex: 1000, // Certifica-se de que o header ficará sobreposto ao conteúdo
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center', // Mantém o logo e o título alinhados
    gap: '10px', // Espaço entre o logo e o texto
  },
  logo: {
    width: '40px', // Tamanho do logo
    height: '40px',
  },
  title: {
    margin: 0,
    fontSize: '1.5em',
  },
  loginButton: {
    padding: '10px 20px',
    fontSize: '1em',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '20px',
  },
  logoutButton: {
    padding: '10px 20px',
    fontSize: '1em',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Header;

