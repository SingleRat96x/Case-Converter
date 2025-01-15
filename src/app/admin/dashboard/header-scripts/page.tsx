import { HeaderScriptManager } from "../header-script-manager";

export const metadata = {
  title: "Header Script Manager - Admin Dashboard",
};

export default function HeaderScriptsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Header Script Manager</h1>
      <HeaderScriptManager />
    </div>
  );
} 