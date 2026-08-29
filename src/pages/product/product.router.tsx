import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PuffLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import H1 from '../../components/header/header.component';
import tick from './tick.svg';
import Button from '../../components/button/button.component';
import branding from '../../assets/product/branding.png';
import {
	fetchIndividualService,
	formatServicePrice,
	getIndividualServiceImage,
	getServiceDisplayName,
	type IndividualService,
	type ServiceSection,
} from '../../lib/individual-services-api';
import { addToCart } from '../../redux/cartSlice';

const getHeroImage = (service: IndividualService) =>
	service.hero?.image?.trim() || getIndividualServiceImage(service);

const getHeroDescription = (service: IndividualService) =>
	service.hero?.description || service.hero?.subtitle || service.shortDescription || '';

export default function ProductPage() {
	const { id: slugOrId } = useParams<{ id: string }>();
	const dispatch = useDispatch();
	const token = localStorage.getItem('token');

	const [service, setService] = useState<IndividualService | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [isHeroLoaded, setIsHeroLoaded] = useState(false);

	useEffect(() => {
		if (!slugOrId) {
			setError('Service not found');
			setIsLoading(false);
			return;
		}

		const loadService = async () => {
			try {
				setIsLoading(true);
				setError('');
				const data = await fetchIndividualService(token, slugOrId);
				setService(data);
			} catch (err: any) {
				setService(null);
				setError(err?.response?.data?.message || err?.message || 'Failed to load service');
			} finally {
				setIsLoading(false);
			}
		};

		loadService();
	}, [slugOrId, token]);

	useEffect(() => {
		setTimeout(() => {
			window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
		}, 200);
	}, [slugOrId]);

	const handleBuyNow = () => {
		if (!service) return;

		dispatch(
			addToCart({
				service_id: service._id,
				name: getServiceDisplayName(service),
				image_url: getIndividualServiceImage(service),
				price: service.price,
				quantity: 1,
			}),
		);
		toast.success(`${getServiceDisplayName(service)} added to cart!`);
	};

	const renderSection = (section: ServiceSection, index: number) => {
		const imageOnRight = section.imagePosition === 'right';
		const sectionImage = section.image?.trim();

		return (
			<div
				key={`${section.title}-${index}`}
				className='flex flex-col md:flex-row justify-between gap-8 md:gap-8'
			>
				<div
					className={`lg:w-[47%] w-full text-center lg:text-left ${
						imageOnRight ? 'md:order-2' : ''
					}`}
				>
					<H1 text={section.title || 'Section'} />
					<p className='small_text1 font-SFPro'>{section.description}</p>
				</div>
				{sectionImage ? (
					<div className='lg:w-[47%] w-full rounded-xl overflow-hidden lg:h-[20rem]'>
						<img
							src={sectionImage}
							alt={section.title || 'Section image'}
							className='object-cover w-full h-full rounded-xl'
						/>
					</div>
				) : null}
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className='w-full min-h-[60vh] flex items-center justify-center'>
				<PuffLoader color='#C4FE01' />
			</div>
		);
	}

	if (error || !service) {
		return (
			<section className='py-16 px-6 text-center'>
				<p className='text-muted-foreground mb-4'>{error || 'Service not found'}</p>
				<Link to='/store' className='text-[#C4FE01] underline'>
					Back to store
				</Link>
			</section>
		);
	}

	const displayName = getServiceDisplayName(service);
	const features = service.features || [];
	const sections = service.sections || [];
	const heroImage = getHeroImage(service);

	return (
		<section className='py-4 md:py-10'>
			<div className='hero1 h-[100vh] w-full'>
				<div className='absolute left-0 top-0 bottom-0 right-0'>
					<img
						src={heroImage || branding}
						alt={displayName}
						onLoad={() => setIsHeroLoaded(true)}
						className={`${isHeroLoaded ? 'OP1' : 'hidden'} w-full h-full object-cover`}
					/>
					{!isHeroLoaded && (
						<div className='w-full h-full flex items-center justify-center bg-black/40'>
							<PuffLoader color='#C4FE01' />
						</div>
					)}
				</div>
				<div className='w-full lg:w-[80vw] xl:w-[80vw] 2xl:w-[80vw] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[100vh]'>
					<div className='mt-5 w-full lg:w-fit absolute px-6 lg:p-8 lg:pr-5 -translate-x-1/2 lg:-translate-x-[100%] -translate-y-1/2 top-[60%] left-[50%] lg:left-[100%] m2:top-[55%] m3:top-[50%] lg:top-[40%] lg:-translate-y-1/4'>
						<div className='bg-black2 backdrop-blur-xl rounded-xl overflow-hidden'>
							<div className='flex flex-col gap-5 p-6'>
								<H1 text={service.hero?.title || displayName} />
								<div className='flex flex-col items-start'>
									<span className='lg:text-base xl:text-lg'>
										{formatServicePrice(service)}
									</span>
									{service.deliveryTime && (
										<span className='font-SFPro text-[.6rem] leading-5'>
											{service.shortDescription || getHeroDescription(service)}
											{service.shortDescription && service.deliveryTime ? ' - ' : ''}
											{service.deliveryTime}
										</span>
									)}
									{!service.deliveryTime && (service.shortDescription || getHeroDescription(service)) && (
										<span className='font-SFPro text-[.6rem] leading-5'>
											{service.shortDescription || getHeroDescription(service)}
										</span>
									)}
								</div>
								{features.length > 0 && (
									<div className='flex flex-col gap-2'>
										{features.map((feature) => (
											<div key={feature} className='flex font-SFPro text-sm items-center gap-4'>
												<span>
													<img src={tick} alt='' />
												</span>
												<span>{feature}</span>
											</div>
										))}
									</div>
								)}
								{service.can_purchase !== false && (
									<Button
										text='Buy now'
										className='bg-color-secondary btn_base w-full'
										onClick={handleBuyNow}
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{(sections.length > 0 || service.description) && (
				<section className='xl:w-[80vw] 2xl:w-[80vw] mx-auto'>
					<div className='py-[3rem] md:py-10'>
						<div className='py-16 flex flex-col gap-8 md:px-14 sm:gap-16 md:gap-16 px-6 xl:px-4'>
							{service.description && (
								<div className='text-center lg:text-left'>
									<p className='small_text1 font-SFPro'>{service.description}</p>
								</div>
							)}
							{sections.length > 0 && (
								<div className='flex flex-col gap-16'>
									{sections.map((section, index) => renderSection(section, index))}
								</div>
							)}
						</div>
					</div>
				</section>
			)}
		</section>
	);
}
