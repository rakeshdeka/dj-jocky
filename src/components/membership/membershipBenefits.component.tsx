import { HashLink } from 'react-router-hash-link';
import m1 from '../../assets/svgs/membership/1.svg';
import m2 from '../../assets/svgs/membership/2.svg';
import m3 from '../../assets/svgs/membership/3.svg';
import m4 from '../../assets/svgs/membership/4.svg';
import m5 from '../../assets/svgs/membership/5.svg';
import m6 from '../../assets/svgs/membership/6.svg';
import Button from '../button/button.component';
import H1 from '../header/header.component';
const data1 = [
	{
		imgae: m1,
		header: 'Unlimited Requests',
		content:
			'Submit as many design requests as you like without any restrictions or extra charges. ',
	},
	{
		imgae: m2,
		header: 'Fixed Monthly Rate',
		content:
			'Keep your design expenses predictable. No surprises, just reliable fixed monthly rate. ',
	},
	{
		imgae: m3,
		header: 'Quick Turnaround',
		content:
			'Fast, efficient design solutions tailored to your needs. Get quick results without the wait. ',
	},
];
const data2 = [
	{
		imgae: m4,
		header: 'One Dashboard',
		content:
			'Stay on top of your tasks with ease using our all-in-one dashboard.',
	},
	{
		imgae: m5,
		header: 'Top Tier Quality',
		content:
			'Guaranteed top-notch quality every step of the way for excellent results.',
	},
	{
		imgae: m6,
		header: 'Tailored Service',
		content:
			'Experience personalized service specifically designed for you.',
	},
];
export default function MembershipBenefits() {
	return (
		<section className='xl:w-[80vw] 2xl:w-[80vw] mx-auto '>
			<div className='  m-auto flex flex-col gap-12 px-6 md:px-14 py-[3rem] md:py-10  xl:px-4'>
				<div className='flex w-full'>
					<div className='lg:w-7/12 m1:w-full'>
						<H1 text='Membership benefits' />
						<p className='small_text header_perks pt-4'>
							Benefits so compelling, you'll never want to
							look elsewhere{' '}
							<br className='hidden sm:block md:hidden' />{' '}
							for your design needs. No kidding.
						</p>
					</div>
					<HashLink
						smooth
						className='lg:flex hidden w-5/12 h-fit justify-end '
						to={'/#plans'}>
						<Button
							text='See Plans'
							className='bg-color-secondary btn_base  '
							onClick={() => {}}
						/>
					</HashLink>
				</div>
				<div className='flex flex-col gap-8  sm:gap-16 md:gap-12 flex-wrap w-full sm:flex-row justify-center '>
					<div className='flex flex-col gap-8 flex-wrap w-full sm:flex-row justify-center items-start sm:gap-16 md:gap-2 lg:gap-2 '>
						{data1.map((e) => (
							<div className='flex flex-col justify-center gap-8  md:gap-6    w-full  md:w-[32%]  lg:w-[32.5%]'>
								<div className=' w-full    h-fit   '>
									<img
										src={e.imgae}
										alt=''
										className='h-full  w-full'
									/>
								</div>
								<div>
									<h3 className='text-center text-sm '>
										{e.header}
									</h3>
									<p className='text-center small_text1 m1:px-0  sm:px-28 lg:px-0 2xl:px-16 '>
										{e.content}
									</p>
								</div>
							</div>
						))}
					</div>
					<div className='flex flex-col gap-8 flex-wrap w-full sm:flex-row justify-center sm:gap-16 md:gap-2 lg:gap-2 items-start 	'>
						{data2.map((e) => (
							<div className='flex flex-col justify-center gap-8  md:gap-6    w-full  md:w-[32%]  lg:w-[32.5%] '>
								<div className='w-full    h-fit'>
									<img
										src={e.imgae}
										alt=''
										className=' w-full '
									/>
								</div>
								<div>
									<h3 className='text-center text-sm  '>
										{e.header}
									</h3>
									<p className='text-center small_text1  m1:px-0 sm:px-28 lg:px-0  2xl:px-16 '>
										{e.content}
									</p>
								</div>
							</div>
						))}
					</div>
					<HashLink
						smooth
						className=' w-full flex justify-center lg:hidden'
						to={'/#plans'}>
						<Button
							text='See Plans'
							className='bg-color-secondary btn_base w-full mx-12 sm:w-[65vw] '
							onClick={() => {}}
						/>
					</HashLink>
				</div>
			</div>
		</section>
	);
}
