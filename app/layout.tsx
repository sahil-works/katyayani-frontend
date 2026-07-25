import "./globals.css";
import "animate.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from "../components/Header";
import FloatingSocialIcons from "../components/FloatingSocialIcons";
import { CartSidebar, CartSidebarProvider } from "../components/CartSidebar";
import { LoginModal, LoginModalProvider } from "../components/LoginModal";
import {
  SearchSidebar,
  SearchSidebarProvider,
} from "../components/SearchSidebar";
import { AuthProvider } from "../providers/AuthProvider";
import { ReactQueryProvider } from "../providers/ReactQueryProvider";

export const metadata = {
  title: "Katyayani Designer Hub",
  description: "Fashion storefront",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-white font-sans text-[#222]">
        <ReactQueryProvider>
          <AuthProvider>
            <SearchSidebarProvider>
              <LoginModalProvider>
                <CartSidebarProvider>
                  <Header />
                  <SearchSidebar />
                  <CartSidebar />
                  <LoginModal />
                  {children}
                  <FloatingSocialIcons />
                </CartSidebarProvider>
              </LoginModalProvider>
            </SearchSidebarProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
