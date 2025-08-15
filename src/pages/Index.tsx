
import { Link } from "react-router-dom";
import GridBoard from "@/components/GridBoard";

const Index = () => {
  return (
    <div>
      <div className="fixed top-4 right-4 z-10">
        <Link 
          to="/square-grid" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          Square Grid →
        </Link>
      </div>
      <GridBoard />
    </div>
  );
};

export default Index;
