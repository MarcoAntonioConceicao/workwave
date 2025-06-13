import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const PermissionManager = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const userList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  const updateRole = async (userId, newRole) => {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, { role: newRole });
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gerenciar Permissões</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Papel</th>
            <th style={styles.th}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={styles.row}>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>{user.role}</td>
              <td style={styles.td}>
                <button
                  onClick={() => updateRole(user.id, "admin")}
                  style={styles.adminButton}
                >
                  Tornar Admin
                </button>
                <button
                  onClick={() => updateRole(user.id, "user")}
                  style={styles.userButton}
                >
                  Tornar Usuário
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    margin: "210px",
    padding: "49px",
    maxWidth: "800px",
    backgroundColor: 'rgba(255, 128, 147, 0.25)', // Background with 25% opacity
    borderRadius: "15px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    position: "relative", // Allows positioning within the container
  },
  title: {
    position: "absolute", // Absolute positioning to align it to the left
    top: "-70px", // Moves it above the table
    left: "0px", // Aligns it to the left inside the box
    fontSize: "1.8rem",
    color: "#fff", // White text for contrast
    fontWeight: "bold",
    
    padding: "5px 10px", // Adds some padding
    borderRadius: "10px", // Rounded edges
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px", // Adds spacing between the title and the table
  },
  th: {
    backgroundColor: "rgba(255, 192, 203, 0.9)", // Light pink for headers
    color: "#1e1e1e", // Dark text for readability
    textAlign: "left",
    padding: "10px",
    fontSize: "1rem",
  },
  td: {
    padding: "10px",
    color: "#fff", // White text for cells
    borderBottom: "1px solid rgba(255, 255, 255, 0.3)", // Subtle border
    fontSize: "0.9rem",
  },
  row: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Light row background
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)", // Highlight on hover
    },
  },
  adminButton: {
    backgroundColor: "#28a745", // Green for "Tornar Admin"
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "5px 10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.9rem",
    marginRight: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  userButton: {
    backgroundColor: "#ff8093", // Pink for "Tornar Usuário"
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "5px 10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.9rem",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
};

export default PermissionManager;
