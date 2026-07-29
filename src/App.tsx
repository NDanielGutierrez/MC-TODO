import { Navigate, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login/Login";
import { Register } from "./pages/Register/Register";
import { Tasks } from "./pages/Tasks/Tasks";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Navbar } from "./components/Navbar/Navbar";
import { AppToaster } from "./components/AppToaster/AppToaster";

function App() {
  return (
    <>
      <Navbar />
      <AppToaster />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
