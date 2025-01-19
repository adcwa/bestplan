'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DisclosureProps {
  children: (props: { open: boolean }) => React.ReactNode;
}

interface DisclosureButtonProps {
  children: React.ReactNode;
  className?: string;
}

interface DisclosurePanelProps {
  children: React.ReactNode;
  className?: string;
}

const DisclosureContext = React.createContext<{
  open: boolean;
  setOpen: (value: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export const Disclosure: React.FC<DisclosureProps> & {
  Button: React.FC<DisclosureButtonProps>;
  Panel: React.FC<DisclosurePanelProps>;
} = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <DisclosureContext.Provider value={{ open, setOpen }}>
      {children({ open })}
    </DisclosureContext.Provider>
  );
};

Disclosure.Button = ({ children, className }) => {
  const { open, setOpen } = React.useContext(DisclosureContext);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={className}
    >
      {children}
    </button>
  );
};

Disclosure.Panel = ({ children, className }) => {
  const { open } = React.useContext(DisclosureContext);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 