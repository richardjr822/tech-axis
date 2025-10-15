"use client";
import { motion } from 'framer-motion';

const ArchiveConfirmation = ({ item, onConfirm, onCancel, isArchiving }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-white text-center mb-2">
          Archive Item
        </h3>
        
        <p className="text-gray-400 text-center mb-6">
          Are you sure you want to archive <span className="text-white font-medium">{item?.name}</span>? 
          You can restore it later from the archived items view.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isArchiving}
            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isArchiving}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center"
          >
            {isArchiving ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Archiving...
              </>
            ) : (
              'Archive'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ArchiveConfirmation;