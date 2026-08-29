import { useEffect, useState } from 'react';
import { PuffLoader } from 'react-spinners';
import store from '../../assets/product/store.png';
import ProductItem from '../../components/productItem/productItem.component.tsx';
import {
	fetchIndividualServices,
	getIndividualServiceImage,
	getServiceDisplayName,
	getServiceSlugOrId,
	type IndividualService,
} from '../../lib/individual-services-api';

export default function Store() {
	const [isLoaded, setIsLoaded] = useState(true);
	const [services, setServices] = useState<IndividualService[]>([]);
	const [isServicesLoading, setIsServicesLoading] = useState(true);
	const token = localStorage.getItem('token');

	const handleImageLoaded = () => {
		setIsLoaded(true);
	};

	useEffect(() => {
		const loadServices = async () => {
			try {
				setIsServicesLoading(true);
				const items = await fetchIndividualServices(token);
				setServices(items);
			} catch (error) {
				console.error('[Store] Failed to fetch individual services:', error);
				setServices([]);
			} finally {
				setIsServicesLoading(false);
			}
		};

		loadServices();
	}, [token]);

	return (
		<>
			<div className=' hero1 h-[100vh]  w-full '>
				<img
					src={store}
					alt=''
					onLoad={handleImageLoaded}
					className={`${
						isLoaded ? 'OP1' : 'hidden'
					} w-full h-full object-cover`}
				/>

				<div
					className={`${
						isLoaded ? 'OP2 hidden ' : ''
					} w-full h-full flex items-center justify-center absolute left-0 top-0  `}>
					<PuffLoader color='#C4FE01' />
				</div>
			</div>
			<div className='xl:w-[80vw] 2xl:w-[80vw] mx-auto '>
				<div className='flex flex-col lg:grid grid-cols-3 gap-2 py-24 items-center lg:px-4  '>
					{isServicesLoading ? (
						<div className='col-span-full flex items-center justify-center py-16'>
							<PuffLoader color='#C4FE01' />
						</div>
					) : services.length > 0 ? (
						services.map((service) => (
							<ProductItem
								key={service._id}
								image={getIndividualServiceImage(service)}
								header={getServiceDisplayName(service)}
								product={getServiceSlugOrId(service)}
								price={service.price}
							/>
						))
					) : (
						<p className='col-span-full text-center text-muted-foreground py-16'>
							No individual services available right now.
						</p>
					)}
				</div>
			</div>
		</>
	);
}
