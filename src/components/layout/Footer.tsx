import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-4 md:px-6">
      <div className="flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>Modern POS internal workspace</p>
        <p>{new Date().getFullYear()} internal retail operations dashboard</p>
      </div>
    </footer>
  );
};

export default Footer;
