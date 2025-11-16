
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm p-4 shadow-lg sticky top-0 z-10">
      <div className="max-w-7xl mx-auto">
        <h1 style={{fontFamily: "'Playfair Display', serif"}} className="text-3xl font-bold text-center text-slate-100 tracking-wide">
          Retro Restore AI
        </h1>
      </div>
    </header>
  );
};

export default Header;
