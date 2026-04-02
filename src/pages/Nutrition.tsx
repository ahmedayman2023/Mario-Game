import React, { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Activity, Pencil, X, Timer, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../lib/AuthContext';

interface NutritionItem {
  id: string;
  product: string;
  cost: number;
  quantity: string;
  time?: string;
  userId: string;
  createdAt: number;
}

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
  const { user } = useAuth();
  const [items, setItems] = useState<NutritionItem[]>([]);
  
  // New Item State
  const [newProduct, setNewProduct] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newTime, setNewTime] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editTime, setEditTime] = useState('');
  
  // Cooldown Timer States
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Fetch items from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'nutritionItems'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems: NutritionItem[] = [];
      snapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() } as NutritionItem);
      });
      // Sort by createdAt descending
      fetchedItems.sort((a, b) => b.createdAt - a.createdAt);
      setItems(fetchedItems);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch user cooldown state
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCooldownEndTime(data.cooldownEndTime || null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Effect to handle the countdown tick
  useEffect(() => {
    if (!cooldownEndTime || !user) return;

    const updateTimer = async () => {
      const now = Date.now();
      const remaining = cooldownEndTime - now;
      
      if (remaining <= 0) {
        // Timer finished!
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { cooldownEndTime: null });
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cooldownEndTime, user]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.trim() || !newCost.trim() || !newQuantity.trim() || !newTime.trim() || !user) return;
    
    const costNum = parseFloat(newCost);
    if (isNaN(costNum)) return;

    const newItemData = {
      product: newProduct,
      cost: costNum,
      quantity: newQuantity,
      time: newTime,
      userId: user.uid,
      createdAt: Date.now()
    };
    
    setNewProduct('');
    setNewCost('');
    setNewQuantity('');
    setNewTime('');
    
    try {
      await addDoc(collection(db, 'nutritionItems'), newItemData);
    } catch (error) {
      console.error("Error adding item", error);
    }
  };

  const deleteItem = async (id: string) => {
    // Optimistic update
    const previousItems = [...items];
    setItems(items.filter(item => item.id !== id));
    
    try {
      await deleteDoc(doc(db, 'nutritionItems', id));
    } catch (error) {
      console.error("Error deleting item", error);
      setItems(previousItems); // Revert on error
    }
  };

  const startEditing = (item: NutritionItem) => {
    setEditingId(item.id);
    setEditProduct(item.product);
    setEditCost(item.cost.toString());
    setEditQuantity(item.quantity);
    setEditTime(item.time || '');
  };

  const saveEdit = async () => {
    if (!editProduct.trim() || !editCost.trim() || !editQuantity.trim() || !editTime.trim() || !editingId) {
      setEditingId(null);
      return;
    }
    
    const costNum = parseFloat(editCost);
    if (isNaN(costNum)) return;

    const previousItems = [...items];
    // Optimistic update
    setItems(items.map(item => 
      item.id === editingId ? { ...item, product: editProduct, cost: costNum, quantity: editQuantity, time: editTime } : item
    ));
    
    const idToUpdate = editingId;
    setEditingId(null);
    
    try {
      await updateDoc(doc(db, 'nutritionItems', idToUpdate), { 
        product: editProduct, 
        cost: costNum, 
        quantity: editQuantity,
        time: editTime
      });
    } catch (error) {
      console.error("Error updating item", error);
      setItems(previousItems); // Revert on error
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditProduct('');
    setEditCost('');
    setEditQuantity('');
    setEditTime('');
  };

  const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-4 sm:p-6 h-full flex flex-col max-w-5xl mx-auto w-full"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center gap-2">
              <Zap className="text-broadcast-yellow" size={28} fill="currentColor" />
              جدول التغذية
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">تابع تكلفة وكمية المنتجات الغذائية أسبوعياً</p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10">
            <Activity className="text-mario-emerald" size={24} />
          </div>
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
              <div className="text-4xl sm:text-5xl font-black text-broadcast-yellow scoreboard-font tracking-wider drop-shadow-[0_0_10px_rgba(234,255,0,0.5)]">
                {formatTime(timeLeft)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Item Form */}
      <form onSubmit={addItem} className="mb-6 bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newProduct}
          onChange={(e) => setNewProduct(e.target.value)}
          placeholder="المنتج (مثال: عصير رمان)"
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
        />
        <input
          type="number"
          value={newCost}
          onChange={(e) => setNewCost(e.target.value)}
          placeholder="التكلفة"
          className="w-full sm:w-20 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
        />
        <input
          type="text"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          placeholder="الكمية في الاسبوع"
          className="w-full sm:w-32 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
        />
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="w-full sm:w-28 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
        />
        <button
          type="submit"
          disabled={!newProduct.trim() || !newCost.trim() || !newQuantity.trim() || !newTime.trim()}
          className="bg-broadcast-yellow text-stadium-blue px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1 hover:bg-broadcast-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm active:scale-95"
        >
          <Plus size={16} />
          <span>إضافة</span>
        </button>
      </form>

      {/* Table */}
      <div className="flex-1 overflow-hidden bg-white/5 border border-white/10 rounded-2xl flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-1/3">المنتج</th>
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-1/6">التكلفة</th>
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-1/4">الكمية</th>
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-1/6">الوقت</th>
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-16 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      لا توجد منتجات مضافة بعد.
                    </td>
                  </tr>
                ) : (
                  items.map(item => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      {editingId === item.id ? (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={editProduct}
                              onChange={(e) => setEditProduct(e.target.value)}
                              className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-broadcast-yellow"
                              autoFocus
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={editCost}
                              onChange={(e) => setEditCost(e.target.value)}
                              className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-broadcast-yellow"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-broadcast-yellow"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="time"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-broadcast-yellow"
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={saveEdit} className="p-1.5 bg-mario-emerald/20 text-mario-emerald rounded-lg hover:bg-mario-emerald/40 transition-colors">
                                <Check size={16} />
                              </button>
                              <button onClick={cancelEdit} className="p-1.5 bg-mario-red/20 text-mario-red rounded-lg hover:bg-mario-red/40 transition-colors">
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-2.5 text-white font-medium text-xs sm:text-sm">{item.product}</td>
                          <td className="px-3 py-2.5 text-slate-300 text-xs sm:text-sm">
                            <span className="text-broadcast-yellow font-bold mr-1">{item.cost}</span>
                            <span className="text-[10px] sm:text-xs">ج.م</span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-300 text-xs sm:text-sm">{item.quantity}</td>
                          <td className="px-3 py-2.5 text-slate-300 text-xs sm:text-sm" dir="ltr">{item.time || '--:--'}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => startEditing(item)}
                                className="text-slate-400 hover:text-broadcast-yellow p-1.5 rounded-lg hover:bg-broadcast-yellow/20 transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              <button 
                                onClick={() => deleteItem(item.id)}
                                className="text-slate-400 hover:text-mario-red p-1.5 rounded-lg hover:bg-mario-red/20 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
            <tfoot className="bg-black/60 border-t border-white/10">
              <tr>
                <td className="p-4 text-white font-bold text-left">الإجمالي:</td>
                <td className="p-4 text-broadcast-yellow font-black text-lg">
                  {totalCost} <span className="text-xs text-slate-400 font-normal">ج.م</span>
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
