import { Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login/Login";
import { Register } from "./pages/Register/Register";
import { Tasks } from "./pages/Register/Tasks/Tasks";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tasks" element={<Tasks />} />
    </Routes>
  );
}

export default App;