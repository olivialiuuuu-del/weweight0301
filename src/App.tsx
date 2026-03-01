import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  LayoutDashboard, 
  Trophy, 
  Settings, 
  Plus, 
  ChevronRight, 
  Target, 
  Users,
  Eye,
  EyeOff,
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
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { cn, User, WeightRecord, Goal, Coupon } from './types';

// --- Components ---

const NumPad = ({ onInput, onDelete, onConfirm }: { onInput: (val: string) => void, onDelete: () => void, onConfirm: () => void }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'delete'];
  return (
    <div className="grid grid-cols-3 gap-4 p-8 bg-alo-bone">
      {keys.map((key) => (
        <motion.button
          key={key}
          whileTap={{ scale: 0.95 }}
          onClick={() => key === 'delete' ? onDelete() : onInput(key)}
          className={cn(
            "h-20 flex items-center justify-center text-2xl font-display rounded-2xl transition-all",
            key === 'delete' 
              ? "bg-alo-burgundy/5 text-alo-burgundy hover:bg-alo-burgundy/10" 
              : "bg-white text-alo-navy shadow-sm border border-alo-sand/30 hover:border-alo-gold/50"
          )}
        >
          {key === 'delete' ? <TrendingDown className="w-6 h-6 rotate-90" /> : key}
        </motion.button>
      ))}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onConfirm}
        className="col-span-3 h-20 bg-alo-navy text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] shadow-lg hover:bg-alo-ink transition-all"
      >
        Commit Record
      </motion.button>
    </div>
  );
};

const Sparkline = ({ data, color = "#1B263B" }: { data: WeightRecord[], color?: string }) => {
  const chartData = [...data].reverse().map(r => ({
    weight: r.weight,
    date: format(parseISO(r.timestamp), 'MM/dd')
  }));

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="weight" 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorWeight)" 
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Pages ---

