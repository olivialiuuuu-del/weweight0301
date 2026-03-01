import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  LayoutDashboard, 
  Settings, 
  Plus, 
  ChevronRight, 
  Users,
  TrendingDown,
  Scale,
  Award,
  Heart,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { format, parseISO } from 'date-fns';

// --- Firebase 必要的引用 ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";

// --- 1. Firebase 初始化 (直接寫在裡面最簡單) ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 2. 這裡保留你原本的 UI 組件 (NumPad, Sparkline 等) ---
// (為了節省篇幅，我直接進入主要邏輯，UI 部分已包含在完整代碼中)

// ... [此處省略 UI 組件代碼，實際貼上時請使用我提供給你的完整檔案] ...

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 3. 修改後的資料獲取邏輯 ---
  const fetchData = async () => {
    try {
      // 讀取使用者 (ID 固定為 default_user)
      const userRef = doc(db, "users", "default_user");
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setUser(userSnap.data());
      } else {
        // 如果找不到使用者，自動建立一個初始值，避免畫面卡住
        const initialUser = {
          name: "Athlete",
          target_weight: 70,
          height: 175,
          points: 0,
          invite_code: "WE-" + Math.floor(Math.random()*1000)
        };
        await setDoc(userRef, initialUser);
        setUser(initialUser);
      }

      // 讀取體重紀錄 (最近 20 筆)
      const q = query(collection(db, "records"), orderBy("timestamp", "desc"), limit(20));
      const querySnapshot = await getDocs(q);
      const r = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(r);

    } catch (err) {
      console.error("Firebase 讀取錯誤:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 4. 修改後的新增紀錄邏輯 ---
  const handleAddRecord = async (weight: number) => {
    try {
      await addDoc(collection(db, "records"), {
        weight: weight,
        timestamp: new Date().toISOString()
      });
      fetchData(); // 重新整理
    } catch (e) {
      alert("儲存失敗");
    }
  };

  // --- 5. 修改後的更新設定邏輯 ---
  const handleUpdateUser = async (updates: any) => {
    if (!user) return;
    setUser({ ...user, ...updates });
    const userRef = doc(db, "users", "default_user");
    await updateDoc(userRef, updates);
  };

  // ... [後面接你原本的 Return UI 代碼] ...
