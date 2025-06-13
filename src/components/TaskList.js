import React, { useState } from 'react';

const TaskList = ({ tasks, onTaskClick }) => {
  const [showCompleted, setShowCompleted] = useState(false);

  const filteredTasks = tasks.filter(task => showCompleted ? task.status === 'concluida' : true);

  return (
    <div>
      <h3>Suas Tarefas</h3>
      <div>
        <label>
          <input 
            type="checkbox" 
            checked={showCompleted} 
            onChange={(e) => setShowCompleted(e.target.checked)} 
          />
          Mostrar apenas tarefas concluídas
        </label>
      </div>
      <ul>
        {filteredTasks.map(task => (
          <li key={task.id} onClick={() => onTaskClick(task)} style={styles.taskItem}>
            {task.title} {task.status === 'concluida' && <span>(Concluída)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  taskItem: {
    cursor: 'pointer',
    padding: '10px',
    borderBottom: '1px solid #ccc',
    marginBottom: '5px'
  }
};

export default TaskList;