const HomePage = ({ user, records, partnerRecords, onAddRecord }: { user: User, records: WeightRecord[], partnerRecords: WeightRecord[], onAddRecord: (w: number) => void }) => {
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'self' | 'partner'>('self');

  const handleInput = (val: string) => {
    if (val === '.' && inputValue.includes('.')) return;
    if (inputValue.length >= 5) return;
    setInputValue(prev => prev + val);
  };

  const handleDelete = () => {
    setInputValue(prev => prev.slice(0, -1));
  };

  const handleConfirm = () => {
    const weight = parseFloat(inputValue);
    if (!isNaN(weight)) {
      onAddRecord(weight);
      setIsEditing(false);
      setInputValue('');
    }
  };

  const displayRecords = viewMode === 'self' ? records : partnerRecords;
  const lastWeight = displayRecords[0]?.weight || 0;
  const diff = displayRecords.length > 1 ? lastWeight - displayRecords[1].weight : 0;
  const activeColor = viewMode === 'self' ? '#8A9A8E' : '#1B263B';

  return (
    <div className="flex flex-col h-full bg-alo-bone relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-alo-sand/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -left-32 w-96 h-96 bg-alo-sage/5 rounded-full blur-3xl" />

      {/* User Switcher - Refined */}
      {user.partner_id && (
        <div className="flex justify-center pt-10 px-6 z-10">
          <div className="bg-alo-sand/30 backdrop-blur-sm p-1 flex w-full max-w-[280px] rounded-full border border-white/50 shadow-sm">
            <button 
              onClick={() => setViewMode('self')}
              className={cn(
                "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-full",
                viewMode === 'self' ? "bg-white text-alo-navy shadow-sm" : "text-alo-slate/40"
              )}
            >
              {user.name}
            </button>
            <button 
              onClick={() => setViewMode('partner')}
              className={cn(
                "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-full",
                viewMode === 'partner' ? "bg-white text-alo-navy shadow-sm" : "text-alo-slate/40"
              )}
            >
              {user.partner_name}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-8 z-10 relative">
        {/* Vertical Decorative Text */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:block">
          <span className="vertical-text">EST. 2024 — ATHLETIC CLUB</span>
        </div>

        <motion.div 
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-1px bg-alo-gold/40 mb-4" />
            <span className="font-display italic text-3xl text-alo-slate/80">
              {viewMode === 'self' ? 'Personal Record' : 'Partner Metric'}
            </span>
            <p className="small-caps text-[8px] text-alo-gold/60 mt-2 tracking-[0.4em]">Excellence through Discipline</p>
          </div>
          
          <div 
            onClick={() => viewMode === 'self' && setIsEditing(true)}
            className={cn(
              "relative inline-block group",
              viewMode === 'self' ? "cursor-pointer" : "cursor-default"
            )}
          >
            <span className="text-[10rem] font-display font-light leading-none tracking-tighter text-alo-ink transition-transform group-hover:scale-[1.02] duration-500">
              {viewMode === 'self' ? (inputValue || lastWeight || '00.0') : (lastWeight || '--.-')}
            </span>
            <span className="text-xl font-display italic text-alo-gold absolute -right-12 bottom-6 tracking-widest">KG</span>
            
            {viewMode === 'self' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-alo-gold rounded-full"
              />
            )}
          </div>
          
          {diff !== 0 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-alo-sand" />
              <span className="small-caps text-alo-slate/60">
                {diff < 0 ? 'Surplus' : 'Deficit'} / {Math.abs(diff).toFixed(1)} KG
              </span>
              <div className="h-px w-8 bg-alo-sand" />
            </div>
          )}
        </motion.div>

        <div className="w-full soft-card mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Scale className="w-16 h-16 text-alo-navy" />
          </div>
          
          <div className="flex justify-between items-end mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-display italic text-alo-navy">Performance Trend</h3>
              <p className="small-caps mt-1">Biometric Analysis</p>
            </div>
            <div className="text-right">
              <p className="small-caps mb-1">Mean Weight</p>
              <p className="text-2xl font-display text-alo-ink">
                {(displayRecords.reduce((acc, r) => acc + r.weight, 0) / (displayRecords.length || 1)).toFixed(1)}
              </p>
            </div>
          </div>
          <Sparkline data={displayRecords.slice(0, 10)} color={activeColor} />
        </div>

        {user.partner_id && viewMode === 'self' && (
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => setViewMode('partner')}
            className="w-full flex items-center gap-6 p-8 bg-alo-navy text-white rounded-[24px] shadow-lg cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-alo-gold transition-colors">
              <Users className="w-5 h-5 text-alo-gold" />
            </div>
            <div className="flex-1">
              <p className="small-caps text-white/40 mb-1">Partner Insight</p>
              <p className="text-lg font-display italic">
                {user.partner_name} is {user.p_show_weight ? `${partnerRecords[0]?.weight || '--'} kg` : "active in session"}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-alo-gold transition-colors" />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-end bg-alo-navy/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-alo-bone rounded-t-[40px] shadow-2xl overflow-hidden border-t border-white/20"
            >
              <div className="p-10 flex justify-between items-center border-b border-alo-sand/50">
                <div className="flex flex-col">
                  <h2 className="text-3xl font-display italic text-alo-navy">Log Metric</h2>
                  <p className="small-caps mt-1">Weight Verification</p>
                </div>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="w-10 h-10 rounded-full bg-alo-sand/20 flex items-center justify-center text-alo-slate hover:bg-alo-sand/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-alo-cream/50 p-4">
                <NumPad 
                  onInput={handleInput} 
                  onDelete={handleDelete} 
                  onConfirm={handleConfirm} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardPage = ({ user, records, partnerRecords }: { user: User, records: WeightRecord[], partnerRecords: WeightRecord[] }) => {
  const currentWeight = records[0]?.weight || 0;
  const partnerWeight = partnerRecords[0]?.weight || 0;
  const bmi = user.height ? (currentWeight / Math.pow(user.height / 100, 2)).toFixed(1) : '0.0';
  const progress = Math.max(0, Math.min(100, 100 - (Math.abs(currentWeight - user.target_weight) / 10) * 100));

  const chartData = [...records].reverse().map(r => ({
    date: format(parseISO(r.timestamp), 'MMM dd'),
    self: r.weight,
  }));

  const combinedData = chartData.map(d => {
    const pRecord = partnerRecords.find(pr => format(parseISO(pr.timestamp), 'MMM dd') === d.date);
    return {
      ...d,
      partner: pRecord?.weight
    };
  });

  return (
    <div className="p-8 pt-16 space-y-10 pb-24 relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <LayoutDashboard className="w-24 h-24 text-alo-navy" />
      </div>

      <header className="relative z-10">
        <h1 className="text-5xl font-display italic text-alo-navy">Analytics</h1>
        <p className="small-caps mt-2">Biometric Performance Overview</p>
      </header>

      <div className="grid grid-cols-2 gap-6 relative z-10">
        <div className="soft-card bg-white border-none shadow-lg">
          <p className="small-caps text-alo-gold">Body Mass Index</p>
          <p className="text-5xl font-display text-alo-navy mt-3">{bmi}</p>
          <div className="mt-4 h-1 w-12 bg-alo-gold/20" />
        </div>
        <div className="soft-card bg-alo-navy text-white border-none shadow-lg">
          <p className="small-caps text-white/40">Partner Metric</p>
          <p className="text-5xl font-display mt-3">{user.p_show_weight ? partnerWeight : '--'}</p>
          <div className="mt-4 h-1 w-12 bg-white/10" />
        </div>
      </div>

      <div className="soft-card relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-display italic text-alo-navy">Objective Progress</h3>
            <p className="small-caps mt-1">Target Alignment</p>
          </div>
          <span className="text-sm font-display italic text-alo-gold">
            {Math.abs(currentWeight - user.target_weight).toFixed(1)} KG REMAINING
          </span>
        </div>
        <div className="relative h-1.5 bg-alo-sand/30 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="absolute inset-y-0 left-0 bg-alo-navy"
          />
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="small-caps text-alo-slate/30">Start</span>
          <span className="small-caps text-alo-slate/30">Target</span>
        </div>
      </div>

      <div className="soft-card relative z-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-display italic text-alo-navy">Comparative Analysis</h3>
            <p className="small-caps mt-1">Synchronized Metrics</p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-alo-navy" />
              <span className="small-caps">You</span>
            </div>
            {user.partner_id && user.p_show_chart && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-alo-gold" />
                <span className="small-caps">Partner</span>
              </div>
            )}
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData}>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
              <Line 
                type="monotone" 
                dataKey="self" 
                stroke="#1B263B" 
                strokeWidth={4} 
                dot={false}
              />
              {user.partner_id && user.p_show_chart && (
                <Line 
                  type="monotone" 
                  dataKey="partner" 
                  stroke="#C5A059" 
                  strokeWidth={4} 
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const GamificationPage = ({ user, goals, coupons }: { user: User, goals: Goal[], coupons: Coupon[] }) => {
  return (
    <div className="p-8 pt-16 space-y-12 pb-24 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-alo-gold/5 rounded-full blur-3xl" />
      
      <header className="relative z-10">
        <h1 className="text-5xl font-display italic text-alo-navy">Privileges</h1>
        <p className="small-caps mt-2">Club Rewards & Endeavors</p>
      </header>

      <section className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display italic text-alo-navy">Active Endeavors</h2>
          <div className="h-px flex-1 mx-6 bg-alo-sand/30" />
        </div>
        <div className="space-y-6">
          {goals.map(goal => (
            <div key={goal.id} className="soft-card group hover:border-alo-gold/30 transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display italic text-2xl text-alo-navy mb-1">{goal.title}</p>
                  <p className="small-caps text-alo-gold">Target: {goal.target_value}KG</p>
                </div>
                <div className={cn(
                  "px-5 py-2 rounded-full small-caps transition-all",
                  goal.completed 
                    ? "bg-alo-sage/10 text-alo-sage border border-alo-sage/20" 
                    : "bg-alo-sand/20 text-alo-slate/40 border border-transparent"
                )}>
                  {goal.completed ? 'Accomplished' : 'In Pursuit'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display italic text-alo-navy">Unlocked Privileges</h2>
          <div className="bg-alo-gold/10 px-5 py-2 rounded-full border border-alo-gold/20">
            <span className="small-caps text-alo-gold">{user.points} CREDITS</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {coupons.map(coupon => (
            <div key={coupon.id} className="soft-card border-l-4 border-alo-navy relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                <Award className="w-12 h-12 text-alo-navy" />
              </div>
              
              <h3 className="font-display italic text-3xl text-alo-navy mb-3">{coupon.title}</h3>
              <p className="text-sm text-alo-slate/60 mb-8 leading-relaxed italic font-display">{coupon.description}</p>
              
              <button 
                disabled={user.points < coupon.cost}
                className={cn(
                  "w-full py-4 rounded-xl small-caps transition-all shadow-sm",
                  user.points >= coupon.cost 
                    ? "bg-alo-navy text-white hover:bg-alo-ink hover:shadow-lg" 
                    : "bg-alo-sand/30 text-alo-slate/20 cursor-not-allowed"
                )}
              >
                Redeem / {coupon.cost} Credits
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Decorative Footer Quote */}
      <div className="pt-12 text-center opacity-20">
        <p className="font-display italic text-sm text-alo-slate">"Mens sana in corpore sano"</p>
      </div>
    </div>
  );
};

const SettingsPage = ({ user, onUpdateUser, onConnectPartner }: { user: User, onUpdateUser: (u: Partial<User>) => void, onConnectPartner: (code: string) => void }) => {
  const [inviteCode, setInviteCode] = useState('');

  return (
    <div className="p-8 pt-16 space-y-12 pb-24 relative">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Settings className="w-32 h-32 text-alo-navy" />
      </div>

      <header className="relative z-10">
        <h1 className="text-5xl font-display italic text-alo-navy">Concierge</h1>
        <p className="small-caps mt-2">Personalized Athlete Configuration</p>
      </header>

      <section className="space-y-6 relative z-10">
        <h2 className="small-caps text-alo-gold">Athlete Profile</h2>
        <div className="soft-card bg-white border-none shadow-lg">
          <div className="space-y-10">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-alo-navy rounded-full flex items-center justify-center shadow-inner">
                <Users className="w-8 h-8 text-alo-gold" />
              </div>
              <div>
                <p className="font-display italic text-3xl text-alo-navy">{user.name}</p>
                <p className="small-caps text-alo-gold mt-1">Stature: {user.height}CM</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="small-caps text-alo-slate/40">Target Metric</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={user.target_weight}
                    onChange={(e) => onUpdateUser({ target_weight: parseFloat(e.target.value) })}
                    className="w-full bg-alo-bone/50 rounded-xl border-none px-5 py-4 font-display text-xl text-alo-navy focus:ring-1 focus:ring-alo-gold transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 small-caps text-alo-slate/20">KG</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="small-caps text-alo-slate/40">Height Metric</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={user.height}
                    onChange={(e) => onUpdateUser({ height: parseFloat(e.target.value) })}
                    className="w-full bg-alo-bone/50 rounded-xl border-none px-5 py-4 font-display text-xl text-alo-navy focus:ring-1 focus:ring-alo-gold transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 small-caps text-alo-slate/20">CM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 relative z-10">
        <h2 className="small-caps text-alo-gold">Privacy Protocol</h2>
        <div className="soft-card bg-alo-navy text-white border-none shadow-xl">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-display italic">Metric Exposure</span>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Share Weight Data</p>
              </div>
              <button 
                onClick={() => onUpdateUser({ privacy_show_weight: user.privacy_show_weight ? 0 : 1 })}
                className={cn(
                  "w-14 h-7 rounded-full transition-all relative",
                  user.privacy_show_weight ? "bg-alo-gold" : "bg-white/10"
                )}
              >
                <motion.div 
                  animate={{ x: user.privacy_show_weight ? 30 : 4 }}
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                />
              </button>
            </div>
            <div className="h-px w-full bg-white/5" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-display italic">Progress Visibility</span>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Share Delta Metrics</p>
              </div>
              <button 
                onClick={() => onUpdateUser({ privacy_show_progress: user.privacy_show_progress ? 0 : 1 })}
                className={cn(
                  "w-14 h-7 rounded-full transition-all relative",
                  user.privacy_show_progress ? "bg-alo-gold" : "bg-white/10"
                )}
              >
                <motion.div 
                  animate={{ x: user.privacy_show_progress ? 30 : 4 }}
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 relative z-10">
        <h2 className="small-caps text-alo-gold">Team Connection</h2>
        <div className="soft-card bg-white border-none shadow-lg">
          <div className="space-y-10">
            <div>
              <p className="small-caps text-alo-slate/40 mb-4 text-center">Your Athlete Credential</p>
              <div className="bg-alo-bone/50 text-alo-navy font-display italic text-5xl p-10 text-center rounded-[24px] tracking-tighter shadow-inner border border-white">
                {user.invite_code}
              </div>
            </div>
            {!user.partner_id ? (
              <div className="space-y-4">
                <p className="small-caps text-alo-slate/40">Recruit Partner</p>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="ENTER CREDENTIAL"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="flex-1 bg-alo-bone/50 rounded-xl border-none px-5 py-4 font-display text-xl text-alo-navy focus:ring-1 focus:ring-alo-gold transition-all"
                  />
                  <button 
                    onClick={() => onConnectPartner(inviteCode)}
                    className="bg-alo-navy text-white px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-alo-ink transition-colors"
                  >
                    Link
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-8 bg-alo-gold/10 text-alo-gold rounded-[24px] border border-alo-gold/20">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Heart className="w-6 h-6 fill-alo-gold" />
                  </div>
                  <div>
                    <p className="small-caps text-alo-gold/60">Teamed With</p>
                    <span className="text-2xl font-display italic text-alo-navy">{user.partner_name}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'gamification' | 'settings'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [partnerRecords, setPartnerRecords] = useState<WeightRecord[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [uRes, rRes, prRes, gRes, cRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/records'),
        fetch('/api/partner/records'),
        fetch('/api/goals'),
        fetch('/api/coupons')
      ]);
      const u = await uRes.json();
      const r = await rRes.json();
      const pr = await prRes.json();
      const g = await gRes.json();
      const c = await cRes.json();
      setUser(u);
      setRecords(r);
      setPartnerRecords(pr);
      setGoals(g);
      setCoupons(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRecord = async (weight: number) => {
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight })
    });
    fetchData();
  };

  const handleUpdateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updates };
    setUser(newUser);
    await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
  };

  const handleConnectPartner = async (code: string) => {
    const res = await fetch('/api/partner/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: code })
    });
    if (res.ok) {
      fetchData();
    } else {
      alert("Invalid code");
    }
  };

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-alo-bone">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Scale className="w-8 h-8 text-alo-sage" />
          </div>
          <p className="text-xs font-bold text-alo-slate/40 tracking-[0.3em] uppercase">WeWeight</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen max-w-md mx-auto bg-alo-bone relative overflow-hidden flex flex-col">
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <HomePage 
                user={user} 
                records={records} 
                partnerRecords={partnerRecords}
                onAddRecord={handleAddRecord} 
              />
            </motion.div>
          )}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DashboardPage 
                user={user} 
                records={records} 
                partnerRecords={partnerRecords}
              />
            </motion.div>
          )}
          {activeTab === 'gamification' && (
            <motion.div
              key="gamification"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GamificationPage user={user} goals={goals} coupons={coupons} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SettingsPage 
                user={user} 
                onUpdateUser={handleUpdateUser} 
                onConnectPartner={handleConnectPartner} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="bg-white/90 backdrop-blur-xl px-10 py-8 flex justify-between items-center border-t border-alo-sand/30 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        {[
          { id: 'home', icon: Home },
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'gamification', icon: Trophy },
          { id: 'settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="relative p-2 group"
          >
            <tab.icon className={cn(
              "w-5 h-5 transition-all duration-500",
              activeTab === tab.id ? "text-alo-navy scale-110" : "text-alo-slate/20 group-hover:text-alo-slate/40"
            )} />
            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-dot"
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-alo-gold rounded-full"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
