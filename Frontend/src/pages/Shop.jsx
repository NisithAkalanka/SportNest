import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { useCart } from '../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSpinner, faTags } from '@fortawesome/free-solid-svg-icons';
import api from '@/api';

// ===== Optional Hero Background Image (leave empty for clean gradient) =====
const HERO_BG_URL = "/assets/shop-hero.jpg"; // optional hero background

const Shop = () => {
  const [shopItems, setShopItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { cartItemCount, addToCartAndUpdate } = useCart();
  const [addingItemId, setAddingItemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // ★★★ Available coupon codes list (for display & copy) ★★★
  const availableCoupons = [
    { code: 'SAVE10', desc: '10% Off' },
    { code: 'SPORT5', desc: '5% Off' },
    { code: 'FREESHIP', desc: 'Free Shipping' },
  ];

  // ★★★ Click-to-copy state + handler ★★★
  const [copiedCode, setCopiedCode] = useState(null);
  const handleCopyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
    });
  };

  useEffect(() => {
    const fetchShopItems = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/items/shop');
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
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  const categories = ['All', ...Array.from(new Set(shopItems.map(item => item.category)))];
  const heroBgStyle = HERO_BG_URL ? { backgroundImage: `url(${HERO_BG_URL})` } : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto p-4 md:p-8">

        {/* ===== HERO (Professional, optional background photo with overlay) ===== */}
        <section
          className={`relative overflow-hidden rounded-3xl border border-slate-200/70 ${HERO_BG_URL ? 'bg-center bg-cover' : 'bg-gradient-to-r from-slate-900 to-slate-800'}`}
          style={heroBgStyle}
        >
          {HERO_BG_URL && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
          )}
          <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
            <div className="text-white">
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase bg-emerald-500/90 text-white px-3 py-1 rounded-full shadow">
                New season • Up to 40% off
              </p>
              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Elevate your <span className="text-emerald-300">game</span> & lifestyle
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/90 max-w-prose">
                Premium gear for athletes and creators. Clean design, fast checkout, and reliable delivery.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href="#products" className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow">
                  Shop Now
                </a>
                <button className="rounded-2xl px-5 py-2.5 text-sm font-semibold border border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur">
                  View Deals
                </button>
              </div>
            </div>

            <div className="hidden md:block" aria-hidden>
              <div className="aspect-[4/3] rounded-2xl bg-white/70 shadow-xl backdrop-blur p-4 grid grid-cols-2 gap-4">
                {filteredItems.slice(0, 4).map((p) => (
                  <div key={p._id} className="rounded-xl overflow-hidden bg-white border border-slate-200">
                    <img
                      src={p.imageUrl || 'https://via.placeholder.com/400x300.png?text=SportNest'}
                      alt={p.name}
                      loading="lazy"
                      className="h-28 w-full object-cover"
                    />
                    <div className="p-2">
                      <p className="text-xs text-slate-600 line-clamp-1">{p.name}</p>
                      <p className="text-sm font-semibold">Rs. {(p.price ?? 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== AVAILABLE COUPONS SECTION (WITH CLICK-TO-COPY) ===== */}
        <section className="mt-8">
          <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-t-4 border-emerald-500 rounded-lg p-6 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <FontAwesomeIcon icon={faTags} className="text-4xl text-emerald-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Exclusive Deals!</h2>
                  <p className="text-gray-600 text-sm">Click on a code to copy it, then use it at checkout.</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-start gap-x-6 gap-y-4">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.code}
                  onClick={() => handleCopyToClipboard(coupon.code)}
                  className="relative flex items-center gap-2 group cursor-pointer"
                  title="Click to copy"
                >
                  <span
                    className="font-mono text-lg font-bold bg-white text-emerald-700 border-2 border-dashed border-emerald-300 px-4 py-1 rounded-md transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:border-solid group-hover:border-emerald-700"
                  >
                    {copiedCode === coupon.code ? 'Copied!' : coupon.code}
                  </span>
                  <span className="text-sm text-gray-700">({coupon.desc})</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Value Props / USP ===== */}
        <section className="mt-6 grid sm:grid-cols-3 gap-3">
          {[
            { t: "Free shipping", s: "Orders over Rs. 7,500" },
            { t: "Secure payments", s: "Cards, Wallets & COD" },
            { t: "Support 24/7", s: "We're here to help" },
          ].map((u, i) => (
            <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold">{u.t}</p>
              <p className="text-xs text-slate-600">{u.s}</p>
            </div>
          ))}
        </section>

        {/* ===== Search & Category Filter ===== */}
        <section className="mt-10 flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-8">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 mb-4 sm:mb-0"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-1/4 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </section>

        {/* ===== Product Grid ===== */}
        <h2 id="products" className="text-xl sm:text-2xl font-bold tracking-tight mb-4 text-slate-900">Featured products</h2>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map(item => (
              <Card key={item._id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col group relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-slate-200/80">
                <div className="w-full h-52 bg-gray-200 overflow-hidden relative">
                  <Link to={`/product/${item._id}`} className="block w-full h-full" onClick={(e) => e.preventDefault()}>
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/400x300.png?text=SportNest'}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>
                  {/* Description Hover Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-colors duration-300 flex items-center justify-center p-4">
                    <p className="text-white text-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-4">
                      {item.description || 'The finest quality product for your needs.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{item.name}</CardTitle>
                  <CardDescription>
                    <Badge variant={item.category === 'Supplements' ? 'destructive' : 'outline'}>
                      {item.category}
                    </Badge>
                  </CardDescription>
                </div>

                <CardFooter className="p-4 bg-gray-50 flex justify-between items-center mt-auto">
                  <p className="text-xl font-semibold text-gray-800">
                    Rs. {item.price ? item.price.toFixed(2) : '0.00'}
                  </p>
                  <Button
                    onClick={() => handleAddToCart(item._id)}
                    disabled={addingItemId === item._id}
                    className="rounded-xl px-4 border border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {addingItemId === item._id
                      ? <FontAwesomeIcon icon={faSpinner} spin className="text-emerald-600" />
                      : <><FontAwesomeIcon icon={faShoppingCart} className="mr-2 text-emerald-600" /> Add to Cart</>}
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
        className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg flex items-center space-x-2 z-50"
        aria-label="Go to Cart"
      >
        <FontAwesomeIcon icon={faShoppingCart} className="text-xl text-emerald-500" />
        {cartItemCount > 0 && (
          <span className="ml-1 font-bold text-lg">{cartItemCount}</span>
        )}
      </Link>
    </div>
  );
};

export default Shop;