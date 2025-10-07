"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChangePassword from './ChangePassword';

const Header = ({ currentUser, onLogout, onOpenSettings, onOpenActivityLog, onOpenAccounts }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-gray-900 via-gray-900 to-orange-900/20 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-500/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-400/40 via-transparent to-transparent opacity-60"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <span className="absolute inset-0 rounded-xl border border-white/20 animate-ping opacity-20"></span>
                </div>
              </div>
              
              <div className="ml-3">
                <h1 className="text-lg font-bold flex items-center">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Tech Axis</span>
                  <span className="ml-1.5 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600 font-extrabold">PC</span>
                </h1>
                <div className="flex items-center">
                  <div className="h-0.5 w-4 bg-orange-500 mr-1.5 rounded-full"></div>
                  <p className="text-gray-400 text-xs">Inventory System</p>
                </div>
              </div>
            </div>

            {/* Navigation and User Menu */}
            <div className="flex items-center gap-3">
              {/* Activity Log Button - Only for Owner */}
              {currentUser?.role === 'owner' && (
                <button
                  onClick={onOpenActivityLog}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-orange-600 transition-all duration-300 group"
                  title="Activity Log"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 group-hover:text-orange-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Activity</span>
              </button>
              )}

              {/* Accounts Button - Only for Owner */}
              {currentUser?.role === 'owner' && (
                <button
                  onClick={onOpenAccounts}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-orange-600 transition-all duration-300 group"
                  title="Manage Accounts"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 group-hover:text-orange-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="text-sm font-medium">Accounts</span>
                </button>
              )}
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-orange-600 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      {currentUser?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-white">{currentUser?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-400 capitalize">{currentUser?.role || 'employee'}</p>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      ></div>

                      {/* Menu */}
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        {/* User Info Section */}
                        <div className="px-4 py-4 bg-gray-900/50 border-b border-gray-800">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/30">
                              {currentUser?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white">{currentUser?.fullName || 'User'}</p>
                              <p className="text-xs text-gray-400">@{currentUser?.username || 'username'}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              currentUser?.role === 'owner'
                                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                            }`}>
                              {currentUser?.role === 'owner' ? 'Owner' : 'Employee'}
                            </span>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${
                                currentUser?.isActive ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className={`text-xs ${
                                currentUser?.isActive ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {currentUser?.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          {/* Mobile Activity Log - Only for Owner */}
                          {currentUser?.role === 'owner' && (
                            <button
                              onClick={() => {
                                onOpenActivityLog();
                                setShowUserMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800/50 hover:text-orange-500 transition-colors md:hidden"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">Activity Log</span>
                          </button>
                          )}

                          {/* Mobile Accounts - Only for Owner */}
                          {currentUser?.role === 'owner' && (
                            <button
                              onClick={() => {
                                onOpenAccounts();
                                setShowUserMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800/50 hover:text-orange-500 transition-colors md:hidden"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                              </svg>
                              <span className="text-sm font-medium">Manage Accounts</span>
                            </button>
                          )}

                          {/* Mobile Settings */}
                          <button
                            onClick={() => {
                              onOpenSettings();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800/50 hover:text-orange-500 transition-colors md:hidden"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">Settings</span>
                          </button>

                          <div className="my-2 border-t border-gray-800"></div>

                          {/* Change Password */}
                          <button
                            onClick={() => {
                              setShowChangePassword(true);
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800/50 hover:text-orange-500 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">Change Password</span>
                          </button>

                          <div className="my-2 border-t border-gray-800"></div>

                          {/* Logout */}
                          <button
                            onClick={() => {
                              onLogout();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowChangePassword(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ChangePassword
                currentUser={currentUser}
                onClose={() => setShowChangePassword(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;