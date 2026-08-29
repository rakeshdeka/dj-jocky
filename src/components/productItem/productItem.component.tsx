import Button from '../button/button.component';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';

interface ProductItemProps {
	image: string;
	header: string;
	product: string;
	price?: number;
}

export default function ProductItem({
	image,
	header,
	product,
	price = 0,
}: ProductItemProps) {
	const dispatch = useDispatch();
	

	const handleBuyNow = () => {
		dispatch(
			addToCart({
				service_id: product,
				name: header,
				image_url: image,
				price,
				quantity: 1,
			})
		);
		toast.success(`${header} added to cart!`);
	};

	return (
		<div className='rounded-xl overflow-hidden h-[18rem] m2:h-[19rem] m3:h-[20rem] sm:h-[21rem] md:h-[23rem] lg:h-[24rem] relative ccx cursor-pointer flex-shrink-0 sm:w-[65%] md:w-full w-[75vw]'>
			<Link to={`/store/${product}`} className='z-2'>
				<img src={image} alt={header} className='object-cover w-full h-full' />
			</Link>

			<div className='absolute z-2 bottom-0 ccvv rounded-xl left-0 right-0'>
				<div className='bg-black2 backdrop-blur-xl rounded-xl'>
					<Link to={`/store/${product}`} className='z-2'>
						<div className='lg:px-6 px-3 sm:px-3 lg:pt-5 p-3'>
							<div className='text-left flex items-start justify-between  '>
								<h1 className='lg:text-base xl:text-lg w-[50%]'>{header}</h1>
								<p className=''>{`$${price}`}</p>
							</div>
						</div>
					</Link>

					<div className='px-3 pb-3 sm:px-3 sm:pb-3 lg:px-6 lg:pb-6'>
						<Button
							text='Buy now'
							className='bg-color-secondary btn_base font-monument w-full'
							onClick={handleBuyNow}
						/>
					</div>
				</div>
			</div>
			<ToastContainer />
		</div>
	);
}
