import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Importando autenticação do Firebase

const CompleteTask = ({ task, onCompleteTask, onBack }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCompleteTask = async () => {
    // Obtém o usuário autenticado
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }

    // Certifique-se de que task e file estão definidos
    if (!task || !task.id) {
      console.error("Tarefa indefinida ou faltando ID.");
      alert("Erro: Tarefa inválida ou faltando informações.");
      return;
    }

    if (!file) {
      alert("Por favor, envie um arquivo de conclusão para marcar a tarefa como concluída.");
      return;
    }

    setIsSubmitting(true);

    const storageRef = ref(storage, `completed_tasks/completion_${task.id}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Erro ao fazer upload:', error);
        setIsSubmitting(false);
      },
      async () => {
        try {
          const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const updatedTask = {
            ...task,
            fileCompletionUrl: fileUrl,
            status: 'completed',
            userId: task.userId || user.uid, // Garante que o userId seja definido
          };

          // Atualizar a tarefa no Firebase
          const taskDoc = doc(db, 'users', updatedTask.userId, 'tasks', task.id);
          await updateDoc(taskDoc, updatedTask);

          onCompleteTask(updatedTask); // Notificar o TaskManager sobre a conclusão
        } catch (error) {
          console.error('Erro ao atualizar a tarefa no Firebase:', error);
          alert('Erro ao atualizar a tarefa no sistema. Tente novamente.');
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  };

  return (
    <div style={styles.card}>
      <h4>Concluir Tarefa: {task?.title ?? 'Tarefa sem título'}</h4>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
        style={styles.fileInput} 
      />
      {file && <progress value={uploadProgress} max="100" style={styles.progressBar} />}
      <button 
        onClick={handleCompleteTask} 
        style={styles.completeButton} 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : 'Concluir Tarefa'}
      </button>
      <button onClick={onBack} style={styles.backButton}>Voltar</button>
    </div>
  );
};

const styles = {
  card: { 
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
    maxWidth: '500px',
    margin: '0 auto',
  },
  fileInput: {
    marginTop: '10px',
  },
  progressBar: {
    marginTop: '10px',
    width: '100%',
  },
  completeButton: {
    padding: '8px 15px',
    backgroundColor: 'green',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  backButton: {
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default CompleteTask;
