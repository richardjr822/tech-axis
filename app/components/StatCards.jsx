import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const StatCards = ({ items }) => {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    updateStatsFromProps();

    fetchStats();
  }, [items]);

  const updateStatsFromProps = () => {
    // Exclude archived items from stats
    const filteredItems = items.filter(item => !item.isArchived);

    const totalItems = filteredItems.length;
    const totalQuantity = filteredItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const lowStockItems = filteredItems.filter(item => item.status === "Low Stock").length;
    const outOfStockItems = filteredItems.filter(item => item.status === "Out of Stock").length;

    setStats([
      {
        id: "total-items",
        title: "Total Items",
        value: totalItems,
        icon: "boxes"
      },
      {
        id: "total-quantity",
        title: "Total Quantity",
        value: totalQuantity,
        icon: "inventory"
      },
      {
        id: "low-stock",
        title: "Low Stock Items",
        value: lowStockItems,
        icon: "warning"
      },
      {
        id: "out-of-stock",
        title: "Out of Stock",
        value: outOfStockItems,
        icon: "empty"
      }
    ]);
  };

  // Fetch detailed statistics from backend
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load statistics');
      }
      
      // Update stats with backend data
      setStats([
        {
          id: "total-items",
          title: "Total Items",
          value: data.stats.overview?.totalItems || 0,
          icon: "boxes"
        },
        {
          id: "total-quantity",
          title: "Total Quantity",
          value: data.stats.overview?.totalQuantity || 0,
          icon: "inventory"
        },
        {
          id: "low-stock",
          title: "Low Stock Items",
          value: data.stats.statusBreakdown?.lowStock || 0,
          icon: "warning"
        },
        {
          id: "out-of-stock",
          title: "Out of Stock",
          value: data.stats.statusBreakdown?.outOfStock || 0,
          icon: "empty"
        }
      ]);
      
      setError(null);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderIcon = (iconName) => {
    switch (iconName) {
      case "boxes":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case "inventory":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case "warning":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "empty":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-black rounded-xl overflow-hidden shadow-lg relative group"
          >
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
            
            <div className="px-6 py-6 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className="text-orange-500 opacity-80 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-300">
                {renderIcon(stat.icon)}
              </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="absolute bottom-0 left-0 w-0 h-1 bg-orange-500 group-hover:w-full transition-all duration-500"></div>
          </motion.div>
        ))}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-400">
          <p>Error loading statistics: {error}</p>
        </div>
      )}
    </div>
  );
};

export default StatCards;