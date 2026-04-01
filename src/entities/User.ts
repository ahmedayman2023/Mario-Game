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
        { text: 'عصير رمان', iconType: 'drink' },
        { text: 'مياه فوارة', iconType: 'drink' },
        { text: 'جزر وخيار مع جبنة وعصرة ليمون', iconType: 'food' },
        { text: 'وجبة خفيفة لطاقة ممتدة', iconType: 'energy' },
      ];
      
      const batchPromises = initialItems.map((item, index) => 
        addDoc(collection(db, 'nutritionItems'), {
          ...item,
          completed: false,
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
