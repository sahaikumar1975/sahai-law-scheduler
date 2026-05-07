/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import AddEditModal from './AddEditModal';
import { calculateDeadline } from '@/lib/utils';
import { LayoutDashboard, Users, FileText, BookOpen, LogOut, Briefcase, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';



type TabType = 'meetings' | 'diligence' | 'drafting' | 'reading';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('meetings');
  const [clients, setClients] = useState<any[]>([]);
  const [readingList, setReadingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) console.error('Error fetching user:', userError);
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: fetchedTasks, error: tasksError } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (tasksError) console.error('Error fetching tasks:', tasksError);

      const { data: fetchedReading, error: readingError } = await supabase.from('reading_list').select('*').order('created_at', { ascending: false });
      if (readingError) console.error('Error fetching reading list:', readingError);

      if (fetchedTasks) setClients(fetchedTasks);
      if (fetchedReading) setReadingList(fetchedReading);
    } catch (error) {
      console.error('Unexpected error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleComplete = async (item: any) => {
    const table = item.title !== undefined ? 'reading_list' : 'tasks';
    const updatePayload = item.title !== undefined ? { completed: true } : { status: 'Completed' };
    await supabase.from(table).update(updatePayload).eq('id', item.id);
    fetchData();
  };

  const handleSave = async (formData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const table = activeTab === 'reading' ? 'reading_list' : 'tasks';
    const payload = { ...formData, user_id: user.id };
    
    if (editingItem?.id) {
      const { error } = await supabase.from(table).update(payload).eq('id', editingItem.id);
      if (error) console.error("Update error:", error);
    } else {
      const { error } = await supabase.from(table).insert([payload]);
      if (error) console.error("Insert error:", error);
    }
    
    fetchData();
  };

  const toggleReminder = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setClients(clients.map(c => c.id === id ? { ...c, reminder_set: newVal } : c));
    await supabase.from('tasks').update({ reminder_set: newVal }).eq('id', id);
  };

  const toggleReading = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setReadingList(readingList.map(r => r.id === id ? { ...r, completed: newVal } : r));
    await supabase.from('reading_list').update({ completed: newVal }).eq('id', id);
  };

  const renderContent = () => {
    if (loading) return <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;

    switch (activeTab) {
      case 'meetings':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.filter(c => c.type === 'meeting').map(client => (
              <TaskCard
                key={client.id}
                type="meeting"
                clientName={client.name}
                details={`${client.time || ''} - ${client.agenda || ''}`}
                reminderSet={client.reminder_set}
                onToggleReminder={() => toggleReminder(client.id, client.reminder_set)}
                onEdit={() => handleEdit(client)}
                onComplete={() => handleComplete(client)}
              />
            ))}
          </div>
        );
      case 'diligence':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.filter(c => c.type === 'diligence').map(client => (
              <TaskCard
                key={client.id}
                type="diligence"
                clientName={client.name}
                deadline={calculateDeadline(new Date(client.received_date), 3)}
                status={client.status}
                feeStatus={client.fee_status}
                details={client.details}
                onEdit={() => handleEdit(client)}
                onComplete={() => handleComplete(client)}
              />
            ))}
          </div>
        );
      case 'drafting':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.filter(c => c.type === 'drafting').map(client => (
              <TaskCard
                key={client.id}
                type="drafting"
                clientName={client.name}
                deadline={calculateDeadline(new Date(client.received_date), 2)}
                priority={client.priority}
                details={client.details}
                onEdit={() => handleEdit(client)}
                onComplete={() => handleComplete(client)}
              />
            ))}
          </div>
        );
      case 'reading':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-900">Professional Reading & Self-Upgradation</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {readingList.map(item => (
                <div key={item.id} className="p-4 flex items-center space-x-3 hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleReading(item.id, item.completed)}
                    className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className={`text-sm flex-1 ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                    {item.title}
                  </span>
                  <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-amber-500 p-1">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  const getOnTrackCount = () => clients.filter(c => calculateDeadline(new Date(c.received_date), c.type === 'diligence' ? 3 : 2) > new Date()).length;
  const getDueSoonCount = () => 0; // Simplified for UI
  const getOverdueCount = () => 0; // Simplified for UI

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 transition-all duration-300">
        <div className="p-6 flex items-center space-x-3 text-white">
          <Briefcase className="w-8 h-8 text-amber-500" />
          <span className="text-xl font-bold tracking-tight">SAHAI LAW</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab('meetings')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'meetings' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Users className="w-5 h-5" />
            <span className="font-medium">Client Meetings</span>
          </button>
          <button onClick={() => setActiveTab('diligence')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'diligence' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-slate-800 hover:text-white'}`}>
            <FileText className="w-5 h-5" />
            <span className="font-medium">Due Diligence</span>
          </button>
          <button onClick={() => setActiveTab('drafting')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'drafting' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Drafting Desk</span>
          </button>
          <button onClick={() => setActiveTab('reading')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'reading' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-slate-800 hover:text-white'}`}>
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Prof. Reading</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Status Overview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"/> On Track</span>
                <span className="font-medium text-white">{clients.length ? clients.length - 1 : 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-amber-400 mr-2"/> Due Soon</span>
                <span className="font-medium text-white">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-2"/> Overdue</span>
                <span className="font-medium text-white">0</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-amber-500" />
            <span className="text-lg font-bold">SAHAI LAW</span>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-slate-300 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="md:hidden bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar">
          <div className="flex p-2 min-w-max space-x-2">
            {[
              { id: 'meetings', icon: Users, label: 'Meetings' },
              { id: 'diligence', icon: FileText, label: 'Diligence' },
              { id: 'drafting', icon: LayoutDashboard, label: 'Drafting' },
              { id: 'reading', icon: BookOpen, label: 'Reading' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="md:hidden p-4 border-b border-slate-200 bg-white">
          <button onClick={handleAddNew} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add New {activeTab.replace(/([A-Z])/g, ' $1').trim()}</span>
          </button>
        </div>

        <header className="hidden md:flex bg-white border-b border-slate-200 p-4 justify-between items-center z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab.replace(/([A-Z])/g, ' $1').trim()}
            </h2>
            <button onClick={handleAddNew} className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-800 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add New</span>
            </button>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-colors">
            <span className="text-sm font-medium">Log Out</span>
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>

      <AddEditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        activeTab={activeTab} 
        initialData={editingItem} 
        onSave={handleSave} 
      />
    </div>
  );
}
