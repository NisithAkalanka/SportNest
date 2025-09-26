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

  const addToCartAndUpdate = async (itemId, quantity) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add items to cart');
      return;
    }

    try {
      const api = createAuthenticatedApi();
      await api.post('/cart/add', { itemId, quantity });
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
  
  // Cart එකේ තියෙන items list එක
  const cartItems = cart ? cart.items : [];
  // මුළු item ගණන
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider 
        value={{ 
            cartItems: cartItems, // CartPage එකේදී පාවිච්චි කරන්න 'cartItems' නමින් items ටික දෙනවා
            cartItemCount, 
            isLoading,
            fetchCart,
            addToCartAndUpdate,
            removeFromCartAndUpdate // අලුත් function එකත් export කරනවා
        }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};