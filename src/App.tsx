import { BrowserRouter } from "react-router-dom";
import "./App.css";

// Import UI Primitives
import { Toaster } from "@/components/ui/sonner";

// Import Centralized App Routes
import { AppRoutes } from "@/routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="bottom-right" closeButton richColors />
    </BrowserRouter>
  );
}

export default App;
