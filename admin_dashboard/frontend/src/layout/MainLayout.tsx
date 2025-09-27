import React, { ReactNode, useState } from 'react'
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

interface Props {
  children: ReactNode;
}

function MainLayout({children}: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
     <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout