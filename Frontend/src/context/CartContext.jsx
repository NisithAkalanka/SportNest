import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create authenticated API instance
  const createAuthenticatedApi = () => {
    const token = localStorage.getItem('token');
    return axios.create({ 
      baseURL: 'http://localhost:5002/api',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
  };

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCart({ items: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const api = createAuthenticatedApi();
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
      setCart({ items: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  // addToCartAndUpdate
const addToCartAndUpdate = async (itemId, quantity = 1) => {//////
  const token = localStorage.getItem('token');
  if (!token) { alert('Please log in to add items to cart'); return; }
  try {
    const api = createAuthenticatedApi();
    await api.post('/cart/add', { itemId, productId: itemId, quantity: Number(quantity) });
    await fetchCart();
  } catch (error) {
    console.error('Failed to add to cart:', error);
    if (error.response?.status === 401) {
      alert('Session expired. Please log in again.');
      localStorage.removeItem('token');
      setCart({ items: [] });
    } else {
      alert('Failed to add item to cart. Please try again.');
    }
  }
};

  const removeFromCartAndUpdate = async (cartItemId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const api = createAuthenticatedApi();
      await api.delete(`/cart/${cartItemId}`);
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setCart({ items: [] });
      }
    }
  };
  
 // updateCartItemQuantityAndUpdate
const updateCartItemQuantityAndUpdate = async (cartItemId, newQuantity) => {//////
  const token = localStorage.getItem('token');
  if (!token) return;
  const api = createAuthenticatedApi();
  await api.put(`/cart/${cartItemId}`, { quantity: Number(newQuantity) });
  await fetchCart();
};

  // Carteke thiyena items list eka
  const cartItems = cart ? cart.items : [];
  // mulu cart eke item ganan eka
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider 
        value={{ 
            cartItems: cartItems, // CartPage ekedi use karanna puluwan
            cartItemCount, 
            isLoading,
            fetchCart,
            addToCartAndUpdate,
            removeFromCartAndUpdate, // 
            updateCartItemQuantityAndUpdate // Quantity update function 
        }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);//wenas kala
};