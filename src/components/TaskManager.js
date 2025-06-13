import React, { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import TaskDetail from './TaskDetail';
import CompleteTask from './CompleteTask'; // Importar o novo componente
import PermissionManager from './PermissionManager';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import gerenciadorImg from "../assets/GERENCIADOR.png";
import tarefaImg from "../assets/TAREFA.png";
import listaImg from "../assets/LISTA.png";
import bigBoxImage from '../assets/BIG-BOX.png';

const TaskManager = ({ userId }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [isManagingPermissions, setIsManagingPermissions] = useState(false); // Novo estado
  const [userRole, setUserRole] = useState(null);

  const handlePermissionManager = () => {
    setIsManagingPermissions(true);
    setIsCreatingTask(false);
    setSelectedTask(null);
    setIsCompletingTask(false);
  };
  useEffect(() => {
  
    const loadTasksAndRole = async () => {
      try {
        const role = await getUserRole(userId);
        setUserRole(role);

        const taskCollection = collection(db, 'users', userId, 'tasks');
        const taskSnapshot = await getDocs(taskCollection);
        const firebaseTasks = taskSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        setTasks(firebaseTasks);
      } catch (error) {
        console.error('Erro ao carregar tarefas ou papel do usuário: ', error);
      }
    };

    if (userId) {
      loadTasksAndRole();
    }
  }, [userId]);

  const addTask = async (newTask) => {
    try {
      const taskRef = await addDoc(collection(db, 'users', userId, 'tasks'), newTask);
      setTasks([...tasks, { ...newTask, id: taskRef.id }]);
    } catch (error) {
      console.error('Erro ao adicionar tarefa: ', error);
    }
    setIsCreatingTask(false);
  };

  const getUserRole = async (userId) => {
    try {
      const userDoc = doc(db, "users", userId);
      const userSnap = await getDoc(userDoc);
      return userSnap.exists() ? userSnap.data().role : null;
    } catch (error) {
      console.error("Erro ao obter o papel do usuário: ", error);
      return null;
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      const taskDoc = doc(db, 'users', userId, 'tasks', updatedTask.id);
      await updateDoc(taskDoc, updatedTask);
      setTasks(tasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
    } catch (error) {
      console.error('Erro ao atualizar tarefa: ', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const taskDocRef = doc(db, "users", userId, "tasks", taskId);
  
      // Referência para a coleção de comentários da tarefa
      const commentsCollectionRef = collection(db, "users", userId, "tasks", taskId, "comments");
      
      // Buscar e deletar todos os documentos na subcoleção "comments"
      const commentsSnapshot = await getDocs(commentsCollectionRef);
      const deletePromises = commentsSnapshot.docs.map((commentDoc) =>
        deleteDoc(commentDoc.ref)
      );
  
      await Promise.all(deletePromises); // Aguarda a exclusão de todos os comentários
  
      // Agora, deletar a tarefa principal
      await deleteDoc(taskDocRef);
  
      setTasks(tasks.filter(task => task.id !== taskId)); // Atualiza o estado local
      setSelectedTask(null);
      alert("Tarefa e comentários associados foram deletados com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar a tarefa e seus comentários:", error);
    }
  };
  
  const completeTask = async (updatedTask) => {
    try {
      const taskDoc = doc(db, 'users', userId, 'tasks', updatedTask.id);
      await updateDoc(taskDoc, updatedTask); // Atualiza a tarefa com o link do anexo e o status 'completed'
      setTasks(tasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
      setIsCompletingTask(false); // Sair da tela de completar tarefa
    } catch (error) {
      console.error('Erro ao concluir tarefa: ', error);
    }
  };

  const selectTaskForCompletion = (task) => {
    setSelectedTask(task);
    setIsCompletingTask(true); // Ativa o estado de completar tarefa
  };

  const assignTaskToUser = async (taskId, targetUserId) => {
    try {
      const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
      const targetTaskDoc = doc(db, 'users', targetUserId, 'tasks', taskId);
  
      // Clonar a tarefa para o novo usuário
      const taskSnapshot = await getDoc(taskDoc);
      const taskData = taskSnapshot.data();
  
      await setDoc(targetTaskDoc, {
        ...taskData,
        assignedBy: userId, // Quem atribuiu a tarefa
        assignedTo: targetUserId, // Para quem foi atribuída
        assignedToEmail: targetUserId.email || '', // Opcional: salva email para exibição
        status: 'assigned', // Marca como atribuída
      });
  
      // Atualizar tarefa no painel do usuário original para refletir que foi atribuída
      await updateDoc(taskDoc, { status: 'assigned' });
  
      setTasks(tasks.map(task => task.id === taskId ? { ...task, status: 'assigned', assignedTo: targetUserId } : task));
      alert('Tarefa atribuída com sucesso!');
    } catch (error) {
      console.error('Erro ao atribuir tarefa:', error);
    }
  };

  const selectTask = (task) => {
    setSelectedTask(task); // Apenas seleciona a tarefa para mostrar detalhes
    setIsCreatingTask(false);
    setIsCompletingTask(false); // Garante que estamos fora do estado de completar tarefa
  };

  const handleCreateTask = () => {
    setIsCreatingTask(true);
    setSelectedTask(null);
  };

  const handleBackToList = () => {
    setIsManagingPermissions(false);
    setIsCreatingTask(false);
    setSelectedTask(null);
    setIsCompletingTask(false);
  };

  
  return (
    <div style={styles.container}>
    <div style={styles.sidebar}>
      <div style={styles.buttonsContainer}>
        {/* Botão Listar Tarefas disponível para todos */}
        <img
          src={listaImg}
          alt="Listar Tarefas"
          onClick={handleBackToList}
          style={styles.sidebarImage}
        />
        
        {/* Botões exclusivos para administradores */}
        {userRole === 'admin' && (
          <>
            <img
              src={gerenciadorImg}
              alt="Gerenciar Permissões"
              onClick={handlePermissionManager}
              style={styles.sidebarImage}
            />
            <img
              src={tarefaImg}
              alt="Criar Tarefa"
              onClick={handleCreateTask}
              style={styles.sidebarImage}
            />
          </>
        )}
      </div>
    </div>
      <div style={styles.mainContent}>
        {!isCreatingTask && !isCompletingTask && !selectedTask && !isManagingPermissions && (
          <>
  <h3 style={styles.title}>Tarefas Recentes</h3>
      <div style={styles.taskBox}> {/* Novo contêiner */}
        <div style={styles.taskGrid}>
          {tasks.slice(0, 4).map((task) => (
            <div
            key={task.id}
            style={styles.taskCard}
            onClick={() => selectTask(task)}
          >
            <h4 style={styles.taskCardTitle}>{task.title}</h4>
            <p style={styles.taskDescription}>{task.description}</p> {/* Apply new style */}
            {task.status === 'completed' && <p style={styles.taskDescription}>(Concluída)</p>}
            {task.status === 'assigned' && <p style={styles.taskDescription}>(Atribuída)</p>}
            {/* Date Box in the top-right corner */}
            <div style={styles.taskDateBox}>
  <p style={styles.taskDateText}>
    {task.dueDate
      ? new Date(task.dueDate).toLocaleDateString() // Convert from UTC to local timezone
      : "Sem data"}
  </p>
</div>
              {/* Usuário atribuído pode concluir a tarefa */}
              {userRole !== 'admin' && task.assignedTo === userId && task.status !== 'completed' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Previne que o clique no botão afete o container
                    selectTaskForCompletion(task);
                  }}
                  style={styles.completeButton}
                >
                  Concluir Tarefa
                </button>
              )}
            </div>
            
          ))}
        </div>
      </div>
    </>
  )}

        {isManagingPermissions && <PermissionManager />}

        {isCompletingTask && selectedTask && (
          <CompleteTask
            task={selectedTask}
            onCompleteTask={completeTask}
            onBack={handleBackToList}
          />
        )}

        {isCreatingTask && userRole === 'admin' && <TaskForm addTask={addTask} />}

        {!isCompletingTask && selectedTask && (
          <TaskDetail
    task={selectedTask}
    userRole={userRole} // Passa o userRole para o TaskDetail
    onUpdateTask={updateTask}
    onDeleteTask={() => deleteTask(selectedTask.id)}
    onCompleteTask={completeTask}
    onAssignTask={assignTaskToUser}
    onBack={handleBackToList}
  />
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    padding: '0',
    backgroundColor: 'transparent', // Certifica o fundo preto uniforme
  },
  taskBox: {
    backgroundImage: `url(${bigBoxImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    width: '100%',
    maxWidth: '1394px', // Define a largura máxima similar à da imagem
    minHeight: '810px', // Define a altura mínima baseada na altura original da imagem
 
    margin: '-20px auto', // Centraliza horizontalmente e adiciona espaçamento vertical
    padding: '40px', // Garante espaço interno ao redor das tarefas
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // Alinha tarefas à esquerda
    justifyContent: 'flex-start', // Ajusta as tarefas para começar de cima
    gap: '0px', // Espaçamento entre as tarefas
    border: '2px solid rgba(255, 255, 255, 0.8)', // Adiciona borda branca translúcida
    borderRadius: '15px', // Arredondamento das bordas, conforme necessário
    boxSizing: 'border-box', // Inclui padding no tamanho total
},
  sidebar: {
    width: '200px',
    padding: '20px 10px',
    display: 'flex',
    paddingLeft: '10px',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent', // Permite o design de fundo aparecer
    gap: '20px',
    position: 'relative',
  },
  userProfile: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // Alinha os botões à esquerda
    gap: '10px',
    marginLeft: '0', // Remove espaçamento desnecessário
    paddingRight: '848px', // Pequeno afastamento para não colar no limite esquerdo
    marginTop: '400px',
  },
  sidebarImage: {
    cursor: 'pointer',
    marginBottom: '10px',
    alignSelf: 'flex-start', // Garante que cada botão seja alinhado à esquerda
  },

  
  mainContent: {
    flex: 1,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
    gap: '30px',
    backgroundColor: 'transparent', // Remove o fundo preto
  },
  taskDescription: {
    fontSize: '16px', // Set a default font size for descriptions
    marginTop: '5px', // Remove unnecessary space above the text
  },
  taskGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
  },
  title: {
    fontSize: '32px', // Increased font size for "TAREFAS RECENTES"
    fontWeight: '900', // Ensure it's bold
    marginBottom: '0px',
    marginTop: '10px',
    alignSelf: 'flex-start',
    color: '#fff', // Optional: Adjust text color
  },
  taskCard: {
    backgroundColor: '#ede9dd',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative', // Added to position date box
    height: '150px',
  },
  taskCardTitle: {
    fontSize: '40px', // Increased font size for the bold "ta"
    fontWeight: '900', // Ensure it's bold
    marginBottom: '0px', // Optional: Space below the title
    marginTop: '-2px',
  },

  taskDateBox: {
    position: 'absolute',
    top: '10px', // Positions date box near the top
    right: '10px', // Positions date box near the right
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
  taskDateText: {
    margin: 0,
  },

  completeButton: {
    position: "absolute",
    bottom: "10px",
    left: "850px",
    padding: "10px 15px",
    backgroundColor: "#d3d3d3",
    color: "#333",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },

};



export default TaskManager;
