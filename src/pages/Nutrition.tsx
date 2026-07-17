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
            <stop offset="0%" stopColor="#e52521" />
            <stop offset="50%" stopColor="#fbd000" />
            <stop offset="100%" stopColor="#43b047" />
          </linearGradient>
        </defs>
        {/* Track Background */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="12" strokeLinecap="round" />
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
          <polygon points="-3,0 3,0 0,-75" fill="#000000" />
          <circle cx="0" cy="0" r="6" fill="#000000" />
          <circle cx="0" cy="0" r="3" fill="#fbd000" />
        </g>
      </svg>

      <div className="z-10 flex flex-col items-center mt-8 sm:mt-10">
        <span className="text-lg sm:text-xl font-pixel text-black leading-none">{clampedPercentage}%</span>
        <span className="text-[8px] sm:text-[10px] text-black/50 font-bold mt-1">الوقود</span>
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
        <h3 className={`text-lg font-black mb-4 ${colorClass} flex items-center gap-2 scoreboard-font`}>
          {title}
        </h3>
        <div className="bg-white mario-block-sm overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-3 py-2 font-black text-[10px] uppercase w-12 text-center">تم</th>
                <th className="px-3 py-2 font-black text-[10px] uppercase w-1/5">المنتج</th>
                <th className="px-3 py-2 font-black text-[10px] uppercase w-1/6">الهدف</th>
                <th className="px-3 py-2 font-black text-[10px] uppercase w-1/6">الكمية / يوم</th>
                <th className="px-3 py-2 font-black text-[10px] uppercase w-1/6">الكمية</th>
                <th className="px-3 py-2 font-black text-[10px] uppercase w-1/6">الوحدة</th>
                <th className="px-3 py-2 font-black text-[10px] uppercase w-1/6">الوقت</th>
                {macroField && <th className="px-3 py-2 font-black text-[10px] uppercase w-1/6">{macroLabel}</th>}
                <th className="px-3 py-2 font-black text-[10px] uppercase w-16 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10">
              <AnimatePresence mode="popLayout">
                {tableItems.map(item => (
                  <motion.tr
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group transition-colors ${item.isCompleted ? 'bg-mario-emerald/10' : 'hover:bg-mario-sky/5'}`}
                  >
                    {editingId === item.id ? (
                      <>
                        <td className="p-2 text-center"></td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editProduct}
                            onChange={(e) => setEditProduct(e.target.value)}
                            className="w-full bg-white border-2 border-black px-3 py-2 text-sm text-black focus:outline-none focus:border-mario-sky"
                            autoFocus
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editGoal}
                            onChange={(e) => setEditGoal(e.target.value)}
                            className="w-full bg-white border-2 border-black px-3 py-2 text-sm text-black focus:outline-none focus:border-mario-sky"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={editCost}
                            onChange={(e) => setEditCost(e.target.value)}
                            className="w-full bg-white border-2 border-black px-3 py-2 text-sm text-black focus:outline-none focus:border-mario-sky"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            className="w-full bg-white border-2 border-black px-3 py-2 text-sm text-black focus:outline-none focus:border-mario-sky"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={editUnit}
                            onChange={(e) => setEditUnit(e.target.value)}
                            className="w-full bg-white border-2 border-black px-3 py-2 text-sm text-black focus:outline-none focus:border-mario-sky"
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
                            className="w-full bg-white border-2 border-black px-3 py-2 text-sm text-black focus:outline-none focus:border-mario-sky"
                          />
                        </td>
                        {macroField && (
                          <td className="p-2">
                            <input
                              type="text"
                              value={editMacroValue}
                              onChange={(e) => setEditMacroValue(e.target.value)}
                              className="w-full bg-white border-2 border-black px-3 py-2 text-sm text-black focus:outline-none focus:border-mario-sky"
                            />
                          </td>
                        )}
                        <td className="p-2">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={saveEdit} className="p-1.5 bg-mario-emerald text-white border-2 border-black hover:brightness-110 transition-colors">
                              <Check size={16} />
                            </button>
                            <button onClick={cancelEdit} className="p-1.5 bg-mario-red text-white border-2 border-black hover:brightness-110 transition-colors">
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
                            className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto flex items-center justify-center border-2 border-black transition-colors ${item.isCompleted ? 'bg-mario-emerald text-white' : 'bg-white text-transparent hover:bg-mario-emerald/10'}`}
                          >
                            <Check size={14} className={item.isCompleted ? 'opacity-100' : 'opacity-0'} />
                          </button>
                        </td>
                        <td className={`px-3 py-2.5 text-black font-bold text-xs sm:text-sm transition-all ${item.isCompleted ? 'line-through text-black/40' : ''}`}>{item.product}</td>
                        <td className={`px-3 py-2.5 text-black/70 text-xs sm:text-sm transition-all ${item.isCompleted ? 'opacity-50' : ''}`}>{item.goal || '-'}</td>
                        <td className={`px-3 py-2.5 text-black/70 text-xs sm:text-sm transition-all ${item.isCompleted ? 'opacity-50' : ''}`}>
                          <span className="text-mario-red font-black mr-1">{item.cost}</span>
                        </td>
                        <td className={`px-3 py-2.5 text-black/70 text-xs sm:text-sm transition-all ${item.isCompleted ? 'opacity-50' : ''}`}>{item.quantity}</td>
                        <td className={`px-3 py-2.5 text-black/70 text-xs sm:text-sm transition-all ${item.isCompleted ? 'opacity-50' : ''}`}>{item.unit || '-'}</td>
                        <td className={`px-3 py-2.5 text-black/70 text-xs sm:text-sm transition-all ${item.isCompleted ? 'opacity-50' : ''}`} dir="ltr">{item.time || '--:--'}</td>
                        {macroField && (
                          <td className={`px-3 py-2.5 text-black/70 text-xs sm:text-sm transition-all ${item.isCompleted ? 'opacity-50' : ''}`}>{item[macroField] || '-'}</td>
                        )}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditing(item)}
                              className="text-black/50 hover:text-mario-sky p-1.5 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="text-black/50 hover:text-mario-red p-1.5 transition-colors"
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
            <tfoot className="bg-black/5 border-t-2 border-black">
              <tr>
                <td colSpan={3} className="p-4 text-black font-black text-left">الإجمالي:</td>
                <td className="p-4 text-mario-red font-pixel text-base">
                  {tableTotalCost}
                </td>
                <td colSpan={3}></td>
                {macroField && (
                  <td className={`p-4 font-black text-lg ${colorClass}`}>
                    {formattedTotalMacro} <span className="text-xs text-black/50 font-normal">جم</span>
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
      <div className="mb-6 bg-black mario-block p-4 sm:p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white mb-2 flex items-center gap-2 scoreboard-font">
            <Zap className="text-mario-yellow" size={26} fill="currentColor" />
            جدول التغذية
          </h1>
          <p className="text-white/50 text-xs sm:text-sm font-bold">تابع تكلفة وكمية المنتجات الغذائية أسبوعياً</p>
        </div>
        <div className="flex items-center justify-center bg-white rounded-full mario-block-sm">
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
            <div className="bg-mario-yellow mario-block p-6 text-center relative">
              <Timer className="mx-auto text-black mb-3" size={36} />
              <h3 className="text-xl font-black text-black mb-2 scoreboard-font">فترة الاستشفاء</h3>
              <div className="text-4xl sm:text-5xl font-pixel text-black tracking-wider">
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
            className={`mario-btn px-4 py-2 font-black whitespace-nowrap ${selectedDay === day ? 'bg-mario-yellow text-black' : 'bg-white text-black'}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Add Item Form */}
      <form onSubmit={addItem} className="mb-6 bg-white mario-block-sm p-3 flex flex-col sm:flex-row flex-wrap gap-2">
        <input
          type="text"
          value={newProduct}
          onChange={(e) => setNewProduct(e.target.value)}
          placeholder="المنتج (مثال: عصير رمان)"
          className="flex-1 min-w-[120px] bg-white border-2 border-black px-3 py-2 text-xs sm:text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-mario-sky transition-all font-medium"
        />
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="الهدف"
          className="w-full sm:w-24 bg-white border-2 border-black px-3 py-2 text-xs sm:text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-mario-sky transition-all font-medium"
        />
        <input
          type="number"
          value={newCost}
          onChange={(e) => setNewCost(e.target.value)}
          placeholder="الكمية / يوم"
          className="w-full sm:w-24 bg-white border-2 border-black px-3 py-2 text-xs sm:text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-mario-sky transition-all font-medium"
        />
        <input
          type="text"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          placeholder="الكمية"
          className="w-full sm:w-24 bg-white border-2 border-black px-3 py-2 text-xs sm:text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-mario-sky transition-all font-medium"
        />
        <select
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          className="w-full sm:w-24 bg-white border-2 border-black px-3 py-2 text-xs sm:text-sm text-black focus:outline-none focus:border-mario-sky transition-all font-medium"
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
          className="w-full sm:w-24 bg-white border-2 border-black px-3 py-2 text-xs sm:text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-mario-sky transition-all font-medium"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="w-full sm:w-32 bg-white border-2 border-black px-3 py-2 text-xs sm:text-sm text-black focus:outline-none focus:border-mario-sky transition-all font-medium"
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
            className="w-full sm:w-32 bg-white border-2 border-black px-3 py-2 text-xs sm:text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-mario-sky transition-all font-medium"
          />
        )}
        <button
          type="submit"
          disabled={!newProduct.trim() || !newCost.trim() || !newQuantity.trim() || !newTime.trim()}
          className="mario-btn bg-mario-emerald text-white px-4 py-2 font-black flex items-center justify-center gap-1 text-xs sm:text-sm"
        >
          <Plus size={16} />
          <span>إضافة</span>
        </button>
      </form>

      {/* Summary Section */}
      <div className="flex justify-between items-center mb-6 bg-white mario-block-sm p-4">
        <h2 className="text-base sm:text-lg font-black text-black">إجمالي التكلفة / الكمية لليوم ({selectedDay})</h2>
        <div className="text-mario-red font-pixel text-xl sm:text-2xl">{totalCost}</div>
      </div>

      {/* Tables */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center text-black/40 font-bold bg-white mario-block-sm border-dashed">
          لا توجد منتجات مضافة في هذا اليوم.
        </div>
      ) : (
        <>
          {renderTable('protein', '🥩 جدول البروتين', 'text-purple-600', 'نسبة البروتين', 'protein')}
          {renderTable('fiber', '🥦 جدول الألياف', 'text-mario-emerald', 'نسبة الألياف', 'fiber')}
          {renderTable('complexCarbs', '🌾 جدول الكربوهيدرات المعقدة', 'text-mario-sky', 'نسبة الكربوهيدرات', 'complexCarbs')}
          {renderTable('sugarLevel', '🍎 جدول السكر الطبيعي', 'text-mario-red', 'نسبة السكر', 'sugarLevel')}
          {renderTable('general', '📋 عناصر أخرى', 'text-black/60', '', null)}
        </>
      )}

      {/* Meals Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-black mb-6 flex items-center gap-2 scoreboard-font">
          <Activity className="text-mario-sky" size={24} />
          الوجبات المجمعة
        </h2>

        {/* Create Meal Form */}
        <form onSubmit={addMeal} className="mb-6 bg-white mario-block-sm p-4">
          <h3 className="text-sm font-black text-black/70 mb-3">تكوين وجبة جديدة من عناصر اليوم ({selectedDay})</h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              placeholder="اسم الوجبة (مثال: وجبة الإفطار)"
              className="flex-1 bg-white border-2 border-black px-3 py-2 text-sm text-black focus:outline-none focus:border-mario-sky transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!newMealName.trim() || selectedMealItems.length === 0}
              className="mario-btn bg-mario-emerald text-white px-6 py-2 font-black flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span>حفظ الوجبة</span>
            </button>
          </div>

          <div className="bg-black/5 border-2 border-black/10 p-3 max-h-48 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <p className="text-black/40 text-sm text-center py-2 font-bold">لا توجد عناصر متاحة في هذا اليوم لتكوين وجبة.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filteredItems.map(item => (
                  <label key={item.id} className="flex items-center gap-2 p-2 hover:bg-mario-sky/10 cursor-pointer transition-colors border border-transparent hover:border-black/10">
                    <input
                      type="checkbox"
                      checked={selectedMealItems.includes(item.id)}
                      onChange={() => toggleMealItemSelection(item.id)}
                      className="w-4 h-4 border-black/30 bg-white text-mario-emerald focus:ring-mario-sky/50 focus:ring-offset-0"
                    />
                    <span className="text-sm text-black truncate flex-1">{item.product}</span>
                    <span className="text-xs text-black/50 bg-black/5 px-1.5 py-0.5 rounded">{item.category === 'protein' ? 'بروتين' : item.category === 'fiber' ? 'ألياف' : item.category === 'complexCarbs' ? 'كربوهيدرات' : item.category === 'sugarLevel' ? 'سكر' : 'عام'}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Display Meals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meals.filter(m => m.dayOfWeek === selectedDay).length === 0 ? (
            <div className="col-span-full p-8 text-center text-black/40 font-bold bg-white mario-block-sm border-dashed">
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
                <div key={meal.id} className="bg-white mario-block-sm p-4 flex flex-col relative group">
                  <button
                    onClick={() => deleteMeal(meal.id)}
                    className="absolute top-3 left-3 text-black/40 hover:text-mario-red p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>

                  <h3 className="text-lg font-black text-black mb-3 pr-2 border-r-4 border-mario-yellow">{meal.name}</h3>

                  <div className="flex-1 bg-black/5 p-3 mb-4 border-2 border-black/10">
                    <ul className="space-y-2">
                      {mealItems.map(item => (
                        <li key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-black">{item.product}</span>
                          <span className="text-black/50">{item.quantity} {item.unit}</span>
                        </li>
                      ))}
                      {mealItems.length === 0 && <li className="text-black/40 text-sm italic">تم حذف جميع عناصر هذه الوجبة.</li>}
                    </ul>
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-center bg-black/5 border-2 border-black/10 p-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-black/50">التكلفة</span>
                      <span className="text-sm font-black text-mario-red">{mealCost}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-black/50">بروتين</span>
                      <span className="text-sm font-black text-purple-600">{Math.round(mealProtein * 10)/10}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-black/50">ألياف</span>
                      <span className="text-sm font-black text-mario-emerald">{Math.round(mealFiber * 10)/10}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-black/50">كربوهيدرات</span>
                      <span className="text-sm font-black text-mario-sky">{Math.round(mealCarbs * 10)/10}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-black/50">سكر</span>
                      <span className="text-sm font-black text-mario-red">{Math.round(mealSugar * 10)/10}</span>
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
