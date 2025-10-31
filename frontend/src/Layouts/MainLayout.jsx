import { Outlet } from "react-router-dom";
import Navigation from "../components/public/Navigation";
import Footer from "../components/public/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
