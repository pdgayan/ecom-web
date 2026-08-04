import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./AppContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import ProductListPage from "./pages/ProductListPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";

function AppRoutes() {
  const { user } = useApp();
  const defaultRoute = user
    ? user.role === "seller"
      ? "/dashboard"
      : "/products"
    : "/login";
  return (
    <>
      <Navbar />
      <main className="main-shell">
        <Routes>
          <Route path="/" element={<Navigate to={defaultRoute} replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/dashboard" element={<SellerDashboardPage />} />
          <Route path="*" element={<Navigate to={defaultRoute} replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
