
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, Coins, ScrollText, History, Check, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ShopTitle, UserTitle, PointLog } from '../types';
import { useNotification } from '../contexts/NotificationContext';

const API_BASE = 'https://climate-game.hywiki.org/API';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | number;
  password?: string;
  currentPoints: number;
  onUpdatePoints: (points: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  password, 
  currentPoints,
  onUpdatePoints 
}) => {
  const { t } = useLanguage();
  const { showNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory' | 'history'>('shop');
  const [shopItems, setShopItems] = useState<ShopTitle[]>([]);
  const [userTitles, setUserTitles] = useState<UserTitle[]>([]);
  const [pointLogs, setPointLogs] = useState<PointLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [buyingId, setBuyingId] = useState<string | number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'shop') {
        const [itemsRes, userRes] = await Promise.all([
          fetch(`${API_BASE}/titles/all`),
          fetch(`${API_BASE}/user/${userId}/titles`)
        ]);
        
        if (itemsRes.ok) {
          const items = await itemsRes.json();
          setShopItems(Array.isArray(items) ? items : []);
        }
        if (userRes.ok) {
          const titles = await userRes.json();
          setUserTitles(Array.isArray(titles) ? titles : []);
        }
      } else if (activeTab === 'inventory') {
        const res = await fetch(`${API_BASE}/user/${userId}/titles`);
        if (res.ok) {
          const titles = await res.json();
          setUserTitles(Array.isArray(titles) ? titles : []);
        }
      } else if (activeTab === 'history') {
        const res = await fetch(`${API_BASE}/user/${userId}/points/log`);
        if (res.ok) {
          const logs = await res.json();
          setPointLogs(Array.isArray(logs) ? logs : []);
        }
      }
    } catch (e) {
      console.error(e);
      showNotification("Failed to load shop data", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (item: ShopTitle) => {
    if (!password) {
      showNotification("Authentication error: Missing password", 'error');
      return;
    }
    
    if (currentPoints < item.cost) {
      showNotification(t.shop.noPoints, 'error');
      return;
    }

    if (!confirm(t.shop.confirmBuy.replace('{cost}', String(item.cost)).replace('{item}', item.name))) {
      return;
    }

    setBuyingId(item.id);
    try {
      const res = await fetch(`${API_BASE}/shop/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, titleId: item.id, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        showNotification(t.shop.purchaseSuccess, 'success');
        onUpdatePoints(data.pointsLeft);
        // Refresh data
        loadData();
      } else {
        showNotification(data.message || "Purchase failed", 'error');
      }
    } catch (e) {
      showNotification("Network error during purchase", 'error');
    } finally {
      setBuyingId(null);
    }
  };

  const isOwned = (item: ShopTitle) => {
    // Match by name since UserTitle might not have ID
    return userTitles.some(t => t.name === item.name);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center space-x-3 text-indigo-800">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-indigo-100">
               <ShoppingBag className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
               <h2 className="text-xl font-bold">{t.shop.title}</h2>
               <div className="flex items-center text-xs font-medium text-slate-500 mt-0.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500 mr-1" />
                  {t.shop.balance}: <span className="text-amber-600 font-bold ml-1 text-sm">{currentPoints}</span>
               </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
           <button 
             onClick={() => setActiveTab('shop')}
             className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center space-x-2 ${
               activeTab === 'shop' 
                 ? 'border-indigo-600 text-indigo-600 bg-white' 
                 : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'
             }`}
           >
             <ShoppingBag className="w-4 h-4" />
             <span>{t.shop.tabs.items}</span>
           </button>
           <button 
             onClick={() => setActiveTab('inventory')}
             className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center space-x-2 ${
               activeTab === 'inventory' 
                 ? 'border-indigo-600 text-indigo-600 bg-white' 
                 : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'
             }`}
           >
             <ScrollText className="w-4 h-4" />
             <span>{t.shop.tabs.inventory}</span>
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center space-x-2 ${
               activeTab === 'history' 
                 ? 'border-indigo-600 text-indigo-600 bg-white' 
                 : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'
             }`}
           >
             <History className="w-4 h-4" />
             <span>{t.shop.tabs.records}</span>
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-400" />
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {/* SHOP TAB */}
              {activeTab === 'shop' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shopItems.map((item) => {
                    const owned = isOwned(item);
                    const canAfford = currentPoints >= item.cost;
                    
                    return (
                      <div key={item.id} className={`bg-white rounded-xl p-4 border transition-all ${owned ? 'border-slate-200 opacity-80' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'}`}>
                         <div className="flex justify-between items-start mb-3">
                            <div 
                              className="px-3 py-1.5 rounded-lg border font-bold text-sm"
                              style={{ 
                                color: item.color, 
                                borderColor: item.color,
                                backgroundColor: `${item.color}15` // 10% opacity
                              }}
                            >
                              {item.name}
                            </div>
                            {owned && <div className="text-emerald-500"><Check className="w-5 h-5" /></div>}
                         </div>
                         
                         <div className="flex items-end justify-between mt-4">
                            <div className="flex items-center text-amber-600 font-bold">
                               <Coins className="w-4 h-4 mr-1" />
                               {item.cost}
                            </div>
                            
                            {owned ? (
                               <button disabled className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold cursor-not-allowed">
                                 {t.shop.owned}
                               </button>
                            ) : (
                               <button 
                                 onClick={() => handleBuy(item)}
                                 disabled={!canAfford || buyingId === item.id}
                                 className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center ${
                                   buyingId === item.id 
                                     ? 'bg-slate-200 text-slate-500 cursor-wait'
                                     : !canAfford 
                                       ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                       : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-200'
                                 }`}
                               >
                                 {buyingId === item.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                 {!canAfford ? <Lock className="w-3 h-3 mr-1" /> : null}
                                 {t.shop.buy}
                               </button>
                            )}
                         </div>
                      </div>
                    );
                  })}
                  {shopItems.length === 0 && (
                    <div className="col-span-full text-center py-10 text-slate-400">
                       No items available in the shop.
                    </div>
                  )}
                </div>
              )}

              {/* INVENTORY TAB */}
              {activeTab === 'inventory' && (
                <div className="space-y-3">
                   {userTitles.length > 0 ? (
                     userTitles.map((title, idx) => (
                       <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                          <div className="flex items-center space-x-4">
                             <div 
                                className="px-3 py-1.5 rounded-lg border font-bold text-sm"
                                style={{ 
                                  color: title.color, 
                                  borderColor: title.color,
                                  backgroundColor: `${title.color}15`
                                }}
                             >
                               {title.name}
                             </div>
                             <div className="text-xs text-slate-400">
                                Acquired: {new Date(title.acquired_at).toLocaleDateString()}
                             </div>
                          </div>
                          <div className="text-emerald-500 bg-emerald-50 p-1.5 rounded-full">
                             <Check className="w-4 h-4" />
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <ScrollText className="w-12 h-12 mb-3 opacity-20" />
                        <p>You don't own any titles yet.</p>
                     </div>
                   )}
                </div>
              )}

              {/* HISTORY TAB */}
              {activeTab === 'history' && (
                <div className="space-y-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
                   {pointLogs.length > 0 ? (
                     <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                           <tr>
                              <th className="px-4 py-3 text-left font-medium">Date</th>
                              <th className="px-4 py-3 text-left font-medium">Reason</th>
                              <th className="px-4 py-3 text-right font-medium">Change</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {pointLogs.map((log, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-4 py-3 text-slate-500">
                                    {new Date(log.created_at).toLocaleString()}
                                 </td>
                                 <td className="px-4 py-3 font-medium text-slate-700">
                                    {log.reason}
                                 </td>
                                 <td className={`px-4 py-3 text-right font-bold ${
                                    log.change_amount > 0 ? 'text-emerald-600' : 'text-red-500'
                                 }`}>
                                    {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <History className="w-12 h-12 mb-3 opacity-20" />
                        <p>No point history found.</p>
                     </div>
                   )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
