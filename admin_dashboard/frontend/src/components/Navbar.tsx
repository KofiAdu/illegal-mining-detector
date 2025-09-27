
interface NavbarProps {
  toggleSidebar: () => void;
}

function Navbar({toggleSidebar}: NavbarProps) {
  return (
   <div className="w-full h-16 px-6 flex items-center justify-between bg-white border-b shadow-sm">
      <button onClick={toggleSidebar} className="text-gray-700 hover:text-black">
      </button>
      <div className="h-10 w-10 rounded-full bg-gray-200" />
    </div>
  )
}

export default Navbar