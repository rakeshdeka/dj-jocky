import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, CheckCircle2, Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Button } from '../../../components/dashboard/ui/button';
import { Badge } from '../../../components/dashboard/ui/badge';
import { Card, CardContent } from '../../../components/dashboard/ui/card';
import type { RootState } from '../../../store/store';
import { addServiceToCart } from '../../../lib/cart-api';
import { setCart } from '../../../redux/cartSlice';
import {
  canShowIndividualPurchaseButtons,
  fetchServiceDetail,
  formatServicePrice,
  getIndividualServiceImage,
  getServiceDisplayName,
  getServiceHeroDescription,
  hasServiceAccess,
  type IndividualService,
  type ServiceSection,
} from '../../../lib/individual-services-api';
import { checkoutService } from '../../../lib/razorpay-checkout';

const renderSection = (section: ServiceSection, index: number) => {
  const imageOnRight = section.imagePosition === 'right';
  const sectionImage = section.image?.trim();

  return (
    <div
      key={`${section.title}-${index}`}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center"
    >
      <div className={imageOnRight ? 'lg:order-2' : ''}>
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] mb-2">
          {section.title || 'Section'}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {section.description}
        </p>
      </div>
      {sectionImage ? (
        <div
          className={`aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted/30 ${
            imageOnRight ? 'lg:order-1' : ''
          }`}
        >
          <img
            src={sectionImage}
            alt={section.title || 'Section image'}
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );
};

const ClientServiceDetail = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);

  const [service, setService] = useState<IndividualService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const loadService = useCallback(async () => {
    if (!slugOrId) return;

    try {
      setIsLoading(true);
      setLoadError(null);
      setService(await fetchServiceDetail(token, slugOrId));
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string; error?: { message?: string } } } })
              .response?.data?.error?.message ||
            (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : error instanceof Error
            ? error.message
            : 'Failed to load service';
      setLoadError(message);
      setService(null);
    } finally {
      setIsLoading(false);
    }
  }, [slugOrId, token]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  const hasAccess = service ? hasServiceAccess(service) : false;
  const showPurchaseButtons = service ? canShowIndividualPurchaseButtons(service) : false;

  const handleBuyNow = async () => {
    if (!service || !token || !showPurchaseButtons) return;

    setIsProcessing(true);
    await checkoutService(token, service._id, getServiceDisplayName(service), {
      onSuccess: async () => {
        toast.success(`Purchased ${getServiceDisplayName(service)} successfully`);
        await loadService();
        setIsProcessing(false);
      },
      onDismiss: () => setIsProcessing(false),
      onError: (message) => {
        toast.error(message);
        setIsProcessing(false);
      },
    });
  };

  const handleAddToCart = async () => {
    if (!service || !showPurchaseButtons) return;

    setIsAddingToCart(true);
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
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#C4FE01]" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Loading service...
          </p>
        </div>
      </MainLayout>
    );
  }

  if (loadError || !service) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto py-24 text-center space-y-4">
          <p className="text-sm text-muted-foreground">{loadError || 'Service not found'}</p>
          <Button variant="outline" onClick={() => navigate('/client/services')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
        </div>
      </MainLayout>
    );
  }

  const displayName = getServiceDisplayName(service);
  const heroTitle = service.hero?.title?.trim() || displayName;
  const heroImage = getIndividualServiceImage(service);
  const heroDescription = getServiceHeroDescription(service);
  const category = service.category_id?.name;
  const features = service.features || [];
  const sections = service.sections || [];

  return (
    <MainLayout>
      <Link
        to="/client/services"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-[#C4FE01] transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Services
      </Link>

      <div className="relative rounded-xl overflow-hidden border border-border mb-8 min-h-[280px] lg:min-h-[360px]">
        <img src={heroImage} alt={heroTitle} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />

        <div className="relative z-10 p-6 lg:p-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 min-h-[280px] lg:min-h-[360px]">
          <div className="mt-auto space-y-2 max-w-2xl">
            {category && (
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C4FE01] font-bold">
                {category}
              </p>
            )}
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{heroTitle}</h1>
            {heroDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed">{heroDescription}</p>
            )}
          </div>

          <Card className="w-full lg:w-[320px] shrink-0 bg-card/95 backdrop-blur-md border-border/80 shadow-lg">
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-2xl font-bold tracking-tight">{formatServicePrice(service)}</p>
                {service.deliveryTime && (
                  <p className="text-xs text-muted-foreground mt-1">{service.deliveryTime}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {service.is_included_in_subscription && (
                  <Badge className="bg-[#C4FE01]/15 text-[#C4FE01] border-[#C4FE01]/30">
                    Included in your plan
                  </Badge>
                )}
                {service.is_purchased_individually && (
                  <Badge variant="secondary">Purchased individually</Badge>
                )}
                {service.has_access && !service.is_included_in_subscription && !service.is_purchased_individually && (
                  <Badge variant="secondary">You have access</Badge>
                )}
              </div>

              {features.length > 0 && (
                <ul className="space-y-1.5 border-t border-border/50 pt-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#C4FE01] shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-2 pt-1">
                {hasAccess ? (
                  <Button variant="secondary" disabled className="w-full font-bold">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    You have access
                  </Button>
                ) : showPurchaseButtons ? (
                  <>
                    <Button
                      className="w-full bg-[#C4FE01] text-black hover:bg-[#b2e600] font-bold"
                      onClick={handleBuyNow}
                      disabled={isProcessing || isAddingToCart}
                    >
                      {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Buy Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleAddToCart}
                      disabled={isProcessing || isAddingToCart}
                    >
                      {isAddingToCart ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </>
                ) : !service.available_individually ? (
                  <Button asChild className="w-full bg-[#C4FE01] text-black hover:bg-[#b2e600] font-bold">
                    <Link to="/client/plans">View Plans</Link>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {service.description && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            About this service
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap max-w-3xl">
            {service.description}
          </p>
        </section>
      )}

      {sections.length > 0 && (
        <section className="space-y-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            What&apos;s included
          </h2>
          {sections.map((section, index) => renderSection(section, index))}
        </section>
      )}
    </MainLayout>
  );
};

export default ClientServiceDetail;
