import { Link } from "react-router-dom";
import BookIcon from '@mui/icons-material/Book';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Velo
        </Link>
        <Link to="/history" className="flex items-center gap-2 hover:text-gray-300">
          <BookIcon />
          Trade History
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;