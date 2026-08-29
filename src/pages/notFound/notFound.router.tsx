import { Link } from 'react-router-dom';
import nf from '../../assets/svgs/404.svg';
import Button from '../../components/button/button.component';
export default function NotFound() {
	return (
		<section className='w-full pt-32 pb-10'>
			<div className=' mx-auto  flex flex-col gap-12 items-center lg:w-5/12 xl:w-[30%] w-9/12'>
				<img src={nf} alt='' className='w-full' />
				<Link to='/' className='w-full'>
					<Button
						text='Back to homepage'
						className='bg-color-secondary btn_base w-full'
						onClick={() => {}}
					/>
				</Link>
			</div>
		</section>
	);
}
