/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import ScrollToTop from './components/layout/ScrollToTop';
import DashboardLayout from './components/layout/DashboardLayout';
const Home = lazy(() => import('./pages/Home'));
const ServicePage = lazy(() => import('./pages/ServicePage'));
const ServicesCatalog = lazy(() => import('./pages/ServicesCatalog'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const DashboardOverview = lazy(() => import('./pages/dashboard/Overview'));
const DashboardOrders = lazy(() => import('./pages/dashboard/Orders'));
const DashboardDocuments = lazy(() => import('./pages/dashboard/Documents'));
const DashboardCompliance = lazy(() => import('./pages/dashboard/Compliance'));
const DashboardInvoices = lazy(() => import('./pages/dashboard/Invoices'));
const DashboardSettings = lazy(() => import('./pages/dashboard/Settings'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail'));
const Careers = lazy(() => import('./pages/Careers'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));
import ProtectedRoute from './components/auth/ProtectedRoute';
const AdminOverview = lazy(() => import('./pages/admin/Overview'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminCompliance = lazy(() => import('./pages/admin/Compliance'));
const ManageAdmins = lazy(() => import('./pages/admin/ManageAdmins'));
const AdminDocuments = lazy(() => import('./pages/admin/Documents'));
const ActivityLog = lazy(() => import('./pages/admin/ActivityLog'));
const AdminServices = lazy(() => import('./pages/admin/Services'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));
const UserDetail = lazy(() => import('./pages/admin/UserDetail'));
const About = lazy(() => import('./pages/About'));
const GSTCalculator = lazy(() => import('./pages/tools/GSTCalculator'));
const ComplianceCalendar = lazy(() => import('./pages/tools/ComplianceCalendar'));
const ItrLandingPage = lazy(() => import('./pages/ItrLandingPage'));
const ItrLandingPageB = lazy(() => import('./pages/ItrLandingPageB'));


export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>}>
          <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesCatalog />} />
          <Route path="/services/:category/:slug" element={<ServicePage />} />
          <Route path="/tools/compliance-calendar" element={<ComplianceCalendar />} />
          <Route path="/tools/gst-calculator" element={<GSTCalculator />} />
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
          <Route path="coupons" element={<AdminCoupons />} />
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
          </Suspense>
    </BrowserRouter>
  );
}
