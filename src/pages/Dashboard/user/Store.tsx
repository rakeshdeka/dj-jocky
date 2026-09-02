import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../../components/dashboard/ui/sheet';
import { Loader2, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { checkoutService } from '../../../lib/razorpay-checkout';
import { addServiceToCart } from '../../../lib/cart-api';
import {
  fetchIndividualService,
  fetchIndividualServices,
  getIndividualServiceImage,
  type IndividualService,
} from '../../../lib/individual-services-api';
import { setCart } from '../../../redux/cartSlice';

const Store = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [services, setServices] = useState<IndividualService[]>([]);
  const [selectedService, setSelectedService] = useState<IndividualService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await fetchIndividualServices(token);
      console.log('[Store] Loaded individual services:', items);
      setServices(items);
    } catch (error) {
      console.error('[Store] Failed to load individual services:', error);
      toast.error('Failed to load store services');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const openServiceDetails = async (serviceId: string) => {
    try {
      setIsDetailLoading(true);
      setSelectedService(null);
      const service = await fetchIndividualService(token, serviceId);
      console.log('[Store] Loaded service details:', service);
      setSelectedService(service);
    } catch (error: any) {
      console.error('[Store] Failed to load service details:', error);
      toast.error(error?.response?.data?.message || 'Failed to load service details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleBuyNow = async (service: IndividualService) => {
    if (!token) {
      toast.error('Please log in to purchase');
      navigate('/login');
      return;
    }

    setIsProcessing(service._id);
    await checkoutService(token, service._id, service.name, {
      onSuccess: () => {
        toast.success(`Purchased ${service.name} successfully`);
        setSelectedService(null);
        setIsProcessing(null);
      },
      onDismiss: () => setIsProcessing(null),
      onError: (message) => {
        toast.error(message);
        setIsProcessing(null);
      },
    });
  };

  const handleAddToCart = async (service: IndividualService) => {
    if (!token) {
      toast.error('Please log in to add items to cart');
      navigate('/login');
      return;
    }

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

  const renderActions = (service: IndividualService, fullWidth = true) => (
    <div className={`flex flex-col sm:flex-row gap-2 ${fullWidth ? 'w-full' : ''}`}>
      <Button
        className={`${fullWidth ? 'w-full' : ''} font-bold h-9 uppercase tracking-wider text-[11px] bg-[#C4FE01] text-black hover:bg-[#b2e600]`}
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
        className={`${fullWidth ? 'w-full' : ''} font-bold h-9 uppercase tracking-wider text-[11px]`}
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
    </div>
  );

  return (
    <MainLayout>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-xs font-bold mb-1 tracking-[0.2em] uppercase">STORE</h1>
        <p className="text-muted-foreground text-xs">
          Browse services available for individual purchase
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[380px] rounded-md bg-muted/40 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card className="border border-dashed border-border/50">
          <CardContent className="pt-10 pb-10 text-center">
            <p className="text-muted-foreground text-xs font-medium">No individual services available right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 font-sans">
          {services.map((service, index) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full overflow-hidden relative transition-all duration-300 flex flex-col justify-between border border-border hover:border-[#C4FE01]/50">
                <button
                  type="button"
                  className="text-left"
                  onClick={() => openServiceDetails(service._id)}
                >
                  <div className="aspect-[16/10] bg-muted/30 overflow-hidden">
                    <img
                      src={getIndividualServiceImage(service)}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-base sm:text-lg uppercase tracking-tight font-bold">
                      {service.name}
                    </CardTitle>
                    {service.category_id?.name && (
                      <CardDescription className="text-[10px] uppercase tracking-widest mt-0.5">
                        {service.category_id.name}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="px-5 py-2 flex-grow">
                    <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                      ₹{service.price.toLocaleString()}
                      <span className="text-muted-foreground text-xs font-normal ml-1">one-time</span>
                    </p>
                  </CardContent>
                </button>

                <CardFooter className="p-5 pt-3 border-t border-border/40 flex-col gap-2">
                  {/* <Button
                    variant="ghost"
                    className="w-full h-8 text-[11px] uppercase tracking-wider"
                    onClick={() => openServiceDetails(service._id)}
                  >
                    View Details
                  </Button> */}
                  {renderActions(service)}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Sheet open={!!selectedService || isDetailLoading} onOpenChange={() => setSelectedService(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {isDetailLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#C4FE01]" />
            </div>
          ) : selectedService ? (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle className="uppercase tracking-tight">{selectedService.name}</SheetTitle>
                <SheetDescription>
                  {selectedService.category_id?.name || 'Individual service'}
                </SheetDescription>
              </SheetHeader>

              <div className="aspect-[16/10] rounded-lg overflow-hidden bg-muted/30 mb-4">
                <img
                  src={getIndividualServiceImage(selectedService)}
                  alt={selectedService.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-3xl font-bold mb-4">
                ₹{selectedService.price.toLocaleString()}
                <span className="text-muted-foreground text-xs font-normal ml-1">one-time</span>
              </p>

              {selectedService.description && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {selectedService.description}
                </p>
              )}

              {renderActions(selectedService)}
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default Store;
