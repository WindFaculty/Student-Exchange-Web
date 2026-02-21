import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import ProductList from './pages/products/ProductList'
import ProductDetail from './pages/products/ProductDetail'
import CartPage from './pages/cart/Cart'
import CheckoutPage from './pages/checkout/Checkout'
import OrderSuccessPage from './pages/checkout/OrderSuccess'
import EventList from './pages/events/EventList'
import EventDetail from './pages/events/EventDetail'
import CreateListing from './pages/listings/CreateListing'
import IotHubPage from './pages/iot/IotHubPage'
import SupportHub from './pages/support/SupportHub'
import FAQ from './pages/support/FAQ'
import Contact from './pages/support/Contact'
import TrackOrder from './pages/support/TrackOrder'
import PoliciesHub from './pages/support/policies/PoliciesHub'
import PurchasePolicy from './pages/support/policies/PurchasePolicy'
import RefundPolicy from './pages/support/policies/RefundPolicy'

import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductListPage from './pages/AdminProductListPage'
import AdminProductFormPage from './pages/AdminProductFormPage'
import AdminOrderListPage from './pages/AdminOrderListPage'
import AdminEventListPage from './pages/admin/AdminEventListPage'
import AdminSupportTicketPage from './pages/admin/AdminSupportTicketPage'
import AdminIotContentPage from './pages/admin/AdminIotContentPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/login" element={<LoginPage />} />

                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />

                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderCode" element={<OrderSuccessPage />} />

                <Route path="/events" element={<EventList />} />
                <Route path="/events/:id" element={<EventDetail />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/listings" element={<CreateListing />} />
                </Route>

                <Route path="/iot" element={<IotHubPage />} />

                <Route path="/support" element={<SupportHub />} />
                <Route path="/support/faq" element={<FAQ />} />
                <Route path="/support/contact" element={<Contact />} />
                <Route path="/support/track-order" element={<TrackOrder />} />
                <Route path="/support/policies" element={<PoliciesHub />} />
                <Route path="/support/policies/purchase" element={<PurchasePolicy />} />
                <Route path="/support/policies/refund" element={<RefundPolicy />} />
              </Route>

              <Route path="/admin/login" element={<AdminLoginPage />} />

              <Route
                path="/admin"
                element={(
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminLayout />
                  </ProtectedRoute>
                )}
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="listings" element={<AdminProductListPage />} />
                <Route path="listings/new" element={<AdminProductFormPage />} />
                <Route path="listings/:id/edit" element={<AdminProductFormPage />} />
                <Route path="orders" element={<AdminOrderListPage />} />
                <Route path="events" element={<AdminEventListPage />} />
                <Route path="tickets" element={<AdminSupportTicketPage />} />
                <Route path="iot-content" element={<AdminIotContentPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
