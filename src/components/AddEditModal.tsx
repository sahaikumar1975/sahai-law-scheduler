/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  initialData: any;
  onSave: (data: any) => Promise<void>;
}

export default function AddEditModal({ isOpen, onClose, activeTab, initialData, onSave }: AddEditModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        // Defaults
        if (activeTab === 'reading') {
          setFormData({ title: '', completed: false });
        } else {
          setFormData({ 
            type: activeTab === 'meetings' ? 'meeting' : activeTab === 'diligence' ? 'diligence' : 'drafting',
            name: '',
            status: 'Pending',
            fee_status: 'Unpaid',
            priority: 'Medium',
            details: '',
            time: '',
            agenda: '',
          });
        }
      }
    }
  }, [isOpen, initialData, activeTab]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-900">
            {initialData ? 'Edit' : 'Add New'} {activeTab === 'meetings' ? 'Meeting' : activeTab === 'reading' ? 'Reading' : 'Task'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {activeTab === 'reading' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input type="text" name="title" required value={formData.title || ''} onChange={handleChange} className="w-full border-slate-200 rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 text-slate-900" />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client / Task Name</label>
                <input type="text" name="name" required value={formData.name || ''} onChange={handleChange} className="w-full border-slate-200 rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 text-slate-900" />
              </div>

              {activeTab === 'meetings' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Time (e.g., 2:00 PM)</label>
                    <input type="text" name="time" value={formData.time || ''} onChange={handleChange} className="w-full border-slate-200 rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Agenda</label>
                    <textarea name="agenda" value={formData.agenda || ''} onChange={handleChange} className="w-full border-slate-200 rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 text-slate-900" rows={2}></textarea>
                  </div>
                </>
              )}

              {activeTab === 'diligence' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select name="status" value={formData.status || 'Pending'} onChange={handleChange} className="w-full border-slate-200 rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 text-slate-900">
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fee Status</label>
                      <select name="fee_status" value={formData.fee_status || 'Unpaid'} onChange={handleChange} className="w-full border-slate-200 rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 text-slate-900">
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Details</label>
                    <textarea name="details" value={formData.details || ''} onChange={handleChange} className="w-full border-slate-200 rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 text-slate-900" rows={2}></textarea>
                  </div>
                </>
              )}

              {activeTab === 'drafting' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <select name="priority" value={formData.priority || 'Medium'} onChange={handleChange} className="w-full border-slate-200 rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 text-slate-900">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Details</label>
                    <textarea name="details" value={formData.details || ''} onChange={handleChange} className="w-full border-slate-200 rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 text-slate-900" rows={2}></textarea>
                  </div>
                </>
              )}
            </>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
