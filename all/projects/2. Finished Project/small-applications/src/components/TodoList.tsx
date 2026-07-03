import React, { useState, useEffect } from 'react';
import './css/project.css';

interface TodoItem {
  id: string;
  task: string;
}

const TodoList = () => {
  const [todo, setTodo] = useState<TodoItem[]>([]);
  const [task, setTask] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      setTodo(JSON.parse(saved));
    }
  }, []);

  const saveTodos = (newTodos: TodoItem[]) => {
    setTodo(newTodos);
    localStorage.setItem('todos', JSON.stringify(newTodos));
  };

  const handleAdd = () => {
    if (!task.trim()) return;
    const newTask = { id: Date.now().toString(), task };
    saveTodos([...todo, newTask]);
    setTask('');
  };

  const handleDelete = (id: string) => {
    saveTodos(todo.filter(t => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="project-page" style={{ maxWidth: '600px' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2 style={{ textAlign: 'center' }}>Todo List</h2>

      <div style={{ display: 'flex', gap: '10px', margin: '2rem 0' }}>
        <input 
          type="text" 
          placeholder="Enter your task" 
          value={task} 
          onKeyDown={handleKeyDown} 
          onChange={(e) => setTask(e.target.value)} 
          className="project-input"
          style={{ marginBottom: 0 }}
        />
        <button className="project-btn" onClick={handleAdd}>Add</button>
      </div>

      {todo.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
          No tasks yet. Add one above!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {todo.map((item) => (
            <div 
              key={item.id} 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px'
              }}
            >
              <span>{item.task}</span>
              <button 
                onClick={() => handleDelete(item.id)}
                style={{
                  background: 'var(--danger)',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;
