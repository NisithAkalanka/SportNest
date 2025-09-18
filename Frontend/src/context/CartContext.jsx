import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

const publicApi = axios.create({
  baseURL: 'http://localhost:5002/api',
});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await publicApi.get('/cart');
      setCartItems(res.data.items || []);
    } catch (error) {
      console.error("Failed to fetch cart", error);
      setCartItems([]);
    }
  };

  // App එක load වෙනකොටම cart එක fetch කරගන්නවා
  useEffect(() => {
    fetchCart();
  }, []);

  // අලුතින් item එකක් add කළාම, cart එක නැවත fetch කරගන්න
  const addToCartAndUpdate = async (itemId, quantity) => {
    await publicApi.post('/cart/add', { itemId, quantity });
    await fetchCart(); // Re-fetch to update the cart count
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartItemCount, addToCartAndUpdate, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook එකක්, මේකෙන් අපිට ඕනම component එකක ඉඳන් Cart එකේ දත්ත ගන්න පුළුවන්
export const useCart = () => {
  return useContext(CartContext);
};