import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppShell } from './components/AppShell'
import { GuestRoute } from './components/GuestRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { GOOGLE_CLIENT_ID } from './lib/config'
import { AccountPage } from './pages/AccountPage'
import { ClientFormPage } from './pages/ClientFormPage'
import { ClientsPage } from './pages/ClientsPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { InvoiceCreatePage } from './pages/InvoiceCreatePage'
import { InvoiceDetailPage } from './pages/InvoiceDetailPage'
import { InvoicesPage } from './pages/InvoicesPage'
import { LoginPage } from './pages/LoginPage'
import { PaymentGatewayPage } from './pages/PaymentGatewayPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { PublicInvoicePage } from './pages/PublicInvoicePage'
import { RegisterPage } from './pages/RegisterPage'
import { RevenueAnalyticsPage } from './pages/RevenueAnalyticsPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/invoice/p/:publicId" element={<PublicInvoicePage />} />

      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/new" element={<ClientFormPage />} />
          <Route path="/clients/:id/edit" element={<ClientFormPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/new" element={<InvoiceCreatePage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/settings/payments" element={<PaymentGatewayPage />} />
          <Route path="/analytics/revenue" element={<RevenueAnalyticsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  const router = (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )

  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {router}
      </GoogleOAuthProvider>
    )
  }

  return router
}
