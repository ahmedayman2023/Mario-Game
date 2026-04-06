import React, { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Activity, Pencil, X, Timer, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../lib/AuthContext';

interface NutritionItem {
  id: string;
  product: string;
  goal?: string;
  cost: number;
  quantity: string;
  unit?: string;
  time?: string;
  sugarLevel?: string;
  complexCarbs?: string;
  fiber?: string;
  protein?: string;
  dayOfWeek?: string;
  category?: string;
  isCompleted?: boolean;
  completedAt?: number | null;
  userId: string;
  createdAt: number;
}

interface Meal {
  id: string;
  name: string;
  itemIds: string[];
  dayOfWeek: string;
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

const ProgressGauge = ({ percentage }: { percentage: number }) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const normalizedValue = clampedPercentage / 100;
  const angle = normalizedValue * 180 - 90;

  return (
    <div className="relative w-32 h-20 sm:w-40 sm:h-24 flex flex-col items-center justify-end overflow-visible">
      <svg viewBox="0 0 200 120" className="absolute top-0 left-0 w-full h-full overflow-visible">
        <defs>
          <linearGradient id="fuel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        {/* Track Background */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
        {/* Colored Track */}
        <path 
          d="M 20 100 A 80 80 0 0 1 180 100" 
          fill="none" 
          stroke="url(#fuel)" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeDasharray="251.2" 
          strokeDashoffset={251.2 - (251.2 * normalizedValue)} 
          className="transition-all duration-1000 ease-out"
        />
        {/* Needle */}
        <g transform={`translate(100, 100) rotate(${angle})`} className="transition-transform duration-1000 ease-out">
          <polygon points="-3,0 3,0 0,-75" fill="#ffffff" />
          <circle cx="0" cy="0" r="6" fill="#ffffff" />
          <circle cx="0" cy="0" r="3" fill="#000000" />
        </g>
      </svg>
      
      <div className="z-10 flex flex-col items-center mt-8 sm:mt-10">
        <span className="text-lg sm:text-xl font-black text-white scoreboard-font leading-none">{clampedPercentage}%</span>
        <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold mt-1">الوقود</span>
      </div>
      
      <span className="absolute bottom-0 left-2 text-[10px] font-black text-mario-red">E</span>
      <span className="absolute bottom-0 right-2 text-[10px] font-black text-mario-emerald">F</span>
    </div>
  );
};

export default function Nutrition() {
  const { user } = useAuth();
  const [items, setItems] = useState<NutritionItem[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  
  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[new Date().getDay()]);
  
  // New Item State
  const [newProduct, setNewProduct] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] = useState('protein');
  const [newMacroValue, setNewMacroValue] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState('');
  const [editGoal, setEditGoal] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editMacroValue, setEditMacroValue] = useState('');
  
  // Cooldown Timer States
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  // Current Time for Fuel Calculation
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Meal State
  const [newMealName, setNewMealName] = useState('');
  const [selectedMealItems, setSelectedMealItems] = useState<string[]>([]);

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

  // Fetch meals from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'meals'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMeals: Meal[] = [];
      snapshot.forEach((doc) => {
        fetchedMeals.push({ id: doc.id, ...doc.data() } as Meal);
      });
      fetchedMeals.sort((a, b) => b.createdAt - a.createdAt);
      setMeals(fetchedMeals);
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

  // Effect to update current time every minute for fuel calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.trim() || !newCost.trim() || !newQuantity.trim() || !newTime.trim() || !user) return;
    
    const costNum = parseFloat(newCost);
    if (isNaN(costNum)) return;

    const newItemData = {
      product: newProduct,
      goal: newGoal,
      cost: costNum,
      quantity: newQuantity,
      unit: newUnit,
      time: newTime,
      category: newCategory,
      protein: newCategory === 'protein' ? newMacroValue : '',
      fiber: newCategory === 'fiber' ? newMacroValue : '',
      complexCarbs: newCategory === 'complexCarbs' ? newMacroValue : '',
      sugarLevel: newCategory === 'sugarLevel' ? newMacroValue : '',
      dayOfWeek: selectedDay,
      userId: user.uid,
      createdAt: Date.now()
    };
    
    setNewProduct('');
    setNewGoal('');
    setNewCost('');
    setNewQuantity('');
    setNewUnit('');
    setNewTime('');
    setNewMacroValue('');
    
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
      // Also remove this item from any meals that contain it
      const mealsWithItem = meals.filter(m => m.itemIds.includes(id));
      for (const meal of mealsWithItem) {
        const updatedItemIds = meal.itemIds.filter(itemId => itemId !== id);
        if (updatedItemIds.length === 0) {
          // If meal is empty, delete it
          await deleteDoc(doc(db, 'meals', meal.id));
        } else {
          // Otherwise update it
          await updateDoc(doc(db, 'meals', meal.id), { itemIds: updatedItemIds });
        }
      }
    } catch (error) {
      console.error("Error deleting item", error);
      setItems(previousItems); // Revert on error
    }
  };

  const toggleCompletion = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    const previousItems = [...items];
    const now = Date.now();
    setItems(items.map(item => item.id === id ? { ...item, isCompleted: !currentStatus, completedAt: !currentStatus ? now : null } : item));
    
    try {
      await updateDoc(doc(db, 'nutritionItems', id), { 
        isCompleted: !currentStatus,
        completedAt: !currentStatus ? now : null
      });
    } catch (error) {
      console.error("Error toggling completion", error);
      setItems(previousItems); // Revert on error
    }
  };

  const startEditing = (item: NutritionItem) => {
    setEditingId(item.id);
    setEditProduct(item.product);
    setEditGoal(item.goal || '');
    setEditCost(item.cost.toString());
    setEditQuantity(item.quantity);
    setEditUnit(item.unit || '');
    setEditTime(item.time || '');
    
    const cat = item.category || (
      parseFloat(item.protein || '0') > 0 ? 'protein' :
      parseFloat(item.fiber || '0') > 0 ? 'fiber' :
      parseFloat(item.complexCarbs || '0') > 0 ? 'complexCarbs' :
      parseFloat(item.sugarLevel || '0') > 0 ? 'sugarLevel' : 'general'
    );
    setEditCategory(cat);
    setEditMacroValue(
      cat === 'protein' ? (item.protein || '') :
      cat === 'fiber' ? (item.fiber || '') :
      cat === 'complexCarbs' ? (item.complexCarbs || '') :
      cat === 'sugarLevel' ? (item.sugarLevel || '') : ''
    );
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
      item.id === editingId ? { 
        ...item, 
        product: editProduct, 
        goal: editGoal, 
        cost: costNum, 
        quantity: editQuantity, 
        unit: editUnit, 
        time: editTime,
        category: editCategory,
        protein: editCategory === 'protein' ? editMacroValue : '',
        fiber: editCategory === 'fiber' ? editMacroValue : '',
        complexCarbs: editCategory === 'complexCarbs' ? editMacroValue : '',
        sugarLevel: editCategory === 'sugarLevel' ? editMacroValue : ''
      } : item
    ));
    
    const idToUpdate = editingId;
    setEditingId(null);
    
    try {
      await updateDoc(doc(db, 'nutritionItems', idToUpdate), { 
        product: editProduct, 
        goal: editGoal,
        cost: costNum, 
        quantity: editQuantity,
        unit: editUnit,
        time: editTime,
        category: editCategory,
        protein: editCategory === 'protein' ? editMacroValue : '',
        fiber: editCategory === 'fiber' ? editMacroValue : '',
        complexCarbs: editCategory === 'complexCarbs' ? editMacroValue : '',
        sugarLevel: editCategory === 'sugarLevel' ? editMacroValue : ''
      });
    } catch (error) {
      console.error("Error updating item", error);
      setItems(previousItems); // Revert on error
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditProduct('');
    setEditGoal('');
    setEditCost('');
    setEditQuantity('');
    setEditUnit('');
    setEditTime('');
    setEditCategory('');
    setEditMacroValue('');
  };

  const filteredItems = items.filter(item => (item.dayOfWeek || 'السبت') === selectedDay);

  const totalCost = filteredItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  
  const completedItems = filteredItems.filter(item => item.isCompleted);
  const completedItemsCount = completedItems.length;
  const totalItemsCount = filteredItems.length;
  const basePercentage = totalItemsCount > 0 ? (completedItemsCount / totalItemsCount) * 100 : 0;

  let fuelPercentage = basePercentage;
  
  if (completedItemsCount > 0) {
    // Find the most recent completedAt
    const lastCompletedAt = Math.max(...completedItems.map(item => item.completedAt || item.createdAt || 0));
    
    if (lastCompletedAt > 0) {
      const hoursPassed = (currentTime - lastCompletedAt) / (1000 * 60 * 60);
      fuelPercentage = Math.max(0, basePercentage - (hoursPassed * 15));
    }
  }
  
  const displayPercentage = Math.round(fuelPercentage);

  const addMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim() || selectedMealItems.length === 0 || !user) return;

    const newMealData = {
      name: newMealName,
      itemIds: selectedMealItems,
      dayOfWeek: selectedDay,
      userId: user.uid,
      createdAt: Date.now()
    };

    setNewMealName('');
    setSelectedMealItems([]);

    try {
      await addDoc(collection(db, 'meals'), newMealData);
    } catch (error) {
      console.error("Error adding meal", error);
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'meals', id));
    } catch (error) {
      console.error("Error deleting meal", error);
    }
  };

  const toggleMealItemSelection = (itemId: string) => {
    setSelectedMealItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const renderTable = (
    categoryKey: string,
    title: string,
    colorClass: string,
    macroLabel: string,
    macroField: 'protein' | 'fiber' | 'complexCarbs' | 'sugarLevel' | null
  ) => {
    const tableItems = filteredItems.filter(item => {
      const cat = item.category || (
        parseFloat(item.protein || '0') > 0 ? 'protein' :
        parseFloat(item.fiber || '0') > 0 ? 'fiber' :
        parseFloat(item.complexCarbs || '0') > 0 ? 'complexCarbs' :
        parseFloat(item.sugarLevel || '0') > 0 ? 'sugarLevel' : 'general'
      );
      return cat === categoryKey;
    });

    if (tableItems.length === 0) return null;

    const tableTotalCost = tableItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    
    let formattedTotalMacro = null;
    if (macroField) {
      const totalMacro = tableItems.reduce((sum, item) => {
        const val = parseFloat(item[macroField] || '0');
        return sum + (item.cost / 100) * (isNaN(val) ? 0 : val);
      }, 0);
      formattedTotalMacro = Math.round(totalMacro * 10) / 10;
    }

    return (
      <div className="mb-8" key={categoryKey}>
        <h3 className={`text-xl font-bold mb-4 ${colorClass} flex items-center gap-2`}>
          {title}
        </h3>
        <div className="bg-black/20 border border-white/10 rounded-2xl overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-12 text-center">تم</th>
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-1/5">المنتج</th>
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-1/6">الهدف</th>
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-1/6">الكمية / يوم</th>
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-1/6">الكمية</th>
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-1/6">الوحدة</th>
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-1/6">الوقت</th>
                {macroField && <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-1/6">{macroLabel}</th>}
                <th className="px-3 py-2 text-slate-400 font-semibold text-xs sm:text-sm w-16 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {tableItems.map(item => (
                  <motion.tr 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group transition-colors ${item.isCompleted ? 'bg-mario-emerald/5' : 'hover:bg-white/5'}`}
                  >
                    {editingId === item.id ? (
                      <>
                        <td className="p-2 text-center"></td>
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
                            type="text"
                            value={editGoal}
                            onChange={(e) => setEditGoal(e.target.value)}
                            className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-broadcast-yellow"
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
                          <select
                            value={editUnit}
                            onChange={(e) => setEditUnit(e.target.value)}
                            className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-broadcast-yellow"
                          >
                            <option value="">-</option>
                            <option value="مل">مل</option>
                            <option value="جرام">جرام</option>
                            <option value="حبة">حبة</option>
                            <option value="كوب">كوب</option>
                            <option value="سكوب">سكوب</option>
                            <option value="لتر">لتر</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-broadcast-yellow"
                          />
                        </td>
                        {macroField && (
                          <td className="p-2">
                            <input
                              type="text"
                              value={editMacroValue}
                              onChange={(e) => setEditMacroValue(e.target.value)}
                              className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-broadcast-yellow"
                            />
                          </td>
                        )}
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
                        <td className="px-3 py-2.5 text-center">
                          <button 
                            onClick={() => toggleCompletion(item.id, !!item.isCompleted)}
                            className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto rounded-md flex items-center justify-center border transition-colors ${item.isCompleted ? 'bg-mario-emerald border-mario-emerald text-black' : 'border-white/20 hover:border-white/50 text-transparent'}`}
                          >
                            <Check size={14} className={item.isCompleted ? 'opacity-100' : 'opacity-0'} />
                          </button>
                        </td>
                        <td className={`px-3 py-2.5 text-white font-medium text-xs sm:text-sm transition-all ${item.isCompleted ? 'line-through text-slate-500' : ''}`}>{item.product}</td>
                        <td className={`px-3 py-2.5 text-slate-300 text-xs sm:text-sm transition-all ${item.isCompleted ? 'opacity-50' : ''}`}>{item.goal || '-'}</td>
                        <td className={`px-3 py-2.5 text-slate-300 text-xs sm:text-sm transition-all ${item.isCompleted ? 'opacity-50' : ''}`}>
                          <span className="text-broadcast-yellow font-bold mr-1">{item.cost}</span>
                        </td>
                        <td className={`px-3 py-2.5 text-slate-300 text-xs sm:text-sm transition-all ${item.isCompleted ? 'opacity-50' : ''}`}>{item.quantity}</td>
                        <td className={`px-3 py-2.5 text-slate-300 text-xs sm:text-sm transition-all ${item.isCompleted ? 'opacity-50' : ''}`}>{item.unit || '-'}</td>
                        <td className={`px-3 py-2.5 text-slate-300 text-xs sm:text-sm transition-all ${item.isCompleted ? 'opacity-50' : ''}`} dir="ltr">{item.time || '--:--'}</td>
                        {macroField && (
                          <td className={`px-3 py-2.5 text-slate-300 text-xs sm:text-sm transition-all ${item.isCompleted ? 'opacity-50' : ''}`}>{item[macroField] || '-'}</td>
                        )}
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
                ))}
              </AnimatePresence>
            </tbody>
            <tfoot className="bg-black/60 border-t border-white/10">
              <tr>
                <td colSpan={3} className="p-4 text-white font-bold text-left">الإجمالي:</td>
                <td className="p-4 text-broadcast-yellow font-black text-lg">
                  {tableTotalCost}
                </td>
                <td colSpan={3}></td>
                {macroField && (
                  <td className={`p-4 font-black text-lg ${colorClass}`}>
                    {formattedTotalMacro} <span className="text-xs text-slate-400 font-normal">جم</span>
                  </td>
                )}
                <td colSpan={1}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-4 sm:p-6 h-full flex flex-col max-w-5xl mx-auto w-full"
    >
      {/* Header */}
      <div className="mb-6 bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center gap-2">
            <Zap className="text-broadcast-yellow" size={28} fill="currentColor" />
            جدول التغذية
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">تابع تكلفة وكمية المنتجات الغذائية أسبوعياً</p>
        </div>
        <div className="flex items-center justify-center">
          <ProgressGauge percentage={displayPercentage} />
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

      {/* Days Selector */}
      <div className="flex overflow-x-auto gap-2 mb-4 pb-2 hide-scrollbar">
        {daysOfWeek.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${selectedDay === day ? 'bg-broadcast-yellow text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Add Item Form */}
      <form onSubmit={addItem} className="mb-6 bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col sm:flex-row flex-wrap gap-2">
        <input
          type="text"
          value={newProduct}
          onChange={(e) => setNewProduct(e.target.value)}
          placeholder="المنتج (مثال: عصير رمان)"
          className="flex-1 min-w-[120px] bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
        />
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="الهدف"
          className="w-full sm:w-24 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
        />
        <input
          type="number"
          value={newCost}
          onChange={(e) => setNewCost(e.target.value)}
          placeholder="الكمية / يوم"
          className="w-full sm:w-24 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
        />
        <input
          type="text"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          placeholder="الكمية"
          className="w-full sm:w-24 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
        />
        <select
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          className="w-full sm:w-24 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
        >
          <option value="">الوحدة</option>
          <option value="مل">مل</option>
          <option value="جرام">جرام</option>
          <option value="حبة">حبة</option>
          <option value="كوب">كوب</option>
          <option value="سكوب">سكوب</option>
          <option value="لتر">لتر</option>
        </select>
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="w-full sm:w-24 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="w-full sm:w-32 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
        >
          <option value="protein">بروتين</option>
          <option value="fiber">ألياف</option>
          <option value="complexCarbs">كربوهيدرات معقدة</option>
          <option value="sugarLevel">سكر طبيعي</option>
          <option value="general">عام / أخرى</option>
        </select>
        {newCategory !== 'general' && (
          <input
            type="text"
            value={newMacroValue}
            onChange={(e) => setNewMacroValue(e.target.value)}
            placeholder="النسبة لكل 100 وحدة"
            className="w-full sm:w-32 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
          />
        )}
        <button
          type="submit"
          disabled={!newProduct.trim() || !newCost.trim() || !newQuantity.trim() || !newTime.trim()}
          className="bg-broadcast-yellow text-stadium-blue px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1 hover:bg-broadcast-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm active:scale-95"
        >
          <Plus size={16} />
          <span>إضافة</span>
        </button>
      </form>

      {/* Summary Section */}
      <div className="flex justify-between items-center mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
        <h2 className="text-lg font-bold text-white">إجمالي التكلفة / الكمية لليوم ({selectedDay})</h2>
        <div className="text-broadcast-yellow font-black text-2xl">{totalCost}</div>
      </div>

      {/* Tables */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-black/20 border border-white/10 rounded-2xl">
          لا توجد منتجات مضافة في هذا اليوم.
        </div>
      ) : (
        <>
          {renderTable('protein', '🥩 جدول البروتين', 'text-purple-400', 'نسبة البروتين', 'protein')}
          {renderTable('fiber', '🥦 جدول الألياف', 'text-emerald-400', 'نسبة الألياف', 'fiber')}
          {renderTable('complexCarbs', '🌾 جدول الكربوهيدرات المعقدة', 'text-blue-400', 'نسبة الكربوهيدرات', 'complexCarbs')}
          {renderTable('sugarLevel', '🍎 جدول السكر الطبيعي', 'text-mario-red', 'نسبة السكر', 'sugarLevel')}
          {renderTable('general', '📋 عناصر أخرى', 'text-slate-400', '', null)}
        </>
      )}

      {/* Meals Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
          <Activity className="text-broadcast-yellow" size={24} />
          الوجبات المجمعة
        </h2>
        
        {/* Create Meal Form */}
        <form onSubmit={addMeal} className="mb-6 bg-white/5 border border-white/10 p-4 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-300 mb-3">تكوين وجبة جديدة من عناصر اليوم ({selectedDay})</h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              placeholder="اسم الوجبة (مثال: وجبة الإفطار)"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-broadcast-yellow/50 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!newMealName.trim() || selectedMealItems.length === 0}
              className="bg-broadcast-yellow text-stadium-blue px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-broadcast-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              <span>حفظ الوجبة</span>
            </button>
          </div>
          
          <div className="bg-black/20 rounded-xl p-3 border border-white/5 max-h-48 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-2">لا توجد عناصر متاحة في هذا اليوم لتكوين وجبة.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filteredItems.map(item => (
                  <label key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10">
                    <input 
                      type="checkbox" 
                      checked={selectedMealItems.includes(item.id)}
                      onChange={() => toggleMealItemSelection(item.id)}
                      className="w-4 h-4 rounded border-white/20 bg-black/40 text-broadcast-yellow focus:ring-broadcast-yellow/50 focus:ring-offset-0"
                    />
                    <span className="text-sm text-slate-300 truncate flex-1">{item.product}</span>
                    <span className="text-xs text-slate-500 bg-black/40 px-1.5 py-0.5 rounded">{item.category === 'protein' ? 'بروتين' : item.category === 'fiber' ? 'ألياف' : item.category === 'complexCarbs' ? 'كربوهيدرات' : item.category === 'sugarLevel' ? 'سكر' : 'عام'}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Display Meals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meals.filter(m => m.dayOfWeek === selectedDay).length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-500 bg-black/20 border border-white/10 rounded-2xl">
              لا توجد وجبات مجمعة في هذا اليوم.
            </div>
          ) : (
            meals.filter(m => m.dayOfWeek === selectedDay).map(meal => {
              // Get actual items for this meal
              const mealItems = meal.itemIds.map(id => items.find(i => i.id === id)).filter(Boolean) as NutritionItem[];
              
              // Calculate totals
              const mealCost = mealItems.reduce((sum, item) => sum + (item.cost || 0), 0);
              const mealProtein = mealItems.reduce((sum, item) => sum + (item.cost / 100) * (parseFloat(item.protein || '0') || 0), 0);
              const mealFiber = mealItems.reduce((sum, item) => sum + (item.cost / 100) * (parseFloat(item.fiber || '0') || 0), 0);
              const mealCarbs = mealItems.reduce((sum, item) => sum + (item.cost / 100) * (parseFloat(item.complexCarbs || '0') || 0), 0);
              const mealSugar = mealItems.reduce((sum, item) => sum + (item.cost / 100) * (parseFloat(item.sugarLevel || '0') || 0), 0);

              return (
                <div key={meal.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col relative group">
                  <button 
                    onClick={() => deleteMeal(meal.id)}
                    className="absolute top-3 left-3 text-slate-500 hover:text-mario-red p-1.5 rounded-lg hover:bg-mario-red/20 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <h3 className="text-xl font-bold text-white mb-3 pr-2 border-r-4 border-broadcast-yellow">{meal.name}</h3>
                  
                  <div className="flex-1 bg-black/20 rounded-xl p-3 mb-4">
                    <ul className="space-y-2">
                      {mealItems.map(item => (
                        <li key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">{item.product}</span>
                          <span className="text-slate-500">{item.quantity} {item.unit}</span>
                        </li>
                      ))}
                      {mealItems.length === 0 && <li className="text-slate-500 text-sm italic">تم حذف جميع عناصر هذه الوجبة.</li>}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 text-center bg-black/40 rounded-xl p-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">التكلفة</span>
                      <span className="text-sm font-bold text-broadcast-yellow">{mealCost}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">بروتين</span>
                      <span className="text-sm font-bold text-purple-400">{Math.round(mealProtein * 10)/10}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">ألياف</span>
                      <span className="text-sm font-bold text-emerald-400">{Math.round(mealFiber * 10)/10}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">كربوهيدرات</span>
                      <span className="text-sm font-bold text-blue-400">{Math.round(mealCarbs * 10)/10}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">سكر</span>
                      <span className="text-sm font-bold text-mario-red">{Math.round(mealSugar * 10)/10}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
