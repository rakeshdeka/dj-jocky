import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Button } from '../../../components/dashboard/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/dashboard/ui/card';
import { Badge } from '../../../components/dashboard/ui/badge';
import { CheckCircle2, Loader2, ShoppingCart } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { loadRazorpay, type RazorpayResponse } from '../../../lib/razorpay';
import { addServiceToCart } from '../../../lib/cart-api';
import { setCart } from '../../../redux/cartSlice';

type ServiceFromAPI = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  available_individually?: boolean;
  category_id?: { _id?: string; name?: string };
};

const apiUrl = import.meta.env.VITE_API_URL;

const getServiceImage = (service: ServiceFromAPI) => {
  if (service.image_url?.trim()) return service.image_url;
  const initial = service.name.trim().charAt(0).toUpperCase() || 'S';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=C4FE01&color=000000&size=512&bold=true&format=png`;
};

const Services = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [services, setServices] = useState<ServiceFromAPI[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${apiUrl}/services`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        withCredentials: true,
      });
      setServices(res.data.items || res.data.services || []);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleBuyNow = async (service: ServiceFromAPI) => {
    if (!service.available_individually) return;

    setIsProcessing(service._id);
    try {
      const orderRes = await axios.post(
        `${apiUrl}/payments/razorpay/create-order/service`,
        { service_id: service._id },
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

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'DesignJockey',
        description: service.name,
        order_id: orderData.order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await axios.post(
              `${apiUrl}/payments/razorpay/verify`,
              {
                type: 'service',
                service_id: service._id,
                service_ids: [service._id],
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
              toast.success(`Purchased ${service.name} successfully`);
            } else {
              toast.error(verifyRes.data.message || 'Payment verification failed');
            }
          } catch {
            toast.error('Error verifying payment');
          } finally {
            setIsProcessing(null);
          }
        },
        theme: { color: '#C4FE01' },
        modal: { ondismiss: () => setIsProcessing(null) },
      };

      new window.Razorpay(options).open();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'Payment failed');
      setIsProcessing(null);
    }
  };

  const handleAddToCart = async (service: ServiceFromAPI) => {
    if (!service.available_individually) return;

    setIsAddingToCart(service._id);
    try {
      const data = await addServiceToCart(token, service._id);
      dispatch(setCart(data.items));
      toast.success(`${service.name} added to cart`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(null);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-xs font-bold mb-1 tracking-[0.2em] uppercase">AVAILABLE SERVICES</h1>
        <p className="text-muted-foreground text-xs">
          Browse and purchase additional services to enhance your experience
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[380px] rounded-md bg-muted/40 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card className="border border-dashed border-border/50">
          <CardContent className="pt-10 pb-10 text-center">
            <p className="text-muted-foreground text-xs font-medium">No services available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 font-sans">
          {services.map((service, index) => {
            const isIndividual = service.available_individually ?? false;
            const category = service.category_id?.name;

            return (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full overflow-hidden relative transition-all duration-300 flex flex-col justify-between border border-border hover:border-[#C4FE01]/50">
                  <div className="aspect-[16/10] bg-muted/30 overflow-hidden">
                    <img
                      src={getServiceImage(service)}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <CardHeader className="p-5 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg uppercase tracking-tight font-bold">
                          {service.name}
                        </CardTitle>
                        {category && (
                          <CardDescription className="text-[10px] uppercase tracking-widest mt-0.5">
                            {category}
                          </CardDescription>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'whitespace-nowrap text-[10px] px-2 py-0.5',
                          isIndividual ? 'bg-[#C4FE01]/15 text-[#C4FE01]' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {isIndividual ? 'Individual' : 'Plan Only'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 py-2 flex-grow">
                    {/* {service.description && (
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    )} */}
                    <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                      ₹{service.price.toLocaleString()}
                      <span className="text-muted-foreground text-xs font-normal ml-1">one-time</span>
                    </p>
                  </CardContent>

                  <CardFooter className="p-5 pt-3 border-t border-border/40 gap-2 flex-col sm:flex-row">
                    {isIndividual ? (
                      <>
                        <Button
                          className="w-full font-bold h-9 uppercase tracking-wider text-[11px] bg-[#C4FE01] text-black hover:bg-[#b2e600]"
                          onClick={() => handleBuyNow(service)}
                          disabled={isProcessing !== null || isAddingToCart !== null}
                        >
                          {isProcessing === service._id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                              Processing...
                            </>
                          ) : (
                            'Buy Now'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full font-bold h-9 uppercase tracking-wider text-[11px]"
                          onClick={() => handleAddToCart(service)}
                          disabled={isProcessing !== null || isAddingToCart !== null}
                        >
                          {isAddingToCart === service._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full font-bold h-9 uppercase tracking-wider text-[11px]"
                        onClick={() => navigate('/client/plans')}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        View Plans
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
};

export default Services;
