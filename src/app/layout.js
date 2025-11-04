import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from "@/components/Navbar";

export const metadata = {
  title: 'Panadería App',
  description: 'Gestión de panadería',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="pt-16 px-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
