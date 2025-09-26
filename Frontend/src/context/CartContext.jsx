import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

const publicApi = axios.create({ baseURL: 'http://localhost:5002/api' });

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null); // cart එකේ සම්පූර්ණ object එකම තියාගන්නවා
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const res = await publicApi.get('/cart');
      setCart(res.data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
      setCart({ items: [] }); // Error එකක් ආවොත්, හිස් cart එකක් set කරනවා
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const addToCartAndUpdate = async (itemId, quantity) => {
    await publicApi.post('/cart/add', { itemId, quantity });
    await fetchCart();
  };

  // ★★★ මෙන්න අලුතින් එකතු කළ Remove Function එක ★★★
  const removeFromCartAndUpdate = async (cartItemId) => {
    // Backend එකට කියනවා, මේ cartItem ID එක අයින් කරන්න කියලා
    await publicApi.delete(`/cart/${cartItemId}`);
    // Backend එකෙන්ම අලුත් cart එක එන නිසා, අපි ඒක පාවිච්චි නොකර, නැවත fetch කරනවා.
    // මේකෙන් UI එකේ 100% ක් consistency එක රැකෙනවා.
    await fetchCart();
  };
  
  // ★★★ අලුතින් එකතු කළ Quantity Update Function එක ★★★
  const updateCartItemQuantityAndUpdate = async (cartItemId, newQuantity) => {
    // Backend එකට quantity update කරන්න කියනවා
    await publicApi.put(`/cart/${cartItemId}`, { quantity: newQuantity });
    // Update උනාට පස්සේ cart එක නැවත load කරනවා (UI consistency)
    await fetchCart();
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
            removeFromCartAndUpdate, // අයින් කිරීම
            updateCartItemQuantityAndUpdate // Quantity update function එකත් export කරනවා
        }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};