import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const stats = [
    { name: "Total Inventory", value: "1,234", change: "+12%", color: "#10B981" },
    { name: "Active Alerts", value: "7", change: "+2", color: "#EF4444" },
    { name: "Pending Orders", value: "23", change: "-3", color: "#F59E0B" },
    { name: "Machines", value: "45", change: "+1", color: "#3B82F6" },
  ];

  const cards = [
    { title: "Inventory", to: "/inventory", icon: "📦", desc: "Manage stock levels" },
    { title: "Alerts", to: "/alerts", icon: "🚨", desc: "Monitor critical issues" },
    { title: "Orders", to: "/orders", icon: "📋", desc: "Process new orders" },
    { title: "Machines", to: "/machines", icon: "⚙️", desc: "Equipment status" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-slate-700 bg-clip-text text-transparent mb-8 text-center"
        >
          Carter A++ Dashboard
        </motion.h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-2xl hover:bg-white transition-all duration-300 group"
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-400 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl font-bold text-white">{stat.change}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -12, scale: 1.05 }}
              className="group cursor-pointer bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-blue-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-slate-200/50 transition-all duration-500 hover:-rotate-1"
            >
              <Link to={card.to} className="block h-full">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{card.title}</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-800">{card.desc}</p>
                <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;

