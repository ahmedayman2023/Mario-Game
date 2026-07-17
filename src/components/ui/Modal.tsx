import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4 z-[101] max-h-[90vh] flex flex-col"
          >
            <div className="bg-[#e8f1ff] mario-block flex flex-col overflow-hidden max-h-[85vh]">
              <div className="flex items-center justify-between px-5 py-3 bg-mario-yellow border-b-4 border-black shrink-0">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black scoreboard-font">
                  {title || 'نافذة'}
                </h3>
                <button
                  onClick={onClose}
                  className="w-6 h-6 flex items-center justify-center bg-mario-red text-white text-xs font-black border-2 border-black active:translate-y-0.5"
                >
                  ×
                </button>
              </div>
              <div className="p-5 overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
