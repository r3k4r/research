'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SunIcon, MoonIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    console.log("Initial theme from localStorage:", savedTheme);
  }, []);

  useEffect(() => {
    if (mounted && theme) {
      setCurrentTheme(theme);
      console.log("Theme updated from provider:", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    console.log(`Toggling theme from ${currentTheme} to ${newTheme}`);
    
    setCurrentTheme(newTheme);
    
    setTheme(newTheme);
    
    localStorage.setItem('theme', newTheme);
  };

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative pt-1 pl-1 w-9 h-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      <div className="overflow-hidden relative w-5 h-5">
        {currentTheme === 'dark' ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <MoonIcon className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <SunIcon className="h-5 w-5" />
          </motion.div>
        )}
      </div>
    </Button>
  );
}
