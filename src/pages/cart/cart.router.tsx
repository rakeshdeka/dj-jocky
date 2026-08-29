import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { updateQuantity, removeFromCart } from '../../redux/cartSlice';
import Button from '../../components/button/button.component';
import minus from './minus.svg';
import plus from './plus.svg';
import { MdDelete } from "react-icons/md";

export default function Cart() {
	const cartItems = useSelector((state: RootState) => state.cart.items);

	const subtotal = cartItems.reduce(
		(sum, item) => sum + item.price * (item.quantity || 1),
		0
	);

	return (
		<div className='w-full bg-black-light lg:pt-[8rem] pt-[5rem]'>
			<section className='xl:w-[80vw] 2xl:w-[80vw] mx-auto'>
				<div className='px-6 md:px-14 py-12 xl:px-4'>
					<div className='flex flex-col gap-12 w-full'>
						<div className='flex w-full justify-center py-4 flex-col items-center gap-2'>
							{/* Header */}
							<div className='md:flex m1:hidden justify-between w-full text-[.8rem] md:text-[.78rem] lg:text-[.78rem] xl:text-[.93rem] px-4 py-2'>
								<div className='w-4/12'>Product</div>
								<div className='md:w-2/12'>Price</div>
								<div className='md:w-2/12'>Quantity</div>
								<div className='md:w-2/12 text-right'>Subtotal</div>
								<div className='md:w-2/12 text-center'>Action</div>
							</div>

							{/* Cart Items */}
							{cartItems.length > 0 ? (
								cartItems.map((item) => (
									<ProductItem
										key={item.service_id}
										id={item.service_id}
										name={item.name}
										image={item.image_url || ''}
										price={item.price}
										quantity={item.quantity || 1}
									/>
								))
							) : (
								<p className='text-white py-4'>Your cart is empty.</p>
							)}
						</div>

						{/* Cart Totals */}
						<div className='flex flex-col gap-6 sm:w-8/12 md:w-6/12 w-full mx-auto items-center'>
							<h1 className='text-color-primary capitalize w-full lg:text-base xl:text-lg'>
								Cart totals
							</h1>
							<div className='w-full text-sm flex justify-between'>
								<span>Subtotal</span>
								<span className='lg:text-base xl:text-lg'>
									${subtotal.toFixed(2)}
								</span>
							</div>

							{/* Coupon + Buy */}
							<div className='flex flex-col gap-2 w-full'>
								<div className='flex w-full gap-2'>
									<input
										type='text'
										placeholder='coupon code'
										className='w-8/12 h-14 text-center rounded bg-black4 text-grey-light placeholder:text-grey-light outline-none'
									/>
									<div className='w-4/12 flex justify-center'>
										<Button
											text='Apply'
											className='bg-black rounded-lg w-full h-14 capitalize'
											onClick={() => {}}
										/>
									</div>
								</div>
								<div className='w-full flex justify-center'>
									<Button
										text='Buy'
										className='bg-color-secondary rounded-lg py-6 px-6 w-full capitalize'
										onClick={() => {}}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

interface ProductItemProps {
	id: string;
	name: string;
	image: string;
	price: number;
	quantity: number;
}

function ProductItem({ id, name, image, price, quantity }: ProductItemProps) {
	const dispatch = useDispatch();

	const handleUpdate = (delta: number) => {
		const newQty = quantity + delta;
		if (newQty > 0) {
			dispatch(updateQuantity({ service_id: id, quantity: newQty }));
		}
	};

	const handleRemove = () => {
		dispatch(removeFromCart(id));
	};

	return (
		<div className='bg-black rounded-lg w-full p-4 flex m1:flex-col gap-6 md:flex-row items-center'>
			<h1 className='text-color-primary md:hidden lg:text-2xl text-base'>
				{name}
			</h1>
			<div className='flex justify-between items-center md:w-full lg:text-base xl:text-lg'>
				<h1 className='text-color-primary md:block m1:hidden md:w-4/12'>
					{name}
				</h1>
				<h3 className='w-2/12'>${price}</h3>
				<div className='flex items-center justify-between md:w-2/12'>
					<div
						className='rounded-full lg:rounded-lg lg:w-8 lg:h-8 bg-black4 flex items-center justify-center w-6 h-6 cursor-pointer'
						onClick={() => handleUpdate(-1)}
					>
						<img src={minus} alt='-' className='w-3 lg:w-4' />
					</div>
					<div className='px-2 text-lg'>{quantity}</div>
					<div
						className='rounded-full lg:rounded-lg lg:w-8 lg:h-8 bg-black4 flex items-center justify-center w-6 h-6 cursor-pointer'
						onClick={() => handleUpdate(1)}
					>
						<img src={plus} alt='+' className='w-3' />
					</div>
				</div>
				<div className='m1:hidden md:block w-2/12 text-right'>
					${(quantity * price).toFixed(2)}
				</div>
				{/* Remove Button */}
				<div className='md:w-2/12 text-center'>
					<button
						onClick={handleRemove}
						className='bg-red-600 text-red rounded px-3 py-1 hover:bg-red-700 transition'>
						<MdDelete />
					</button>
				</div>
			</div>
		</div>
	);
}
