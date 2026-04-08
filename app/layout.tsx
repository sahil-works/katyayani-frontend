import { Jost } from "next/font/google";
import "./globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from "../components/Header";
import { CartSidebar, CartSidebarProvider } from "../components/CartSidebar";
import { LoginModal, LoginModalProvider } from "../components/LoginModal";
import {
  SearchSidebar,
  SearchSidebarProvider,
} from "../components/SearchSidebar";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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
    <html lang="en" className={`${jost.variable} h-full antialiased`}>
      <body className="min-h-full bg-white font-sans text-[#222]">
        <SearchSidebarProvider>
          <CartSidebarProvider>
            <LoginModalProvider>
              <Header />
              <SearchSidebar />
              <CartSidebar />
              <LoginModal />
              {children}
            </LoginModalProvider>
          </CartSidebarProvider>
        </SearchSidebarProvider>
      </body>
    </html>
  );
}
