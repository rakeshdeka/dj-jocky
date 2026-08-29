import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Button } from '../../../components/dashboard/ui/button';
import { Card, CardContent } from '../../../components/dashboard/ui/card';
import { Badge } from '../../../components/dashboard/ui/badge';
import { Loader2, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { loadRazorpay, type RazorpayResponse } from '../../../lib/razorpay';
import {
  fetchCart,
  removeServiceFromCart,
  clearServerCart,
  getServiceImage,
  type CartData,
} from '../../../lib/cart-api';
import { clearCart, setCart } from '../../../redux/cartSlice';
import type { RootState } from '../../../store/store';

const apiUrl = import.meta.env.VITE_API_URL;

const emptyCart: CartData = {
  items: [],
  item_count: 0,
  total: 0,
};

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [cartData, setCartData] = useState<CartData>(emptyCart);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const applyCartData = useCallback(
    (data: CartData) => {
      setCartData(data);
      dispatch(setCart(data.items));
    },
    [dispatch]
  );

  const loadCart = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await fetchCart(token);
      applyCartData(data);
    } catch {
      toast.error('Failed to load cart');
      applyCartData(emptyCart);
    } finally {
      setIsLoading(false);
    }
  }, [applyCartData, token]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleRemove = async (serviceId: string) => {
    setRemovingId(serviceId);
    try {
      await removeServiceFromCart(token, serviceId);
      const data = await fetchCart(token);
      applyCartData(data);
      toast.success('Removed from cart');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = async () => {
    if (cartData.item_count === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderRes = await axios.post(
        `${apiUrl}/payments/razorpay/create-order/cart`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const orderData = orderRes.data;
      if (!orderData.success) throw new Error(orderData.message || 'Order creation failed');

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      const serviceIds = cartItems.map((item) => item.service_id);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'DesignJockey',
        description: 'Cart checkout',
        order_id: orderData.order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await axios.post(
              `${apiUrl}/payments/razorpay/verify`,
              {
                type: 'cart',
                service_id: serviceIds[0] || '',
                service_ids: serviceIds,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              }
            );

            if (verifyRes.data.success) {
              toast.success('Payment successful');
              await clearServerCart(token);
              dispatch(clearCart());
              setCartData(emptyCart);
            } else {
              toast.error(verifyRes.data.message || 'Payment verification failed');
            }
          } catch {
            toast.error('Error verifying payment');
          } finally {
            setIsCheckingOut(false);
          }
        },
        theme: { color: '#C4FE01' },
        modal: { ondismiss: () => setIsCheckingOut(false) },
      };

      new window.Razorpay(options).open();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'Checkout failed');
      setIsCheckingOut(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xs font-bold mb-1 tracking-[0.2em] uppercase">CART</h1>
          <p className="text-muted-foreground text-xs">Review and checkout your selected services</p>
        </div>
        {cartData.updatedAt && cartData.item_count > 0 && (
          <p className="text-[10px] text-muted-foreground shrink-0">
            Updated {new Date(cartData.updatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading cart...
        </div>
      ) : cartData.item_count === 0 ? (
        <Card className="border border-dashed border-border/50">
          <CardContent className="py-16 text-center space-y-4">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Button
              className="bg-[#C4FE01] text-black hover:bg-[#b2e600]"
              onClick={() => navigate('/client/services')}
            >
              Browse Services
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <Card key={item.service_id} className="border border-border/60">
                <CardContent className="p-4 flex items-center gap-4">
                  <img
                    src={getServiceImage(item.name, item.image_url)}
                    alt={item.name}
                    className="h-16 w-16 rounded-md object-cover bg-muted shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      {item.available_individually && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          Individual
                        </Badge>
                      )}
                    </div>
                    {item.category && (
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
                        {item.category}
                      </p>
                    )}
                    <p className="text-sm font-bold mt-1">₹{item.price.toLocaleString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => handleRemove(item.service_id)}
                    disabled={removingId === item.service_id || isCheckingOut}
                  >
                    {removingId === item.service_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit border border-border/60">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wide">Order Summary</h2>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span>{cartData.item_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">₹{cartData.total.toLocaleString()}</span>
              </div>
              <Button
                className="w-full bg-[#C4FE01] text-black hover:bg-[#b2e600] font-bold"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Checkout with Razorpay'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
};

export default Cart;
