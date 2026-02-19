import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const Header: React.FC = () => {
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">Student Exchange</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              to="/products"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Sản phẩm
            </Link>
            <Link
              to="/events"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Sự kiện
            </Link>

            {/* Support Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center gap-1">
                Hỗ trợ
                <span className="text-xs">▼</span>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link to="/support/faq" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-blue-600">
                  ❓ FAQ
                </Link>
                <Link to="/support/contact" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-blue-600">
                  📧 Liên hệ
                </Link>
                <Link to="/support/track-order" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-blue-600">
                  📦 Tra cứu đơn
                </Link>
                <Link to="/support/policies" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-blue-600">
                  📋 Chính sách
                </Link>
              </div>
            </div>

            <Link
              to="/cart"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium relative"
            >
              Giỏ hàng
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link
              to="/admin/login"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
