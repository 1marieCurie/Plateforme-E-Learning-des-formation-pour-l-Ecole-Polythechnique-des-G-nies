/* eslint-disable no-unused-vars */
// SidebarMenu.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  FiBarChart,
  FiChevronDown,
  FiChevronsRight,

  FiHome,
  FiUser ,
  FiClipboard,
  FiBookOpen,

} from "react-icons/fi";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { MdStarRate } from "react-icons/md";

import { motion } from "framer-motion";

const SidebarMenu = () => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <motion.nav
      layout
      className="sticky top-0 h-screen shrink-0 border-r border-slate-300 bg-white p-2"
      style={{ width: open ? "225px" : "fit-content" }}
    >
      <TitleSection open={open} />

      <div className="space-y-1">
        <Option Icon={FiHome} title="Dashboard" to="/student" open={open} />
        <Option Icon={FiBookOpen} title="Cours suivis" to="/student/cours_suivis" open={open} />
        <Option Icon={FiBookOpen} title="Formations" to="/student/formations" open={open} />
        <Option Icon={FiBarChart} title="Progression" to="/student/statistics" open={open} />
        <Option Icon={FiUser} title="Profile" to="/student/profile" open={open} />

      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </motion.nav>
  );
};

export default SidebarMenu;

// Sous-composants
const Option = ({ Icon, title, to, open, notifs }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <motion.div layout>
      <Link
        to={to}
        className={`relative flex h-10 w-full items-center rounded-md transition-colors px-2 ${
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
            transition={{ delay: 0.125 }}
            className="text-xs font-medium"
          >
            {title}
          </motion.span>
        )}
        {notifs && open && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute right-2 top-1/2 size-4 rounded bg-indigo-500 text-xs text-white"
          >
            {notifs}
          </motion.span>
        )}
      </Link>
    </motion.div>
  );
};


const TitleSection = ({ open }) => {
  return (
    <div className="mb-3 border-b border-slate-300 pb-3">
      <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-slate-100">
        <div className="flex items-center gap-2">
          <Logo />
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span className="block text-xs font-semibold">Étudiant</span>
              <span className="block text-xs text-slate-500">Tableau de bord</span>
            </motion.div>
          )}
        </div>
        {open && <FiChevronDown className="mr-2" />}
      </div>
    </div>
  );
};

const ToggleClose = ({ open, setOpen }) => {
  return (
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
            transition={{ delay: 0.125 }}
            className="text-xs font-medium"
          >
            Cacher
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};

const Logo = () => (
  <motion.div layout className="grid size-10 shrink-0 place-content-center rounded-md bg-indigo-600">
    <span className="text-white text-sm font-bold">EPG</span>
  </motion.div>
);
