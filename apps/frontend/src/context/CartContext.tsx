/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { cartApi } from '../api/cartApi'
import { Cart, CartItem } from '../types/models'

interface CartContextValue {
  cart: Cart
  items: CartItem[]
  loading: boolean
  refreshCart: () => Promise<void>
  addToCart: (catalogItemId: number, quantity?: number) => Promise<void>
  updateQuantity: (catalogItemId: number, quantity: number) => Promise<void>
  removeFromCart: (catalogItemId: number) => Promise<void>
  clearCart: () => Promise<void>
  getCartTotal: () => number
  getCartItemCount: () => number
}

const emptyCart: Cart = { items: [], totalAmount: 0, warnings: [] }

const CartContext = createContext<CartContextValue | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(emptyCart)
  const [loading, setLoading] = useState(true)

  const applyCartData = useCallback((nextCart: Cart) => {
    setCart(nextCart)
    nextCart.warnings?.forEach((warning) => {
      if (warning.toLowerCase().includes('p2p')) {
        toast('San pham listing P2P da bi loai khoi gio hang.')
        return
      }
      toast(warning)
    })
  }, [])

  const refreshCart = useCallback(async () => {
    try {
      const data = await cartApi.getCart()
      applyCartData(data)
    } catch {
      setCart(emptyCart)
    } finally {
      setLoading(false)
    }
  }, [applyCartData])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = useCallback(async (catalogItemId: number, quantity = 1) => {
    const data = await cartApi.addItem(catalogItemId, quantity)
    applyCartData(data)
  }, [applyCartData])

  const updateQuantity = useCallback(async (catalogItemId: number, quantity: number) => {
    const data = await cartApi.updateItem(catalogItemId, quantity)
    applyCartData(data)
  }, [applyCartData])

  const removeFromCart = useCallback(async (catalogItemId: number) => {
    const data = await cartApi.removeItem(catalogItemId)
    applyCartData(data)
  }, [applyCartData])

  const clearCart = useCallback(async () => {
    for (const item of cart.items) {
      // Sequential remove keeps server session consistent.
      await cartApi.removeItem(item.catalogItemId)
    }
    setCart(emptyCart)
  }, [cart.items])

  const value = useMemo<CartContextValue>(() => ({
    cart,
    items: cart.items,
    loading,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal: () => cart.totalAmount,
    getCartItemCount: () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
  }), [cart, loading, refreshCart, addToCart, updateQuantity, removeFromCart, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return context
}
