import { createRoot } from "react-dom/client";
import { AuthShell } from "./auth/AuthShell";
import "./auth/auth.css";

const authRoot = document.getElementById("auth-root");

if (!authRoot) {
  throw new Error("Missing #auth-root mount point");
}

createRoot(authRoot).render(<AuthShell />);
