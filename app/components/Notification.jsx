import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const Notification = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-black",
          iconColor: "text-orange-500",
          borderColor: "border-orange-500",
          icon: (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case "error":
        return {
          bgColor: "bg-black",
          iconColor: "text-red-500",
          borderColor: "border-red-500",
          icon: (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )
        };
      case "warning":
        return {
          bgColor: "bg-black",
          iconColor: "text-yellow-500",
          borderColor: "border-yellow-500",
          icon: (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          bgColor: "bg-black",
          iconColor: "text-blue-500",
          borderColor: "border-blue-500",
          icon: (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {message && (
        <div className="fixed top-5 right-5 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`${styles.bgColor} border-l-4 ${styles.borderColor} text-white px-6 py-4 rounded-r-lg shadow-2xl flex items-center space-x-4 backdrop-blur-sm max-w-md`}
          >
            <div className={styles.iconColor}>
              {styles.icon}
            </div>
            
            <div className="flex-1 pr-2">
              <p className="text-sm md:text-base">{message}</p>
            </div>
            
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Close notification"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-orange-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "linear" }}
              style={{ originX: 0 }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Notification;