import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  title = 'Tidak Ada Data',
  description = 'Belum ada data yang tersedia di sistem ini.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 border-dashed rounded-xl my-4">
      <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
        <Inbox className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 transition-colors shadow-sm focus:outline-none min-h-[44px]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
