'use client';

import { useState, useEffect } from 'react';
import { 
    calculateBagProgress, 
    filterBagItems, 
    INITIAL_HOSPITAL_BAG_ITEMS 
} from '../../lib/pregnancy-utils';

export default function HospitalBagChecklist() {
    const [items, setItems] = useState(INITIAL_HOSPITAL_BAG_ITEMS);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'baby', 'mom', 'docs'
    const [newItemName, setNewItemName] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pethui_hospital_bag');
            if (saved) {
                try {
                    setItems(JSON.parse(saved));
                } catch (e) {}
            }
        }
    }, []);

    const saveItems = (newItems) => {
        setItems(newItems);
        if (typeof window !== 'undefined') {
            localStorage.setItem('pethui_hospital_bag', JSON.stringify(newItems));
        }
    };

    const toggleItem = (id) => {
        const next = items.map(it => it.id === id ? { ...it, checked: !it.checked } : it);
        saveItems(next);
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        const targetCategory = activeTab === 'all' ? 'baby' : activeTab;
        const newItem = {
            id: 'custom_' + Date.now(),
            name: newItemName.trim(),
            category: targetCategory,
            checked: false
        };
        saveItems([...items, newItem]);
        setNewItemName('');
    };

    const { checkedCount, totalCount, percent: progressPercent } = calculateBagProgress(items);
    const filteredItems = filterBagItems(items, activeTab);

    // Display limited items when collapsed
    const displayedItems = isExpanded ? filteredItems : filteredItems.slice(0, 4);

    const categories = [
        { id: 'all', label: 'Tất cả' },
        { id: 'baby', label: 'Cho bé 👶' },
        { id: 'mom', label: 'Cho mẹ 🤱' },
        { id: 'docs', label: 'Giấy tờ 📄' },
    ];

    return (
        <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/80 flex flex-col gap-4 text-left">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-2xl">luggage</span>
                    </span>
                    <div>
                        <h3 className="font-headline font-bold text-base text-gray-800">Giỏ đồ đi sinh</h3>
                        <p className="text-xs text-gray-500">Chuẩn bị sẵn sàng trước tuần 36</p>
                    </div>
                </div>

                <div className="flex items-baseline gap-1 font-headline font-black text-sm text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200/50">
                    <span>{checkedCount}</span>
                    <span className="text-gray-400 font-normal">/ {totalCount} món</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-gray-500">Tiến độ chuẩn bị</span>
                    <span className="text-purple-700 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-purple-100/60 h-2.5 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#861949] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-100 pb-2 overflow-x-auto no-scrollbar">
                {categories.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                            activeTab === tab.id
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Checklist Items */}
            <div className="flex flex-col gap-2">
                {displayedItems.map(item => (
                    <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer select-none border ${
                            item.checked
                                ? 'bg-purple-50/40 border-purple-100/70 text-gray-400'
                                : 'bg-gray-50/70 border-gray-100 text-gray-800 hover:bg-purple-50/30'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                item.checked 
                                    ? 'bg-purple-600 border-purple-600 text-white' 
                                    : 'border-gray-300 bg-white'
                            }`}>
                                {item.checked && <span className="material-symbols-outlined text-[15px]">check</span>}
                            </div>
                            <span className={`text-xs font-medium text-left ${item.checked ? 'line-through text-gray-400' : ''}`}>
                                {item.name}
                            </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500 shrink-0 ml-2">
                            {item.category === 'baby' ? 'Bé' : item.category === 'mom' ? 'Mẹ' : 'Giấy tờ'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Expand / Collapse Button */}
            {filteredItems.length > 4 && (
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 py-1 transition-all cursor-pointer text-center"
                >
                    {isExpanded ? 'Thu gọn danh sách ▲' : `Xem thêm ${filteredItems.length - 4} món nữa ▼`}
                </button>
            )}

            {/* Quick Add Form */}
            <form onSubmit={handleAddItem} className="flex gap-2 pt-2 border-t border-gray-100">
                <input
                    type="text"
                    placeholder="Thêm món đồ cần chuẩn bị..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-purple-400 transition-all"
                />
                <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                    Thêm
                </button>
            </form>
        </section>
    );
}
