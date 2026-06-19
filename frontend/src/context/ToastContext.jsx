import React, { createContext, useContext } from 'react';
import { Toaster, toast } from 'sonner';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const success = (message) => toast.success(message);
  const error = (message) => toast.error(message);
  const warning = (message) => toast.warning(message);
  const info = (message) => toast.info(message);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <Toaster richColors position="bottom-right" closeButton />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
