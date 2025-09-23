import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge"; // ★ Badge component එක import කරගන්නවා
import { useCart } from '../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSpinner } from '@fortawesome/free-solid-svg-icons'; // ★ Spinner Icon එකත් එකතු කරගන්නවා

const publicApi = axios.create({
  baseURL: 'http://localhost:5002/api', 
});

const Shop = () => {
  const [shopItems, setShopItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { cartItemCount, addToCartAndUpdate } = useCart(); 
  const [addingItemId, setAddingItemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchShopItems = async () => {
      setIsLoading(true);
      try {
        // Backend එකෙන් এখন imageUrl එකත් එන නිසා, මේ function එකේ වෙනසක් කරන්න අවශ්‍ය නැහැ
        const response = await publicApi.get('/items/shop');
        setShopItems(response.data);
        setFilteredItems(response.data);
      } catch (error) {
        console.error("Failed to fetch shop items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShopItems();
  }, []);

  useEffect(() => {
    let items = shopItems;

    if (selectedCategory !== 'All') {
      items = items.filter(item => item.category === selectedCategory);
    }

    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      items = items.filter(item => item.name.toLowerCase().includes(lowerSearch));
    }

    setFilteredItems(items);
  }, [searchTerm, selectedCategory, shopItems]);
  
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
    // වඩාත් හොඳ Loading indicator එකක්
    return <div className="flex justify-center items-center h-[calc(100vh-80px)]"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-gray-500"/></div>;
  }

  // Collect unique categories for filter dropdown
  const categories = ['All', ...Array.from(new Set(shopItems.map(item => item.category)))];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">

        {/* Shop Header එකේ වෙනසක් නැහැ */}
        <div className="flex justify-between items-center mb-10 border-b pb-5">
            <div>
                <h1 className="text-4xl font-bold" style={{ color: '#0D1B2A' }}>Our Shop</h1>
                <p className="text-gray-600 mt-2">Find the best gear for your sport.</p>
            </div>
        </div>

        {/* Search bar and category filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-8">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 sm:mb-0"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-1/4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map(item => (
              <Card key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col group relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                
                {/* ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★ */}
                {/* ★★★ මෙන්න Image එක පෙන්වන අලුත් කොටස ★★★ */}
                {/* ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★ */}
                <div className="w-full h-52 bg-gray-200 overflow-hidden relative">
                  <img 
                    // Backend එකෙන් එන 'imageUrl' එක පාවිච්චි කරනවා
                    src={item.imageUrl || 'https://via.placeholder.com/400x300.png?text=SportNest'} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  {/* Hover overlay for supplements */}
                  {item.category === 'Supplements' && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center p-4 text-center">
                      <p className="mb-2 font-semibold">Stock: {item.stockQuantity ?? 'N/A'}</p>
                      <p>Expiry: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  )}
                </div>
                
                {/* Card එකේ අනිත් කොටස් වලට පොඩි UI දියුණු කිරීම් */}
                <div className="p-4 flex flex-col flex-grow">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">{item.name}</CardTitle>
                    <CardDescription>
                        {/* Category එක Badge එකක් ලෙස පෙන්වනවා */}
                        <Badge variant={item.category === 'Supplements' ? 'destructive' : 'outline'}>{item.category}</Badge>
                    </CardDescription>
                </div>

                <CardFooter className="p-4 bg-gray-50 flex justify-between items-center mt-auto">
                  <p className="text-xl font-semibold text-gray-800">
                    Rs. {item.price ? item.price.toFixed(2) : '0.00'}
                  </p>
                  <Button 
                    onClick={() => handleAddToCart(item._id)}
                    disabled={addingItemId === item._id}
                    style={{ backgroundColor: '#0D1B2A', color: 'white' }}
                    className="hover:bg-gray-700"
                  >
                    {addingItemId === item._id ? <FontAwesomeIcon icon={faSpinner} spin/> : <FontAwesomeIcon icon={faShoppingCart} className="mr-2"/>}
                    {addingItemId === item._id ? '' : 'Add to Cart'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-xl mt-20">No items available in the shop at the moment.</p>
        )}
      </div>

      {/* Floating cart summary button */}
      <Link
        to="/cart"
        className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-lg flex items-center space-x-2 z-50"
        aria-label="Go to Cart"
      >
        <FontAwesomeIcon icon={faShoppingCart} className="text-xl" />
        {cartItemCount > 0 && (
          <span className="ml-1 font-bold text-lg">{cartItemCount}</span>
        )}
      </Link>
    </div>
  );
};

export default Shop;