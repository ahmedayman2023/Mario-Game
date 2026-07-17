import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export class User {
  static async getMyUserData() {
    if (!auth.currentUser) return null;
    
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      // Create default user document
      const defaultData = { current_study_topic: '', cooldownEndTime: null };
      await setDoc(userRef, defaultData);
      
      // Seed default nutrition items
      const initialItems = [
        { product: 'عصير رمان', cost: 15, quantity: '3 مرات', time: '10:00' },
        { product: 'مياه فوارة', cost: 10, quantity: 'يومياً', time: '12:00' },
        { product: 'جزر وخيار مع جبنة', cost: 25, quantity: '4 مرات', time: '15:00' },
        { product: 'وجبة خفيفة لطاقة ممتدة', cost: 30, quantity: 'مرتين', time: '18:00' },
      ];
      
      const batchPromises = initialItems.map((item, index) => 
        addDoc(collection(db, 'nutritionItems'), {
          ...item,
          userId: auth.currentUser!.uid,
          createdAt: Date.now() - index // Ensure order is maintained
        })
      );
      
      await Promise.all(batchPromises);
      
      return defaultData;
    }
  }

  static async updateMyUserData(data: any) {
    if (!auth.currentUser) return null;
    
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, data);
    
    const updatedSnap = await getDoc(userRef);
    return updatedSnap.data();
  }
}
