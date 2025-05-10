'use client';
import i18n from '@/app/i18';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English', url: "/images/en.png" },
  { code: 'ku', label: 'کوردی', url: "/images/ku.png" },
];

const Language = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

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
    <div className="relative inline-block text-left">
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={` ${selectedLanguage === 'English' ? 'gap-2 px-2' : 'gap-4 pr-2'} flex gap-4  w-full  py-2 rounded-md border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none`}
        >
          {selectedLanguage}
          <svg
            className={`${isOpen ? 'transform rotate-180' : ''} -mr-1 ml-2 h-5 w-5 transition`}
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
      </div>
      {isOpen && (
        <div className={`z-10 ltr origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}>
          <div className={`py-1 `}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
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