import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus } from 'lucide-react';

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Focus on the task', completed: false },
    { id: 2, text: 'Stay hydrated', completed: false },
  ]);
  const [newTodo, setNewTodo] = useState('');

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
    setNewTodo('');
  };

  return (
    <div className="bg-slate-800/30 rounded-3xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CheckCircle2 size={20} className="text-emerald-500" />
        Tasks
      </h3>
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
        {todos.map(todo => (
          <div 
            key={todo.id} 
            onClick={() => toggleTodo(todo.id)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {todo.completed ? 
              <CheckCircle2 size={18} className="text-emerald-500" /> : 
              <Circle size={18} className="text-slate-600 group-hover:text-slate-400" />
            }
            <span className={todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
              {todo.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={addTodo} className="flex gap-2">
        <input 
          type="text" 
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="New task..."
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
        />
        <button type="submit" className="p-2 bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-colors">
          <Plus size={18} />
        </button>
      </form>
    </div>
  );
}
