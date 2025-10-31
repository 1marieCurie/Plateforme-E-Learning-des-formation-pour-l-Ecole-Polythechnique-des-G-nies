import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// Hook personnalisé pour gérer le dropdown
const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return {
    isOpen,
    setIsOpen,
    dropdownRef,
    toggle: () => setIsOpen(!isOpen),
    close: () => setIsOpen(false),
    open: () => setIsOpen(true)
  };
};

// Composant DropdownMenu principal
export const DropdownMenu = ({ children, className }) => {
  return (
    <div className={cn("relative inline-block", className)}>
      {children}
    </div>
  );
};

// Trigger du dropdown
export const DropdownMenuTrigger = ({ 
  children, 
  className, 
  onClick,
  isOpen,
  ...props 
}) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        isOpen && "bg-gray-100",
        className
      )}
      onClick={onClick}
      aria-expanded={isOpen}
      {...props}
    >
      {children}
    </button>
  );
};

// Contenu du dropdown
export const DropdownMenuContent = ({ 
  children, 
  className, 
  isOpen, 
  align = "center",
  ...props 
}) => {
  if (!isOpen) return null;

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 transform -translate-x-1/2",
    end: "right-0"
  };

  return (
    <div
      className={cn(
        "absolute top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-md border bg-white py-1 shadow-lg",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
        alignmentClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Item du dropdown
export const DropdownMenuItem = ({ 
  children, 
  className, 
  onClick,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer",
        "focus:bg-gray-100 focus:text-gray-900 focus:outline-none",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Grid pour organiser plusieurs items
export const DropdownMenuGrid = ({ 
  children, 
  className, 
  cols = 1,
  ...props 
}) => {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2", 
    3: "grid-cols-3"
  };

  return (
    <div
      className={cn(
        "grid gap-3 p-4",
        gridClasses[cols],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Composant wrapper avec logique intégrée
export const SimpleDropdown = ({ 
  trigger, 
  children, 
  className,
  contentClassName,
  align = "center"
}) => {
  const { isOpen, toggle, dropdownRef } = useDropdown();

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      <DropdownMenuTrigger
        onClick={toggle}
        isOpen={isOpen}
      >
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        isOpen={isOpen}
        align={align}
        className={contentClassName}
      >
        {children}
      </DropdownMenuContent>
    </div>
  );
};

// Export du hook personnalisé pour utilisation externe si nécessaire
// export { useDropdown };
