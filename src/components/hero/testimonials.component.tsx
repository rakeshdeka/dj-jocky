import { useState } from 'react';
import e1 from '../../assets/svgs/Ellipse1.svg';
import e2 from '../../assets/svgs/Ellipse2.svg';
import e3 from '../../assets/svgs/Ellipse3.svg';
import e4 from '../../assets/svgs/Ellipse4.svg';
import m1 from '../../assets/svgs/user.jpg';
import H1 from '../header/header.component';
const data = [
	{
		image: e1,
		header:
			'Design is everything, and these guys have nailed it.',
		name: 'Priyam Dey',
		companyName: 'Jockey',
	},
	{
		image: e2,
		header:
			'Design is everything, and these guys have nailed it.',
		name: 'Sam Paul',
		companyName: 'Jockey',
	},
	{
		image: e3,
		header:
			'Design is everything, and these guys have nailed it.',
		name: 'Arjun Das',
		companyName: 'Jockey',
	},
	{
		image: e4,
		header:
			'Design is everything, and these guys have nailed it.',
		name: 'Prosenjit Sharma',
		companyName: 'Jockey',
	},
];
interface data {
	image: string;
	header: string;
}
export default function Hero2() {
	const [activeTestimonial, setActiveTestimonial] =
		useState(data[0]);

	return (
		<section className='xl:w-[80vw] 2xl:w-[80vw] mx-auto   '>
			<div className='flex flex-col gap-2 px-6 md:px-14 py-[3rem] md:py-10 xl:px-4 '>
				<div className='w-full h-full  m-auto bg-color-secondary rounded-lg flex flex-col md:flex-row   md:justify-around   p-4 md:p-10 lg:p-10 '>
					<div className='m1:text-center md:text-left w-full md:w-[48%] lg:w-[50%] xl:w-[48%] lg:text-left '>
						<H1 text="Here's what our friends have to say." />
					</div>
					<div className='w-full md:w-[45%] md:px-6 lg:px-8 xl:px-12 px-3 flex flex-col gap-10 py-1  m1:items-center md:items-start '>
						<p className=' text-center  md:text-left   small_text1'>
							DesignJockey is a service that can provide you
							with amazing designs for a fixed monthly fee.
							It eliminates the need for freelancers and
							agencies, so you can get all the design work
							you need in one place.
						</p>
						<div className='relative   h-12 m1:w-[10.7rem] lg:w-[12.5]'>
							<img
								src={data[3].image}
								alt=''
								className='absolute m1:w-[3.2rem] lg:w-[3.8rem] m1:left-[7.5rem] lg:left-[8.7rem] cursor-pointer hover:scale-110 hover:z-20'
								onClick={() =>
									setActiveTestimonial(data[3])
								}
							/>

							<img
								src={data[2].image}
								alt=''
								className='absolute m1:w-[3.2rem] lg:w-[3.8rem] m1:left-[5rem] lg:left-[5.8rem] cursor-pointer hover:scale-110 hover:z-20'
								onClick={() =>
									setActiveTestimonial(data[2])
								}
							/>
							<img
								src={data[1].image}
								alt=''
								className='absolute m1:w-[3.2rem] lg:w-[3.8rem] m1:left-[2.5rem] lg:left-[2.9rem] cursor-pointer hover:scale-110 hover:z-20'
								onClick={() =>
									setActiveTestimonial(data[1])
								}
							/>
							<img
								src={data[0].image}
								alt=''
								className='absolute m1:w-[3.2rem] lg:w-[3.8rem]  cursor-pointer hover:scale-110 hover:z-20'
								onClick={() =>
									setActiveTestimonial(data[0])
								}
							/>
						</div>
					</div>
				</div>
				<div className='flex lg:flex-row flex-col gap-2'>
					<div className='bg-[#191919] rounded-lg p-6  flex flex-col gap-6 lg:w-[60%]'>
						<div className='flex relative pl-4 lg:pl-8'>
							<h1 className='text-[2rem] lg:text-[2.5rem] text-[#C4FE01] absolute -left-2 -top-4'>
								"
							</h1>
							<h1 className='text-[#C4FE01] lg:text-2xl text-base  capitalize '>
								{activeTestimonial.header ||
									'Design is everything, and these guys have nailed it.'}
							</h1>
						</div>
						<div className='flex gap-4 pl-4 lg:pl-8'>
							<div>
								<img
									src={activeTestimonial.image || m1}
									alt=''
									className='rounded-full w-12 h-12 object-cover'
								/>
							</div>
							<div>
								<h1 className='lg:text-base text-sm '>
									{activeTestimonial.name || 'Hrishiraj'}
								</h1>
								<p className='font-SFPro text-grey-light text-[.7rem]'>
									{activeTestimonial.companyName || ''}
								</p>
							</div>
						</div>
					</div>
					<div className='bg-[#191919] text-grey-light rounded-lg p-4 md:p-6 text-sm text-left md:text-left flex flex-col gap-4 lg:w-[40%]'>
						<div>
							<h1 className='m1:text-[.7rem] lg:text-sm leading-6'>
								Skip the meetings
							</h1>
							<p className='font-SFPro text-[.6rem] leading-3'>
								Meetings not your thing? Same here. That's
								why you won't find any on our schedule.
							</p>
						</div>
						<div>
							<h1 className='m1:text-[.7rem] lg:text-sm leading-6'>
								One dashboard
							</h1>
							<p className='font-SFPro text-[.6rem] leading-3'>
								Effortless dashboard navigation. View
								active, queued and completed tasks with
								ease.
							</p>
						</div>
						<div>
							<h1 className='m1:text-[.65rem] lg:text-sm leading-6'>
								Invite team members
							</h1>
							<p className='font-SFPro text-[.6rem] leading-3'>
								Invite as many team members as you need to
								request and monitor progress seamlessly.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
