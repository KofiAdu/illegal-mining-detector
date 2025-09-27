import React, { JSX, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Image, UploadCloud, BarChart, Files, Menu } from "lucide-react";

/*
interface NavItem {
  to: string;
  label: string;
  icon: JSX.Element;
}
*/

interface SidebarProps {
  isOpen: boolean;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: <Home /> },
  { to: "/records", label: "Records", icon: <Files /> },
  { to: "/gallery", label: "Gallery", icon: <Image /> },
  { to: "/analytics", label: "Analytics", icon: <BarChart /> },
  { to: "/upload", label: "Upload", icon: <UploadCloud /> },
];

function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`h-screen bg-gray-900 text-white flex flex-col ${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-300`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && (
          <Link to="/" className="text-2xl font-bold hover:text-gray-300">
            Mining Admin
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)}>
          <Menu size={20} />
        </button>
      </div>

      <nav className="space-y-2 px-2 mt-2">
        {navItems.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`relative flex items-center gap-3 p-2 rounded-lg transition-colors ${
              location.pathname === to ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            <div className="relative group">
              {icon}
              {collapsed && (
                <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                  {label}
                </span>
              )}
            </div>
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
