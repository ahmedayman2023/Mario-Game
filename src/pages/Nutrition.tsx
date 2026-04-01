import React, { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Flame, Droplets, Carrot, Battery, BatteryCharging, Check, Activity, Pencil, X, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NutritionItem {
  id: string;
  text: string;
  completed: boolean;
  iconType: 'drink' | 'food' | 'energy';
}

const initialItems: NutritionItem[] = [
  { id: '1', text: 'عصير رمان', completed: false, iconType: 'drink' },
  { id: '2', text: 'مياه فوارة', completed: false, iconType: 'drink' },
  { id: '3', text: 'جزر وخيار مع جبنة وعصرة ليمون', completed: false, iconType: 'food' },
  { id: '4', text: 'وجبة خفيفة لطاقة ممتدة', completed: false, iconType: 'energy' },
];

const getIcon = (type: string, completed: boolean) => {
  const size = 20;
  const colorClass = completed ? 'text-white' : 'text-slate-400';
  
  switch (type) {
    case 'drink': return <Droplets size={size} className={colorClass} />;
    case 'food': return <Carrot size={size} className={colorClass} />;
    case 'energy': return <BatteryCharging size={size} className={colorClass} />;
    default: return <Flame size={size} className={colorClass} />;
  }
};

const getCardColor = (type: string, completed: boolean) => {
  if (!completed) return 'bg-white/5 border-white/10 hover:bg-white/10';
  switch (type) {
    case 'drink': return 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
    case 'food': return 'bg-orange-500/20 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
    case 'energy': return 'bg-broadcast-yellow/20 border-broadcast-yellow/50 shadow-[0_0_10px_rgba(234,255,0,0.2)]';
    default: return 'bg-mario-emerald/20 border-mario-emerald/50 shadow-[0_0_10px_rgba(0,255,136,0.2)]';
  }
};

// Fast spring animation for snappiness
const snappySpring = { type: "spring", stiffness: 600, damping: 35, mass: 0.8 };

const formatTime = (ms: number) => {
  if (ms < 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function Nutrition() {
  const [items, setItems] = useState<NutritionItem[]>(initialItems);
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Cooldown Timer States
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const allCompleted = items.length > 0 && items.every(item => item.completed);

  // Effect to start/stop cooldown when all items are completed
  useEffect(() => {
    if (allCompleted && !cooldownEndTime) {
      // Set timer for 2 hours (2 * 60 * 60 * 1000 ms)
      setCooldownEndTime(Date.now() + 2 * 60 * 60 * 1000);
    } else if (!allCompleted && cooldownEndTime) {
      // Cancel timer if an item is unchecked or added
      setCooldownEndTime(null);
    }
  }, [allCompleted, cooldownEndTime]);

  // Effect to handle the countdown tick
  useEffect(() => {
    if (!cooldownEndTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = cooldownEndTime - now;
      
      if (remaining <= 0) {
        // Timer finished! Reset all tasks to uncompleted
        setItems(prev => prev.map(item => ({ ...item, completed: false })));
        setCooldownEndTime(null);
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cooldownEndTime]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    let iconType: 'drink' | 'food' | 'energy' = 'energy';
    if (newItemText.includes('ماء') || newItemText.includes('عصير') || newItemText.includes('قهوة')) iconType = 'drink';
    else if (newItemText.includes('تفاح') || newItemText.includes('موز') || newItemText.includes('وجبة') || newItemText.includes('جزر') || newItemText.includes('خيار') || newItemText.includes('جبنة')) iconType = 'food';

    const newItem: NutritionItem = {
      id: Date.now().toString(),
      text: newItemText,
      completed: false,
      iconType,
    };
    
    // Add to top for immediate feedback
    setItems([newItem, ...items]);
    setNewItemText('');
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const startEditing = (item: NutritionItem) => {
    setEditingId(item.id);
    setEditValue(item.text);
  };

  const saveEdit = () => {
    if (!editValue.trim() || !editingId) {
      setEditingId(null);
      return;
    }
    
    let iconType: 'drink' | 'food' | 'energy' = 'energy';
    if (editValue.includes('ماء') || editValue.includes('عصير') || editValue.includes('قهوة')) iconType = 'drink';
    else if (editValue.includes('تفاح') || editValue.includes('موز') || editValue.includes('وجبة') || editValue.includes('جزر') || editValue.includes('خيار') || editValue.includes('جبنة')) iconType = 'food';

    setItems(items.map(item => 
      item.id === editingId ? { ...item, text: editValue, iconType } : item
    ));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length === 0 ? 0 : (completedCount / items.length) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-4 sm:p-6 h-full flex flex-col max-w-4xl mx-auto w-full"
    >
      {/* Header & Stamina Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center gap-2">
              <Zap className="text-broadcast-yellow" size={28} fill="currentColor" />
              تكتيكات الطاقة
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">حافظ على لياقتك البدنية والذهنية طوال فترة المذاكرة</p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10">
            <Activity className="text-mario-emerald" size={24} />
          </div>
        </div>

        {/* Player Stamina Bar */}
        <div className="glass p-3 sm:p-4 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-end mb-2 relative z-10">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider scoreboard-font">مستوى اللياقة</span>
            <span className="text-xl font-black text-white scoreboard-font">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-black/50 rounded-full overflow-hidden relative z-10 border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-mario-emerald to-broadcast-yellow"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={snappySpring}
            />
          </div>
          {/* Background Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-mario-emerald/20 blur-3xl rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Cooldown Timer Banner */}
      <AnimatePresence>
        {cooldownEndTime && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24, scale: 1 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.95 }}
            className="overflow-hidden"
          >
            <div className="bg-stadium-blue/80 border border-broadcast-yellow/50 rounded-2xl p-6 text-center relative shadow-[0_0_30px_rgba(234,255,0,0.15)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,255,0,0.1)_0%,transparent_70%)] pointer-events-none" />
              <Timer className="mx-auto text-broadcast-yellow mb-3" size={36} />
              <h3 className="text-xl font-black text-white mb-2">فترة الاستشفاء</h3>
              <p className="text-slate-300 text-sm mb-4">أحسنت! لقد أكملت جميع مهام التغذية. ستتفتح المهام مرة أخرى بعد:</p>
              <div className="text-4xl sm:text-5xl font-black text-broadcast-yellow scoreboard-font tracking-wider drop-shadow-[0_0_10px_rgba(234,255,0,0.5)]">
                {formatTime(timeLeft)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Item Form */}
      <form onSubmit={addItem} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="أضف عنصراً جديداً للطاقة (مثال: قهوة، تفاحة)..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
        />
        <button
          type="submit"
          disabled={!newItemText.trim()}
          className="bg-broadcast-yellow text-stadium-blue px-5 rounded-xl font-bold flex items-center gap-2 hover:bg-broadcast-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-95"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">إضافة</span>
        </button>
      </form>

      {/* Tactical Cards Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        <motion.div 
          layout
          transition={snappySpring}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {items.map(item => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                transition={snappySpring}
                key={item.id}
                className={`group relative overflow-hidden rounded-2xl border transition-colors duration-200 ${getCardColor(item.iconType, item.completed)}`}
              >
                {editingId === item.id ? (
                  <div className="p-3 sm:p-4 flex items-center gap-2 relative z-10 h-full w-full">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-broadcast-yellow font-medium"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <button onClick={saveEdit} className="p-2 bg-mario-emerald/20 text-mario-emerald rounded-lg hover:bg-mario-emerald/40 transition-colors shrink-0 active:scale-90">
                      <Check size={18} />
                    </button>
                    <button onClick={cancelEdit} className="p-2 bg-mario-red/20 text-mario-red rounded-lg hover:bg-mario-red/40 transition-colors shrink-0 active:scale-90">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 flex items-center justify-between relative z-10 h-full">
                    <div className="flex items-center gap-3 flex-1">
                      <button 
                        onClick={() => toggleItem(item.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 active:scale-90 ${
                          item.completed 
                            ? 'bg-white/20 scale-105' 
                            : 'bg-black/30 hover:bg-black/50'
                        }`}
                      >
                        {item.completed ? <Check size={20} className="text-white" /> : getIcon(item.iconType, item.completed)}
                      </button>
                      <span className={`text-sm sm:text-base font-semibold transition-colors duration-200 ${
                        item.completed ? 'text-white' : 'text-slate-300'
                      } line-clamp-2`}>
                        {item.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute left-3 bg-black/60 p-1 rounded-xl backdrop-blur-md">
                      <button 
                        onClick={() => startEditing(item)}
                        className="text-slate-300 hover:text-broadcast-yellow p-1.5 rounded-lg hover:bg-broadcast-yellow/20 transition-colors active:scale-90"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="text-slate-300 hover:text-mario-red p-1.5 rounded-lg hover:bg-mario-red/20 transition-colors active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Completion Overlay Effect */}
                {item.completed && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {items.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-slate-500"
          >
            <Battery size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-slate-400 mb-1">لا توجد تكتيكات طاقة</h3>
            <p className="text-sm text-slate-500">أضف بعض الوقود لتستعد للمباراة!</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
