/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import ScrollToTop from './components/layout/ScrollToTop';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/Home';
import ServicePage from './pages/ServicePage';
import ServicesCatalog from './pages/ServicesCatalog';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CompleteProfile from './pages/CompleteProfile';
import DashboardOverview from './pages/dashboard/Overview';
import DashboardOrders from './pages/dashboard/Orders';
import DashboardDocuments from './pages/dashboard/Documents';
import DashboardCompliance from './pages/dashboard/Compliance';
import DashboardInvoices from './pages/dashboard/Invoices';
import DashboardSettings from './pages/dashboard/Settings';
import Blog from './pages/Blog';
import BlogPostDetail from './pages/BlogPostDetail';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import RefundPolicy from './pages/RefundPolicy';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminOverview from './pages/admin/Overview';
import AdminOrders from './pages/admin/Orders';
import AdminCompliance from './pages/admin/Compliance';
import ManageAdmins from './pages/admin/ManageAdmins';
import AdminDocuments from './pages/admin/Documents';
import ActivityLog from './pages/admin/ActivityLog';
import AdminServices from './pages/admin/Services';
import UserDetail from './pages/admin/UserDetail';
import About from './pages/About';
import GSTCalculator from './pages/tools/GSTCalculator';
import ComplianceCalendar from './pages/tools/ComplianceCalendar';
import ItrLandingPage from './pages/ItrLandingPage';
import ItrLandingPageB from './pages/ItrLandingPageB';


export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesCatalog />} />
          <Route path="/services/:category/:slug" element={<ServicePage />} />
          <Route path="/tools/compliance-calendar" element={<ComplianceCalendar />} />
          <Route path="/tools" element={<div className="p-20 text-center text-2xl font-bold">Tools Page</div>} />

          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPostDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
        </Route>

        {/* Campaign Landing Pages */}
        <Route path="/itr-filing" element={<ItrLandingPage />} />
        <Route path="/itr-filing-b" element={<ItrLandingPageB />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/complete-profile" element={
          <ProtectedRoute requirePhone={false}>
            <CompleteProfile />
          </ProtectedRoute>
        } />

        {/* Dashboard Routes (Protected) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="orders" element={<DashboardOrders />} />
          <Route path="documents" element={<DashboardDocuments />} />
          <Route path="compliance" element={<DashboardCompliance />} />
          <Route path="invoices" element={<DashboardInvoices />} />
          <Route path="settings" element={<DashboardSettings />} />
          <Route path="tools/compliance-calendar" element={<ComplianceCalendar />} />
          <Route path="tools/gst-calculator" element={<GSTCalculator />} />
          <Route path="tools" element={<Navigate to="tools/gst-calculator" replace />} />
        </Route>

        {/* Admin Routes (Protected + Role) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="compliance" element={<AdminCompliance />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="users/:userId" element={<UserDetail />} />
          <Route path="tools/compliance-calendar" element={<ComplianceCalendar />} />
          <Route path="tools/gst-calculator" element={<GSTCalculator />} />
          <Route path="tools" element={<Navigate to="tools/gst-calculator" replace />} />
        </Route>

        {/* Super Admin Routes */}
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute role="super_admin">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManageAdmins />} />
          <Route path=":id" element={<ManageAdmins />} />
          <Route path="activity" element={<ActivityLog />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
