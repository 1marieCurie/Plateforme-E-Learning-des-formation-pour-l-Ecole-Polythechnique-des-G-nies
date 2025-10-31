/* eslint-disable no-unused-vars */
// src/components/Admin/SidebarMenu.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { motion } from "framer-motion";

import {
  FiUsers,
  FiUser,
  FiSettings,
  FiClipboard,
  FiChevronsRight,
  FiChevronDown,
  FiHome,
  FiBarChart,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";

const SidebarMenu = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const Option = ({ Icon, title, to }) => {
    const isActive = location.pathname === to;
    return (
      <motion.div layout>
        <Link
          to={to}
          className={`relative flex h-10 w-full items-center rounded-md px-2 transition-colors ${
            isActive ? "bg-indigo-100 text-indigo-800" : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <motion.div layout className="grid h-full w-10 place-content-center text-lg">
            <Icon />
          </motion.div>
          {open && (
            <motion.span
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium"
            >
              {title}
            </motion.span>
          )}
        </Link>
      </motion.div>
    );
  };

  return (
    <motion.nav
      layout
      className="sticky top-0 h-screen shrink-0 border-r border-slate-300 bg-white p-2"
      style={{ width: open ? "225px" : "fit-content" }}
    >
      <div className="mb-3 border-b border-slate-300 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            {open && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="block text-xs font-semibold">Administrateur</span>
                <span className="block text-xs text-slate-500">Gestion du système</span>
              </motion.div>
            )}
          </div>
          {open && <FiChevronDown className="mr-2" />}
        </div>
      </div>

      <div className="space-y-1">
        <Option Icon={FiHome} title="Dashboard" to="/admin" />
        <Option Icon={FiUsers} title="Utilisateurs" to="/admin/users" />
        <Option Icon={FiUser} title="Profile" to="/admin/profile" />
        <Option Icon={FiBarChart} title="Statistiques techniques" to="/admin/stats_tech" />
        <Option Icon={FiSettings} title="Gérer les Permission" to="/admin/permissions" />
      </div>

      <motion.button
        layout
        onClick={() => setOpen((prev) => !prev)}
        className="absolute bottom-0 left-0 right-0 border-t border-slate-300 transition-colors hover:bg-slate-100"
      >
        <div className="flex items-center p-2">
          <motion.div layout className="grid size-10 place-content-center text-lg">
            <FiChevronsRight className={`transition-transform ${open && "rotate-180"}`} />
          </motion.div>
          {open && (
            <motion.span
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium"
            >
              Cacher
            </motion.span>
          )}
        </div>
      </motion.button>
    </motion.nav>
  );
};

const Logo = () => (
  <motion.div layout className="grid size-10 place-content-center rounded-md bg-indigo-600">
    <span className="text-white text-sm font-bold">EPG</span>
  </motion.div>
);

export default SidebarMenu;
