
import { useCart } from '../context/CartContext'; // අපේ CartContext එක import කරගන්නවා
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';


const CartPage = () => {
  // useCart hook එකෙන්, cart එකේ තියෙන items සහ මුළු ගණන ලබාගන්නවා
  const { cartItems, cartItemCount,fetchCart } = useCart();
 const handleCheckout = async () => {
    if (window.confirm('Are you sure you want to place this order?')) {
      try {
        // Backend එකේ checkout endpoint එකට කතා කරනවා
        // publicApi එක ඔබ CartContext එකේ හදලා තියෙන්න ඕන. නැත්නම් axios instance එකක් හදන්න.
        const publicApi = axios.create({ baseURL: 'http://localhost:5002/api' }); // ඔබේ port එක අනුව වෙනස් කරන්න
        const response = await publicApi.post('/orders/checkout');
        
        alert(response.data.msg); // "Order placed successfully!" පණිවිඩය පෙන්වනවා
        
        // සාර්ථක වූ පසු, cart එක හිස් බව පෙන්වන්න context එක refresh කරනවා
        fetchCart();
        
      } catch (error) {
        console.error('Checkout failed:', error);
        alert(`Checkout failed: ${error.response?.data?.msg || 'Please try again.'}`);
      }
    }
  };
  // Cart එකේ තියෙන items වල මුළු මුදල ගණනය කිරීම
  const totalAmount = cartItems.reduce((total, currentItem) => {
    // currentItem එකේ item object එකයි, quantity එකයි දෙකම තියෙනවා
    // ඒ නිසා, currentItem.item.price ලෙස මිල ලබාගත යුතුයි
    const itemPrice = currentItem.item?.price || 0; // Item එක load වෙලා නැත්නම්, price එක 0 ලෙස ගන්නවා
    return total + (itemPrice * currentItem.quantity);
  }, 0);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-10">Your Shopping Cart</h1>

      {cartItemCount > 0 ? (
        // Cart එකේ items තිබේ නම්...
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* වම් පැත්ත: Items List එක */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {cartItems.map(cartItem => (
                  <div key={cartItem.item._id} className="flex items-center justify-between border-b pb-4 mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">{cartItem.item.name}</h2>
                      <p className="text-gray-500">Quantity: {cartItem.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium">
                        Rs. {(cartItem.item.price * cartItem.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400">
                        (Rs. {cartItem.item.price.toFixed(2)} each)
                      </p>
                    </div>
                    {/* ඔබට අවශ්‍ය නම්, item එකක් cart එකෙන් remove කරන button එකක් මෙතැනට දාන්න පුළුවන් */}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* දකුණු පැත්ත: Order Summary එක */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                <div className="flex justify-between mb-2">
                  <span>Subtotal ({cartItemCount} items)</span>
                  <span>Rs. {totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl mt-4 border-t pt-4">
                  <span>Total</span>
                  <span>Rs. {totalAmount.toFixed(2)}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full mt-6">Proceed to Checkout</Button>
              </CardContent>
            </Card>
          </div>

        </div>
      ) : (
        // Cart එක හිස් නම්...
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty.</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;