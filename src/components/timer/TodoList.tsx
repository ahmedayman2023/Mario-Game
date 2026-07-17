import React, { useState, memo } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Todo } from '../../types';
import Modal from '../ui/Modal';

const TodoList = memo(function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'complete', id: number } | null>(null);

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

  const handleToggleClick = (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo && !todo.completed) {
      setConfirmAction({ type: 'complete', id });
    } else {
      toggleTodo(id);
    }
  };

  const handleDeleteClick = (id: number) => {
    setConfirmAction({ type: 'delete', id });
  };

  const confirmPendingAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'complete') {
      toggleTodo(confirmAction.id);
    } else if (confirmAction.type === 'delete') {
      deleteTodo(confirmAction.id);
    }
    setConfirmAction(null);
  };

  return (
    <div className="w-full bg-white border ink-border rounded-lg p-8 mb-12 shadow-sm paper-shadow">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Target size={14} className="text-primary" />
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">تكتيكات التعلم</h3>
        </div>
        <div className="text-[10px] font-bold text-success uppercase tracking-[0.2em]">
          {todos.filter((t) => t.completed).length} / {todos.length} أهداف
        </div>
      </div>

      <form onSubmit={addTodo} className="flex gap-3 mb-8">
        <input 
          type="text" 
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="تكتيك جديد..."
          className="flex-1 bg-paper border ink-border rounded-lg px-6 py-3 text-xs text-ink focus:outline-none focus:border-accent/50 transition-colors"
        />
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          className="bg-primary text-white px-8 rounded-lg shadow-sm font-bold uppercase text-[10px] tracking-widest hover:bg-primary/90 transition-colors border ink-border"
        >
          إضافة
        </motion.button>
      </form>
      
      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {todos.map(todo => (
            <motion.div 
              key={todo.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`group flex items-center justify-between p-5 rounded-lg border transition-all duration-300 ${
                todo.completed ? 'bg-success/5 border-success/20 opacity-60' : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div 
                className="flex items-center gap-6 flex-1 cursor-pointer"
                onClick={() => handleToggleClick(todo.id)}
              >
                {todo.completed ? (
                  <CheckCircle2 size={18} className="text-success" />
                ) : (
                  <Circle size={18} className="text-slate-200 group-hover:text-slate-300" />
                )}
                <span className={`text-sm font-serif transition-all ${todo.completed ? 'line-through text-slate-400 italic' : 'text-ink'}`}>
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => handleDeleteClick(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-danger transition-all"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {todos.length === 0 && (
          <div className="text-center py-12 text-slate-300 italic text-[10px] uppercase tracking-[0.2em]">
            لا توجد تكتيكات نشطة. خطط لمباراتك.
          </div>
        )}
      </div>

      <Modal 
        isOpen={confirmAction !== null} 
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === 'delete' ? 'تأكيد الحذف' : 'تأكيد الإنجاز'}
      >
        <div className="text-center">
          <p className="text-white mb-8">
            {confirmAction?.type === 'delete' 
              ? 'هل أنت متأكد من حذف هذا التكتيك نهائياً؟' 
              : 'هل أنت متأكد من إنجاز هذا التكتيك؟'}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setConfirmAction(null)}
              className="px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={confirmPendingAction}
              className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors ${
                confirmAction?.type === 'delete' 
                  ? 'bg-mario-red text-white hover:bg-mario-red/80' 
                  : 'bg-mario-emerald text-black hover:bg-mario-emerald/80'
              }`}
            >
              تأكيد
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default TodoList;
