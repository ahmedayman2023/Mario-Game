import React, { useState, memo } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Todo } from '../../types';

const TodoList = memo(function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
    setNewTodo('');
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="w-full bg-stadium-blue/80 border border-white/10 rounded-lg p-6 mb-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-broadcast-yellow" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] scoreboard-font">تكتيكات التعلم</h3>
        </div>
        <div className="text-[10px] font-black text-mario-emerald uppercase tracking-widest scoreboard-font">
          {todos.filter((t) => t.completed).length} / {todos.length} أهداف
        </div>
      </div>

      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="تكتيك جديد..."
          className="flex-1 bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-sm text-white focus:outline-none focus:border-broadcast-yellow/50 transition-colors"
        />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit" 
          className="bg-broadcast-yellow text-black px-4 rounded-sm shadow-lg font-black uppercase text-[10px] tracking-widest"
        >
          إضافة
        </motion.button>
      </form>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {todos.map(todo => (
            <motion.div 
              key={todo.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`group flex items-center justify-between p-4 rounded-sm border transition-all duration-300 ${
                todo.completed ? 'bg-mario-emerald/5 border-mario-emerald/20 opacity-60' : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.completed ? (
                  <CheckCircle2 size={20} className="text-mario-emerald" />
                ) : (
                  <Circle size={20} className="text-slate-600 group-hover:text-slate-400" />
                )}
                <span className={`text-sm font-medium transition-all scoreboard-font ${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-mario-red transition-all"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {todos.length === 0 && (
          <div className="text-center py-8 text-slate-600 italic text-[10px] uppercase tracking-widest scoreboard-font">
            لا توجد تكتيكات نشطة. خطط لمباراتك.
          </div>
        )}
      </div>
    </div>
  );
});

export default TodoList;
