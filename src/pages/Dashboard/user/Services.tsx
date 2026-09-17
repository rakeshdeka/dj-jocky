import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { Badge } from '../../../components/dashboard/ui/badge';
import { CheckCircle2, Loader2, ShoppingCart } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { checkoutService } from '../../../lib/razorpay-checkout';
import { addServiceToCart } from '../../../lib/cart-api';
import { setCart } from '../../../redux/cartSlice';
import type { RootState } from '../../../store/store';
import {
  canShowIndividualPurchaseButtons,
  fetchAllServices,
  formatServicePrice,
  getClientServiceDetailPath,
  getIndividualServiceImage,
  getServiceDisplayName,
  hasServiceAccess,
  type IndividualService,
} from '../../../lib/individual-services-api';

const Services = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const [services, setServices] = useState<IndividualService[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setServices(await fetchAllServices(token));
    } catch {
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openDetail = (service: IndividualService) => {
    navigate(getClientServiceDetailPath(service));
  };

  const handleBuyNow = async (service: IndividualService) => {
    if (!canShowIndividualPurchaseButtons(service) || !token) return;

    setIsProcessing(service._id);
    await checkoutService(token, service._id, getServiceDisplayName(service), {
      onSuccess: () => {
        toast.success(`Purchased ${getServiceDisplayName(service)} successfully`);
        setIsProcessing(null);
        fetchServices();
      },
      onDismiss: () => setIsProcessing(null),
      onError: (message) => {
        toast.error(message);
        setIsProcessing(null);
      },
    });
  };

  const handleAddToCart = async (service: IndividualService) => {
    if (!canShowIndividualPurchaseButtons(service)) return;

    setIsAddingToCart(service._id);
    try {
      const data = await addServiceToCart(token, service._id);
      dispatch(setCart(data.items));
      toast.success(`${getServiceDisplayName(service)} added to cart`);
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(null);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-xs font-bold mb-1 tracking-[0.2em] uppercase">AVAILABLE SERVICES</h1>
        <p className="text-muted-foreground text-xs">
          Browse all services — click a card to view details
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
            const displayName = getServiceDisplayName(service);
            const isIndividual = service.available_individually ?? false;
            const hasAccess = hasServiceAccess(service);
            const showPurchaseButtons = canShowIndividualPurchaseButtons(service);
            const category = service.category_id?.name;
            const isBusy = isProcessing !== null || isAddingToCart !== null;

            return (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  className="h-full overflow-hidden relative transition-all duration-300 flex flex-col justify-between border border-border hover:border-[#C4FE01]/50 cursor-pointer"
                  onClick={() => openDetail(service)}
                >
                  <div className="aspect-[16/10] bg-muted/30 overflow-hidden">
                    <img
                      src={getIndividualServiceImage(service)}
                      alt={displayName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  <CardHeader className="p-5 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg uppercase tracking-tight font-bold">
                          {displayName}
                        </CardTitle>
                        {category && (
                          <CardDescription className="text-[10px] uppercase tracking-widest mt-0.5">
                            {category}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {service.is_included_in_subscription && (
                          <Badge className="whitespace-nowrap text-[10px] px-2 py-0.5 bg-[#C4FE01]/15 text-[#C4FE01]">
                            Included in your plan
                          </Badge>
                        )}
                        {service.is_purchased_individually && (
                          <Badge variant="secondary" className="whitespace-nowrap text-[10px] px-2 py-0.5">
                            Purchased
                          </Badge>
                        )}
                        <Badge
                          variant="secondary"
                          className={cn(
                            'whitespace-nowrap text-[10px] px-2 py-0.5',
                            isIndividual ? 'bg-[#C4FE01]/15 text-[#C4FE01]' : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {isIndividual ? 'Individual' : 'Plan Only'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 py-2 flex-grow">
                    {service.shortDescription && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                        {service.shortDescription}
                      </p>
                    )}
                    <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {formatServicePrice(service)}
                      <span className="text-muted-foreground text-xs font-normal ml-1">one-time</span>
                    </p>
                  </CardContent>

                  <CardFooter
                    className="p-5 pt-3 border-t border-border/40 gap-2 flex-col sm:flex-row"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {hasAccess ? (
                      <Button
                        variant="secondary"
                        className="w-full font-bold h-9 uppercase tracking-wider text-[11px]"
                        disabled
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        You have access
                      </Button>
                    ) : showPurchaseButtons ? (
                      <>
                        <Button
                          className="w-full font-bold h-9 uppercase tracking-wider text-[11px] bg-[#C4FE01] text-black hover:bg-[#b2e600]"
                          onClick={() => handleBuyNow(service)}
                          disabled={isBusy}
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
                          disabled={isBusy}
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
                    ) : !isIndividual ? (
                      <Button
                        variant="secondary"
                        className="w-full font-bold h-9 uppercase tracking-wider text-[11px]"
                        onClick={() => navigate('/client/plans')}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        View Plans
                      </Button>
                    ) : null}
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
