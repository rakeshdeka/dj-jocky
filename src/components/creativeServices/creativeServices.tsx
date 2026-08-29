import Button from '../button/button.component';
import H1 from '../header/header.component';
import './creativeServices.css';
import { HashLink } from 'react-router-hash-link';
const data = [
	'Brand guidelines',
	'Website design',
	'Mobile app design',
	'Motion Graphics',
	'Pitch decks',
	'Stationary',
	'Emailers',
	'Print Ads',
	'Slide decks',
	'Social media ',
	'Outdoors',
	'Google Ads',
	'Business cards',
	'Packaging',
	'Digital Ads',
	'Logo',
	'Blog Creative',
	'Posters',
	'Infographics',
	'Iconography',
];

export default function CreativeServices() {
	return (
		<>
			<section
				id='services'
				className='xl:w-[80vw] 2xl:w-[80vw] mx-auto flex flex-col gap-5 '>
				<div className='  flex flex-col gap-6 md:gap-2 py-[3rem] md:py-10 '>
					<div className='flex w-full px-6 md:px-14  xl:px-4'>
						<div className='lg:w-7/12 m1:w-full'>
							<H1 text='All Creative Services' />
							<p className='small_text header_perks pt-4'>
								Choose a plan that fits your needs - Basic
								for individuals or Advanced for larger teams
								- with the option to make a one-time
								purchase or subscribe.
							</p>
						</div>
						<HashLink
							smooth
							to={'/#plans'}
							className='lg:flex hidden w-5/12 h-fit justify-end '>
							<Button
								text='See Plans'
								className='bg-color-secondary btn_base '
								onClick={() => {}}
							/>
						</HashLink>
					</div>

					<div className='w-full m-auto flex flex-col justify-center  gap-2   sm:flex-row sm:flex-wrap px-6 md:px-14 pt-12 xl:px-4 '>
						{data.map((e) => (
							<div
								className=' bg-black3 rounded-lg m1:text-[.75rem] text-[.75rem] sm:text-[.8rem] 
							 md:text-[.93rem] lg:text-[.9rem] text-wrap	
							 w-full  sm:w-[30%] md:w-[25%] lg:w-[24%] xl:w-[19%]  1xl:w-[19.2%]
							  sm:h-24 2xl:h-36 md:text-left sm:p-6 md:py-6 2xl:py-6
							   sm:text-left text-center py-6 capitalize hover:bg-[#373636]		'>
								<span className='text-wrap	'>{e}</span>
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
