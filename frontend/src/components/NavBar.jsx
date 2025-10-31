import React, { useState } from "react";
import Logo from "../components/Logo"

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex w-full items-center bg-white dark:bg-dark shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between">
          {/* Logo circulaire */}
          <div className="w-60 max-w-full py-5">
            <a href="/" className="block w-full flex items-center justfy-between">
              <div className="w-18 h-18 rounded-full  bg-gray-300 flex items-center justify-center ">
                <Logo/>
              </div>
              <div
              className="w-14 h-14 text-orange-500 flex items-center justify-center text-2xl font-bold  hover:scale-105 transition-transform duration-300"
              >
              EPG
              </div>

            </a>
          </div>

          {/* Toggle Mobile */}
          <div className="flex w-full items-center justify-between">
            <div>
              <button
                onClick={() => setOpen(!open)}
                id="navbarToggler"
                className={`${
                  open ? "navbarTogglerActive" : ""
                } absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden`}
              >
                <span className="block h-[2px] w-[30px] my-[6px] bg-gray-700 dark:bg-white"></span>
                <span className="block h-[2px] w-[30px] my-[6px] bg-gray-700 dark:bg-white"></span>
                <span className="block h-[2px] w-[30px] my-[6px] bg-gray-700 dark:bg-white"></span>
              </button>

              {/* Navigation links */}
              <nav
                id="navbarCollapse"
                className={`absolute right-4 top-full w-full max-w-[250px] rounded-lg bg-white px-6 py-5 shadow dark:bg-dark-2 lg:static lg:block lg:w-full lg:max-w-full lg:shadow-none lg:dark:bg-transparent ${
                  !open && "hidden"
                }`}
              >
                <ul className="block lg:flex">
                  <ListItem NavLink="/">Accueil</ListItem>
                  <ListItem NavLink="/formations">Formations</ListItem>
                  <ListItem NavLink="/contact">Contact</ListItem>
                </ul>
              </nav>
            </div>

            {/* Auth buttons */}
            <div className="hidden sm:flex justify-end pr-16 lg:pr-0">
              <a
                href="/login"
                className="px-7 py-3 text-base font-medium text-dark hover:text-primary dark:text-white"
              >
                Connexion
              </a>
              <a
                href="/register"
                className="rounded-md bg-blue-600 px-7 py-3 text-base font-medium text-white hover:bg-blue-500 ml-3"
              >
                S'inscrire
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

// Composant pour les liens de navigation
const ListItem = ({ children, NavLink }) => {
  return (
    <li>
      <a
        href={NavLink}
        className="flex py-2 text-base font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white lg:ml-12 lg:inline-flex"
      >
        {children}
      </a>
    </li>
  );
};
