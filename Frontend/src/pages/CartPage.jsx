import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faSpinner, faPlus, faMinus, faTag, faGift, faTruck } from '@fortawesome/free-solid-svg-icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartItemCount,
    isLoading,
    fetchCart,
    removeFromCartAndUpdate,
    updateCartItemQuantityAndUpdate
  } = useCart();//custom hook accessing cart context. eken data gannawa

  const [isUpdating, setIsUpdating] = useState(null); // holds cartItemId being updated

  // Local editable quantities (for manual typing)
  const [localQty, setLocalQty] = useState({});

  // UI extras
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [freeShip, setFreeShip] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);

  // Checkout → go to Shipping details page
  const handleCheckout = () => {
    navigate('/shipping');
  };

  // Remove item using Context
  const handleRemoveItem = async (cartItemId) => {
    setIsUpdating(cartItemId);
    try {
      await removeFromCartAndUpdate(cartItemId);
    } catch (error) {
      console.error('Remove failed:', error);
      alert(`Failed to remove item: ${error?.response?.data?.msg || 'Please try again.'}`);
    } finally {
      setIsUpdating(null);
    }
  };

  // Quantity change (+/-) using Context
  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setIsUpdating(cartItemId);
    try {
      await updateCartItemQuantityAndUpdate(cartItemId, newQuantity);
    } catch (error) {
      alert(error?.response?.data?.msg || 'Could not update quantity. Not enough stock.');
      await fetchCart(); // make sure UI reflects server state
    } finally {
      setIsUpdating(null);
    }
  };

  // Coupon handlers (UI only)
  const applyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    let percent = 0;
    let free = false;
    switch (code) {
      case 'SAVE10':
        percent = 10;
        break;
      case 'SPORT5':
        percent = 5;
        break;
      case 'FREESHIP':
        free = true;
        break;
      default:
        alert('Invalid coupon. Try SAVE10, SPORT5 or FREESHIP.');
        return;
    }
    setAppliedCoupon(code);
    setDiscountPercent(percent);
    setFreeShip(free);
  };
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
    setFreeShip(false);
    setCouponCode('');
  };

  // Total amount
  const totalAmount = cartItems.reduce((total, currentItem) => {
    const price = currentItem.item?.price || 0;
    const qty = currentItem.quantity || 0;
    return total + price * qty;
  }, 0);

  // Derived totals
  const shippingCost = freeShip ? 0 : (totalAmount >= 7500 ? 0 : 500);
  const discountAmount = (totalAmount * discountPercent) / 100;
  const wrapCost = giftWrap ? 250 : 0;
  const grandTotal = Math.max(0, totalAmount - discountAmount + shippingCost + wrapCost);

  // Sync local quantities when cart items change
  useEffect(() => {
    const map = {};
    cartItems.forEach(ci => {
      if (ci?._id) map[ci._id] = ci.quantity || 1;
    });
    setLocalQty(map);
  }, [cartItems]);

  // Loading indicator
  if (isLoading) {
    return (
      <div className="text-center p-20">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 grid place-content-center rounded-full bg-emerald-600 text-white text-sm font-semibold">1</span>
            <span className="text-sm font-medium text-emerald-700">Cart</span>
          </div>
          <div className="flex-1 h-px bg-slate-200 mx-3"></div>
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 grid place-content-center rounded-full bg-slate-200 text-slate-600 text-sm font-semibold">2</span>
            <span className="text-sm text-slate-600">Shipping</span>
          </div>
          <div className="flex-1 h-px bg-slate-200 mx-3"></div>
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 grid place-content-center rounded-full bg-slate-200 text-slate-600 text-sm font-semibold">3</span>
            <span className="text-sm text-slate-600">Payment</span>
          </div>
        </div>
      </div>
      <h1 className="text-4xl font-bold text-center mb-10">Your Shopping Cart</h1>

      {cartItemCount > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {cartItems.map((cartItem) => (
                  <div
                    key={cartItem._id || cartItem.item?._id}
                    className="flex items-center justify-between border-b last:border-b-0 py-4 gap-4"
                  >
                    {/* Image + Name */}
                    <div className="flex items-center flex-grow min-w-0">
                      <img
                        src={cartItem.item?.imageUrl || 'https://via.placeholder.com/100.png?text=Item'}
                        alt={cartItem.item?.name || 'Item'}
                        className="w-20 h-20 object-cover rounded-md mr-4"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <h2 className="text-lg md:text-xl font-semibold truncate">
                          {cartItem.item ? cartItem.item.name : "Unknown Item"}
                        </h2>
                        <p className="text-sm text-gray-500">
                          (Rs. {(cartItem.item ? cartItem.item.price : 0).toFixed(2)} each)
                        </p>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          const next = Math.max(1, (cartItem.quantity || 1) - 1);
                          setLocalQty((prev) => ({ ...prev, [cartItem._id]: next }));
                          handleQuantityChange(cartItem._id, next);
                        }}
                        disabled={!!isUpdating || (cartItem.quantity || 1) <= 1}
                        className="h-10 w-10"
                        aria-label="Decrease quantity"
                      >
                        {isUpdating === cartItem._id ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faMinus} />}
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        value={localQty[cartItem._id] ?? cartItem.quantity ?? 1}
                        onChange={(e) => {
                          const val = e.target.value;
                          const n = Math.max(1, parseInt(val || '1', 10));
                          setLocalQty((prev) => ({ ...prev, [cartItem._id]: n }));
                        }}
                        onBlur={() => {
                          const next = localQty[cartItem._id] ?? cartItem.quantity ?? 1;
                          if (next !== cartItem.quantity) {
                            handleQuantityChange(cartItem._id, next);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const next = localQty[cartItem._id] ?? cartItem.quantity ?? 1;
                            if (next !== cartItem.quantity) {
                              handleQuantityChange(cartItem._id, next);
                            }
                          }
                        }}
                        className="w-14 h-10 text-center font-bold"
                        aria-label="Current quantity"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          const next = (cartItem.quantity || 0) + 1;
                          setLocalQty((prev) => ({ ...prev, [cartItem._id]: next }));
                          handleQuantityChange(cartItem._id, next);
                        }}
                        disabled={!!isUpdating}
                        className="h-10 w-10"
                        aria-label="Increase quantity"
                      >
                        {isUpdating === cartItem._id ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlus} />}
                      </Button>
                    </div>

                    {/* Total + Remove */}
                    <div className="flex items-center justify-end w-44">
                      <div className="text-right">
                        <p className="text-lg font-medium">
                          Rs. {((cartItem.item ? cartItem.item.price : 0) * (cartItem.quantity || 0)).toFixed(2)}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:bg-red-50 ml-4"
                            disabled={!!isUpdating}
                            aria-label="Remove item"
                          >
                            {isUpdating === cartItem._id
                              ? <FontAwesomeIcon icon={faSpinner} spin />
                              : <FontAwesomeIcon icon={faTrashAlt} />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white text-gray-900">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Item</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "
                              {cartItem.item ? cartItem.item.name : 'this item'}
                              " from your cart?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveItem(cartItem._id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

                {/* Free shipping info */}
                <div className="mb-3 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <FontAwesomeIcon icon={faTruck} />
                  <span>Free shipping for orders over Rs. 7,500</span>
                </div>

                {/* Coupon */}
                <form onSubmit={applyCoupon} className="flex gap-2 mb-3">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon (SAVE10, SPORT5, FREESHIP)"
                  />
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Apply</Button>
                </form>
                {appliedCoupon && (
                  <div className="mb-3 text-sm">
                    <span className="inline-flex items-center gap-2 bg-emerald-600 text-white px-2.5 py-1 rounded-full">
                      <FontAwesomeIcon icon={faTag} />
                      {appliedCoupon}
                      <button type="button" onClick={removeCoupon} className="ml-1 text-white/80 hover:text-white" aria-label="Remove coupon">×</button>
                    </span>
                  </div>
                )}

                {/* Gift wrap */}
                <label className="flex items-center gap-2 mb-4 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-emerald-600"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                  />
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faGift} className="text-emerald-600" />
                    Add gift wrap <span className="text-slate-500">(Rs. 250)</span>
                  </span>
                </label>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItemCount} items)</span>
                    <span>Rs. {totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount {discountPercent ? `(${discountPercent}%)` : ''}</span>
                    <span className={discountAmount ? 'text-emerald-700' : ''}>- Rs. {discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `Rs. ${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gift wrap</span>
                    <span>Rs. {wrapCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl mt-2 border-t pt-3">
                    <span>Total</span>
                    <span>Rs. {grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Proceed to Checkout
                </Button>
                <Link to="/shop" className="block mt-3 text-center text-sm text-emerald-700 hover:underline">
                  ← Continue shopping
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Empty cart
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty.</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Continue Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;