import React from 'react';
import { MenuIcon } from './Icons';

interface HeaderProps {
    title: string;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
    return (
        <header className="flex items-center justify-between p-4 bg-white shadow-md md:hidden">
            <button onClick={onMenuClick} className="text-slate-600 hover:text-slate-900">
                <MenuIcon />
            </button>
            <h1 className="text-lg font-bold text-slate-800">{title}</h1>
            <div className="w-6"></div> {/* Spacer to balance the title */}
        </header>
    );
};

export default Header;
