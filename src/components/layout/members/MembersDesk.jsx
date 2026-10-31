import React, { useState } from 'react';
import { FileSpreadsheet, UserPlus, Search } from 'lucide-react';
import ExcelDataEngineModal from '../../tools/ExcelDataEngineModal';

export default function MembersDesk() {
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top action row with search and actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          {/* Standard Search Bar */}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Members Display Excel Import/Export Button */}
          <button
            type="button"
            onClick={() => setIsExcelModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Import / Export Members via Excel"
          >
            <FileSpreadsheet size={15} />
            <span>Excel Hub</span>
          </button>

          {/* Add Member / Family Button */}
        </div>
      </div>

      {/* Members Directory Table */}

      {/* Modal Window */}
      <ExcelDataEngineModal 
        isOpen={isExcelModalOpen} 
        onClose={() => setIsExcelModalOpen(false)} 
        onRefreshData={() => window.location.reload()}
      />
    </div>
  );
}