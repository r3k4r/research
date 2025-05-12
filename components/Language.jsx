'use client';
import i18n from '@/app/i18';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English', url: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/1200px-Flag_of_the_United_States.svg.png?20250221172329" },
  { code: 'ku', label: 'کوردی', url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Flag_of_Kurdistan.svg/1200px-Flag_of_Kurdistan.svg.png" },
];

const Language = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const language = languages.find(lang => lang.label === selectedLanguage);
    if (language) {
      i18n.changeLanguage(language.code);

      if (language.code === 'ku') {
        document.body.classList.add('rtl');
      } else {
        document.body.classList.remove('rtl');
      }
    }
  }, [selectedLanguage, i18n]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const changeLanguage = (code) => {
    const language = languages.find(lang => lang.code === code);
    setSelectedLanguage(language.label);
    i18n.changeLanguage(code);

    if (code === 'ku') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }

    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm font-medium text-gray-700 hover:text-primary dark:text-white dark:hover:text-gray-200 rounded-md focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="hidden xl:inline-block">{selectedLanguage}</span>
        <span className="xl:hidden">
          {languages.find(lang => lang.label === selectedLanguage)?.code.toUpperCase()}
        </span>
        <svg
          className={`${isOpen ? 'transform rotate-180' : ''} ml-1 h-4 w-4 transition`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="z-50 ltr origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                <Image src={language.url} alt={language.label} width={20} height={20} className="inline-block mr-2" />
                {language.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Language;