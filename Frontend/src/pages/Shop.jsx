import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // <-- ★ Link import කරනවා
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useCart } from '../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // <-- ★ FontAwesome import කරනවා
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'; // <-- ★ Icon එක import කරනවා

const publicApi = axios.create({
  baseURL: 'http://localhost:5002/api', 
});

const Shop = () => {
  const [shopItems, setShopItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cart Context එකෙන් දැන් cartItemCount එකත් ගන්නවා
  const { cartItemCount, addToCartAndUpdate } = useCart(); 
  
  const [addingItemId, setAddingItemId] = useState(null);

  useEffect(() => {
    const fetchShopItems = async () => {
      setIsLoading(true);
      try {
        const response = await publicApi.get('/items/shop');
        setShopItems(response.data);
      } catch (error) {
        console.error("Failed to fetch shop items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShopItems();
  }, []);
  
  const handleAddToCart = async (itemId) => {
    setAddingItemId(itemId);
    try {
      await addToCartAndUpdate(itemId, 1);
      alert('Item successfully added to your cart!');
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert(`Error: ${error.response?.data?.msg || 'Could not add item to cart.'}`);
    } finally {
      setAddingItemId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10 font-bold text-xl">Loading Shop...</div>;
  }

  return (
    <div className="container mx-auto p-8">

      {/* ★★★ Shop පිටුවට අලුතින් එකතු කළ Header කොටස ★★★ */}
      <div className="flex justify-between items-center mb-10 border-b pb-5">
          <div>
              <h1 className="text-4xl font-bold" style={{ color: '#0D1B2A' }}>Our Shop</h1>
              <p className="text-gray-600 mt-2">Find the best gear for your sport.</p>
          </div>
          {/* --- Cart Icon එක දැන් මෙතන --- */}
          <Link to="/cart" className="relative p-2">
            <FontAwesomeIcon icon={faShoppingCart} className="text-3xl text-gray-700 hover:text-orange-500" />
            {cartItemCount > 0 && (
              <span 
                className="absolute top-0 right-0 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold" 
                style={{ backgroundColor: '#FF6700' }}
              >
                {cartItemCount}
              </span>
            )}
          </Link>
      </div>
      
      {shopItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {shopItems.map(item => (
            <Card key={item._id} className="flex flex-col transform hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 {/* Item Image එකක් තියෙනවා නම් මෙහෙම දාන්න පුළුවන්:
                 <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover rounded-md"/>
                 */}
              </CardContent>
              <CardFooter className="flex justify-between items-center mt-auto">
                <p className="text-xl font-semibold">Rs. {item.price ? item.price.toFixed(2) : '0.00'}</p>
                <Button 
                  onClick={() => handleAddToCart(item._id)}
                  disabled={addingItemId === item._id}
                  style={{ backgroundColor: '#0D1B2A', color: 'white' }}
                >
                  {addingItemId === item._id ? 'Adding...' : 'Add to Cart'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">No items available in the shop right now.</p>
      )}
    </div>
  );
};

export default Shop;