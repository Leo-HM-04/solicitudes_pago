import { useState } from "react";

export const useSidebar = (initialActiveItem = "Pagina de inicio") => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState(initialActiveItem);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return {
    isMenuOpen,
    activeMenuItem,
    isLoggingOut,
    setActiveMenuItem,
    setIsLoggingOut,
    openMenu,
    closeMenu,
    toggleMenu,
  };
};
