import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-gray-800 bg-opacity-90 shadow-2xl">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo et texte */}
        <div className="flex items-start">
          {/* Logo avec espacement vertical ajouté */}
          <div className="flex flex-col justify-center mr-2">
            <img
              src="/frontend/public/logo.jpg"  // Remplacement du logo
              alt="logo"
              className="w-14 aspect-square rounded-full object-cover"
            />
          </div>

          {/* Texte avec alignement à gauche */}
          <div className="flex flex-col text-left">
            <span className="text-white text-sm font-medium">Ecole</span>
            <span className="text-yellow-400 text-sm font-medium">Polytechnique</span>
            <span className="text-white text-sm font-medium">des Génies</span>
          </div>
        </div>

        {/* Menu de navigation */}
        <div className="flex w-full items-center justify-between px-4">
          <div>
            <button
              onClick={() => setOpen(!open)}
              id="navbarToggler"
              className={`${
                open && "navbarTogglerActive"
              } absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden`}
            >
              <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
              <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
              <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
            </button>

            <nav
              id="navbarCollapse"
              className={`absolute right-4 top-full w-full max-w-[250px] rounded-lg bg-white px-6 py-5 shadow dark:bg-dark-2 lg:static lg:block lg:w-full lg:max-w-full lg:shadow-none lg:dark:bg-transparent ${
                !open && "hidden"
              }`}
            >
              <ul className="block lg:flex">
                <ListItem NavLink="/">Accueil</ListItem>
                <ListItem NavLink="#">
                  Formations
                  <ul className="absolute bg-white rounded-lg shadow-md">
                    <li><a href="#">Formation 1</a></li>
                    <li><a href="#">Formation 2</a></li>
                    <li><a href="#">Formation 3</a></li>
                  </ul>
                </ListItem>
                <ListItem NavLink="/login">Connexion</ListItem>
                <ListItem NavLink="/register">S'inscrire</ListItem>
                <ListItem NavLink="/contact">Contact</ListItem>
              </ul>
            </nav>
          </div>

          {/* Boutons Connexion et Inscription */}
          <div className="hidden justify-end pr-16 sm:flex lg:pr-0">
            <a
              href="/login"
              className="px-7 py-3 text-base font-medium text-dark hover:text-primary dark:text-white"
            >
              Connexion
            </a>

            <a
              href="/register"
              className="rounded-md bg-primary px-7 py-3 text-base font-medium text-white hover:bg-primary/90"
            >
              S'inscrire
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

const ListItem = ({ children, NavLink }) => {
  return (
    <li className="relative">
      <a
        href={NavLink}
        className="flex py-2 text-base font-medium text-body-color hover:text-dark dark:text-dark-6 dark:hover:text-white lg:ml-12 lg:inline-flex"
      >
        {children}
      </a>
    </li>
  );
};
