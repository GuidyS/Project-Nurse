import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import api from '@/lib/axios';
import { useState, useEffect } from "react";

/**
 * QueryClient สำหรับ React Query
 * ใช้จัดการ state และ cache ของ API calls
 */
const queryClient = new QueryClient();

/**
 * App Component - Root Component หลักของแอปพลิเคชัน
 * 
 * หน้าที่:
 * - Setup providers ต่างๆ ที่จำเป็นสำหรับทั้งแอป (React Query, Router, Tooltip, Toast)
 * - กำหนด routing structure
 * 
 * Providers ที่ใช้:
 * - QueryClientProvider: จัดการ API state management ด้วย React Query
 * - TooltipProvider: เปิดใช้งาน tooltip components ทั่วทั้งแอป
 * - BrowserRouter: จัดการ client-side routing
 * - Toaster/Sonner: แสดง toast notifications
 * 
 * Routes:
 * - "/" → Index page (หน้าแรก)
 * - "*" → NotFound page (404 page สำหรับ route ที่ไม่มี)
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
