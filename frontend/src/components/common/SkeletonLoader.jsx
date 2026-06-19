import React from 'react';

const SkeletonLoader = ({ type = 'table', rows = 5, columns = 4 }) => {
  if (type === 'table') {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
        <div className="bg-slate-50 border-b border-slate-200 h-12 flex items-center px-6">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded-md w-1/4 mr-4"></div>
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="h-16 flex items-center px-6">
              {Array.from({ length: columns }).map((_, c) => (
                <div key={c} className="h-4 bg-slate-100 rounded-md w-1/5 mr-6"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col space-y-4">
            <div className="h-40 bg-slate-200 rounded-lg w-full"></div>
            <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
            <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
            <div className="h-8 bg-slate-100 rounded-lg w-full mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded-md w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
              <div className="h-11 bg-slate-100 rounded-lg w-full"></div>
            </div>
          ))}
        </div>
        <div className="h-11 bg-slate-200 rounded-lg w-32 mt-6"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 rounded-md w-full"></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
