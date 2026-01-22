import React, { useState } from 'react';

export default function Settings({ onConfigsChange, initialConfigs }) {
  const [configs, setConfigs] = useState(initialConfigs || []);
  const [newSheetId, setNewSheetId] = useState('');
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newSheetId || !newName) return;
    const updated = [...configs, { name: newName, id: newSheetId }];
    setConfigs(updated);
    onConfigsChange(updated);
    setNewSheetId('');
    setNewName('');
  };

  const handleRemove = (index) => {
    const updated = configs.filter((_, i) => i !== index);
    setConfigs(updated);
    onConfigsChange(updated);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Recital Settings</h2>
      
      <div className="space-y-4 mb-8">
        {configs.length === 0 ? (
            <p className="text-gray-500 italic">No recital sheets configured yet.</p>
        ) : (
            configs.map((config, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded">
                <div className="overflow-hidden">
                <p className="font-bold text-gray-700">{config.name}</p>
                <p className="text-xs text-gray-500 font-mono truncate" title={config.id}>{config.id}</p>
                </div>
                <button 
                onClick={() => handleRemove(idx)}
                className="text-red-500 hover:text-red-700 text-sm font-medium ml-4"
                >
                Remove
                </button>
            </div>
            ))
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Add New Recital Sheet</h3>
        <input 
          className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:border-emerald-500"
          placeholder="Recital Name (e.g. City A)"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <input 
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:border-emerald-500"
          placeholder="Google Sheet ID"
          value={newSheetId}
          onChange={e => setNewSheetId(e.target.value)}
        />
        <button 
          onClick={handleAdd}
          disabled={!newName || !newSheetId}
          style={{
            backgroundColor: (!newName || !newSheetId) ? '#6b7280' : '#059669',
            opacity: (!newName || !newSheetId) ? 0.5 : 1
          }}
          className="w-full py-2 text-white rounded font-medium transition-colors hover:brightness-110 disabled:cursor-not-allowed"
        >
          Add Recital
        </button>
      </div>
    </div>
  );
}
