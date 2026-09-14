import React, { useState } from 'react';
import { FundEntry, Role } from '../types';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface EntryTableProps {
  entries: FundEntry[];
  userRole: Role;
  onRefresh: () => void;
}

export default function EntryTable({ entries, userRole, onRefresh }: EntryTableProps) {
  const isAdmin = userRole === 'admin';
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editYear, setEditYear] = useState('');
  const [loading, setLoading] = useState(false);

  const startEdit = (entry: FundEntry) => {
    setEditingId(entry.id);
    setEditName(entry.person_name);
    setEditAmount(entry.amount.toString());
    setEditYear(entry.year.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('fund_entries')
        .update({
          person_name: editName,
          amount: parseFloat(editAmount),
          year: parseInt(editYear)
        })
        .eq('id', id);
        
      if (error) throw error;
      setEditingId(null);
      onRefresh();
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('fund_entries')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    } finally {
      setLoading(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">No entries found for the selected criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contributor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              {isAdmin && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => {
              const isEditing = editingId === entry.id;
              
              return (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{entry.person_name}</div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={editYear}
                        onChange={(e) => setEditYear(e.target.value)}
                        className="w-20 px-2 py-1 text-sm border rounded"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{entry.year}</div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex items-center">
                        <span className="mr-1 text-gray-500">৳</span>
                        <input 
                          type="number" 
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-24 px-2 py-1 text-sm border rounded"
                        />
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-green-600">
                        ৳ {entry.amount.toLocaleString()}
                      </div>
                    )}
                  </td>
                  
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdate(entry.id)} 
                            disabled={loading}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={cancelEdit}
                            disabled={loading}
                            className="text-gray-500 hover:text-gray-900"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => startEdit(entry)} 
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(entry.id)} 
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
