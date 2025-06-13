import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const TaskForm = ({ addTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [dueDate, setDueDate] = useState(''); // Campo para a data limite
  const [uploadProgress, setUploadProgress] = useState(0);
  const utcDueDate = dueDate ? new Date(dueDate + 'T00:00:00Z').toISOString() : null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    let fileUrl = '';

    // Verifica se o arquivo foi selecionado
    if (file) {
      const storageRef = ref(storage, `tasks/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitoramento de progresso
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Erro ao fazer upload:', error);
        },
        async () => {
          // Após o upload, obtenha o URL do arquivo
          fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const newTask = {
            id: Date.now(),
            title,
            description,
            fileUrl, // Armazena o URL do arquivo no Firestore
            dueDate, // Armazena a data limite
          };
          addTask(newTask);
          resetForm();
        }
      );
    } else {
      // Caso não tenha arquivo, apenas adiciona a tarefa
      const newTask = {
        id: Date.now(),
        title,
        description,
        fileUrl, // Será vazio se não houver arquivo
        dueDate, // Armazena a data limite
      };
      addTask(newTask);
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setDueDate(''); // Reseta o campo de data
    setUploadProgress(0);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.formContainer}>
      <label style={styles.label}>Título da Tarefa</label>
      <input 
        type="text" 
        placeholder="Título da Tarefa" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        required 
        style={styles.input}
      />
      
      <label style={styles.label}>Descrição da Tarefa</label>
      <textarea 
        placeholder="Descrição da Tarefa" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        required 
        style={styles.textarea}
      />

      <label style={styles.label}>Data Limite</label>
      <input 
        type="date" 
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)} 
        required 
        style={styles.input}
      />

      <label style={styles.label}>Anexar Arquivo</label>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
        style={styles.fileInput}
      />

      {file && <progress value={uploadProgress} max="100" style={styles.progressBar} />}

      <button type="submit" style={styles.submitButton}>Criar Tarefa</button>
    </form>
  );
};

const styles = {
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '400px',
    margin: '0 auto', // Centraliza o formulário na página
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: '15px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    width: '100%', // Garante que o input ocupe a largura total do container
  },
  textarea: {
    marginBottom: '15px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    width: '100%', // Garante que o textarea ocupe a largura total do container
    minHeight: '100px',
  },
  fileInput: {
    marginBottom: '15px',
  },
  progressBar: {
    marginBottom: '15px',
    width: '100%',
  },
  submitButton: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default TaskForm;