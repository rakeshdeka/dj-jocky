import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import m1 from '../../assets/svgs/membershipworks/m1.svg';
import m2 from '../../assets/svgs/membershipworks/m2.svg';
import m3 from '../../assets/svgs/membershipworks/m3.svg';
import Button from '../button/button.component';
import { HashLink } from 'react-router-hash-link';


const data = [
	{
		imgae: m1,
		content: 'Sign up, subscribe, and enjoy unlimited request access',
	},
	{
		imgae: m2,
		content:
			'Get your designs within the set timeline for your requests, Monday to Friday',
	},
	{
		imgae: m3,
		content: "Enjoy unlimited revisions until you're completely satisfied",
	},
];

export default function MembershipWorks() {
	return (
		<>
			<section className='xl:w-[80vw] 2xl:w-[80vw] mx-auto ' >
				<div className='m-auto flex flex-col gap-12  md:px-14 py-[3rem] md:py-10 xl:px-4  '>
					<div className='flex w-full  '>
						<div className='lg:w-8/12 m1:w-full '>
							<h1
								className='text-color-primary text-center md:text-left  capitalize  text-[1.3rem] m3:text-[1.7rem] md:text-[2.4rem] lg:text-[2.1rem] xl:text-[2.9rem]'
								
							>
								how membership works
							</h1>
							{/* {console.log(isInView)} */}
							<h4 className='small_text header_perks pt-4'>
								Perks so good you'll never need to go anywhere else for your
								design. Seriously.
							</h4>
						</div>
						<HashLink
							smooth
							to={'/#plans'}
							className='lg:flex hidden w-5/12 h-fit justify-end'
						>
							<Button
								text='See Plans'
								className='bg-color-secondary btn_base'
								onClick={() => {}}
							/>
						</HashLink>
					</div>
					<div className='md:flex flex-col gap-5 flex-wrap w-full sm:flex-row justify-center sm:gap-1 lg:gap-2 	hidden'>
						{data.map((e) => (
							<div className='flex flex-col  gap-2   w-full sm:w-[49%] md:w-[49%]  lg:w-[32.5%] '>
								<div className='w-full flex items-center justify-center   '>
									<img src={e.imgae} alt='' className='w-full h-full' />
								</div>

								<p className='text-center small_text1 m1:px-0 lg:px-12 2xl:px-16 py-2'>
									{e.content}
								</p>
							</div>
						))}
					</div>
					<div className='md:hidden   w-full snap-x snap-mandatory '>
						<div className='flex flex-row  gap-2 overflow-x-scroll snap-x snap-mandatory cc px-[16%]  '>
							{data.map((e, index) => (
								<div className='w-[65vw] flex-shrink-0  '>
									<div key={index} className='flex flex-col gap-2    lg:px-1 '>
										<div className='rounded-full bg-color-primary flex items-center justify-center h-16 m1:h-20  sm:h-[7.5rem] xl:h-[8.5rem] '>
											<img src={e.imgae} alt='' className='w-full h-full' />
										</div>
										<p className='text-center small_text1 m1:px-0 lg:px-12 2xl:px-16 py-2'>
											{e.content}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
					<HashLink
						smooth
						to={'/#plans'}
						className='w-full flex justify-center lg:hidden '
					>
						<Button
							text='See Plans'
							className='bg-color-secondary btn_base w-full mx-12 sm:w-[65vw]'
							onClick={() => {}}
						/>
					</HashLink>
				</div>
			</section>
		</>
	);
}
