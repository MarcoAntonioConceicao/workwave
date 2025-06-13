import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';
import CommentSection from './CommentSection';

const TaskDetail = ({ task, userRole, onUpdateTask, onDeleteTask, onBack, onAssignTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState(task.title);
  const [updatedDescription, setUpdatedDescription] = useState(task.description);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  const handleUpdate = () => {
    const updatedTask = {
      ...task,
      title: updatedTitle,
      description: updatedDescription,
    };
    onUpdateTask(updatedTask);
    setIsEditing(false);
  };

  const handleAssignTask = () => {
    onAssignTask(task.id, selectedUser);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>{task.title}</h1>
      <div style={styles.taskBox}>
        <button
          onClick={() => setIsEditing(true)}
          style={styles.editButtonIcon}
        >
          <img
            src={require('../assets/EDIT.png')}
            alt="Edit"
            style={styles.editIcon}
          />
        </button>
        <div style={styles.taskContent}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={updatedTitle}
                onChange={(e) => setUpdatedTitle(e.target.value)}
                style={styles.input}
              />
              <textarea
                value={updatedDescription}
                onChange={(e) => setUpdatedDescription(e.target.value)}
                style={styles.textarea}
              />
              <button onClick={handleUpdate} style={styles.saveButton}>
                Salvar
              </button>
            </>
          ) : (
            <>
              <p style={styles.taskDescription}>{task.description}</p>
              {task.dueDate && (
                <p style={styles.taskDate}>
                  <strong>Data Limite:</strong> {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
              {task.fileUrl && (
                <a href={task.fileUrl} download style={styles.downloadLink}>
                  <img
                    src={require('../assets/ANEXO.png')}
                    alt="Download Icon"
                    style={styles.downloadBackground}
                  />
                  <span style={styles.downloadText}>Baixar Anexo</span>
                </a>
              )}
              <button onClick={onDeleteTask} style={styles.deleteButton}>
                Deletar Tarefa
              </button>
            </>
          )}

  {/* Condicional para exibir comentários e atribuição somente quando não estiver editando */}
  {!isEditing && (
            <>
              {userRole === 'admin' && (
                <div style={styles.assignmentSection}>
                  <label style={styles.assignmentLabel}>Atribuir a outro usuário:</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Selecione um usuário</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))}
                  </select>
                  <button onClick={handleAssignTask} style={styles.assignButton}>
                    Atribuir Tarefa
                  </button>
                </div>
              )}
              <div style={styles.commentSection}>
                <CommentSection taskId={task.id} />
              </div>
            </>
          )}
          <button onClick={onBack} style={styles.backButton}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};


const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '10px',
    width: '100%',
  },
  pageTitle: {
    fontSize: '32px',
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: '20px',
    alignSelf: 'flex-start', // Alinha o título à esquerda
    marginLeft: '25px', // Adiciona margem para afastar da borda
  },
  taskBox: {
    backgroundImage: `url(${require('../assets/BIG-BOX.png')})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    width: '100%',
    maxWidth: '1000px',
    minHeight: '700px',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  
  editButtonIcon: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  editIcon: {
    width: '30px',
    height: '30px',
  },
  taskContent: {
    width: '100%',
    marginTop: '40px',
  },
  taskDescription: {
    fontSize: '16px',
    color: '#fff',
    marginBottom: '10px',
  },
  taskDate: {
    position: 'absolute',
    top: '140px', // Positions date box near the top
    right: '20px', // Positions date box near the right
    minWidth: '80px',
    padding: '8px',
    backgroundColor: '#ff8093', // Pink background
    borderRadius: '5px',
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '12px', // Adjusted size for compact display
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  downloadLink: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    textDecoration: 'none',
  },
  downloadBackground: {
    position: 'absolute',
    width: '150px',
    height: '40px',
    top: '0',
    transform: 'translate(-0%, 55%)', // Slightly to the left and adjust exact center
    left: '0',
  },
  downloadText: {
    position: 'relative',
    color: '#000',
    fontWeight: 'bold',
    paddingLeft:'-10px',
    zIndex: 1,
    marginLeft: '15px',
    transform: 'translate(-5%, 155%)', // Slightly to the left and adjust exact center
    
  },
  deleteButton: {
    marginTop: '50px',
    padding: '10px',
    backgroundColor: '#dc3545',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '150px',
    height: '40px',
  },
  assignmentSection: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end', // Aligns content to the right
    width: '100%', // Ensures alignment spans the box
    paddingRight: '20px', // Adds padding to move it further to the right
  },
  assignmentLabel: {
    color: '#fff',
  },
  select: {
    margin: '10px 0',
  },
  assignButton: {
    padding: '10px',
    backgroundColor: '#6c757d', // Updates button color to gray
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '150px',
    height: '40px',
  },
  backButton: {
    marginTop: '20px',
    padding: '10px',
    width: '150px',
    height: '40px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  commentSection: {
    marginTop: '20px',
  },

  saveButton: {
    padding: '10px',
    backgroundColor: '#ff8093',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '150px',
    height: '40px',
    marginRight: '20px',
    
  },

  textarea: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    width: '95%', // Aligns with taskBox width
    height: '150px',
    fontSize: '16px',
    marginBottom: '20px',
  },

  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    width: '95%', // Aligns with taskBox width
    marginBottom: '15px',
    fontSize: '16px',
  },
};

export default TaskDetail;
