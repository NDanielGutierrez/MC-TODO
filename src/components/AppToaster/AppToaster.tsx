import { Toaster } from "sonner";
import "./AppToaster.css";

export function AppToaster() {
  return (
    <Toaster
      className="app-toaster"
      position="top-right"
      richColors
      closeButton={false}
    />
  );
}
