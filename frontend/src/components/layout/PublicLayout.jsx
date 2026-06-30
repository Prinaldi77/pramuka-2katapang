import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import LoadingSpinner from '../common/LoadingSpinner';
import logo3D from '../../assets/logo_3d.png';

const PublicLayout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative">
      {/* Decorative Floating 3D Logos in the Background */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {/* Top Right Floating Logo */}
        <div className="absolute top-24 -right-24 w-96 h-96 opacity-[0.05] blur-[1px] animate-float-slow">
          <img src={logo3D} alt="3D Background Ornament Top Right" className="w-full h-full object-contain" />
        </div>
        {/* Bottom Left Floating Logo */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 opacity-[0.04] blur-[2px] animate-float-slower">
          <img src={logo3D} alt="3D Background Ornament Bottom Left" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Global Public Navigation */}
      <Navbar />
      
      {/* Dynamic Content Outlet with Page Transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner size="lg" />
              </div>
            }>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Public Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
