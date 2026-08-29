/* eslint-disable no-mixed-spaces-and-tabs */
import './membership.css';
import Button from '../button/button.component.tsx';
import H1 from '../header/header.component.tsx';
import { useEffect } from 'react';

const datas = [
	{
		plan: 'Starter',
		price: '833',
		facilities: [
			'Updates every 48 hours.',
			'1 pause allowed per month.',
			'No minimum commitment;  ',
			'pause or cancel anytime.',
			'Ownership of source files.',
			'Dedicated designer.',
		],

		tenure: 'Paid monthly',
		buyType: 'Buy now',
	},

	{
		plan: 'Core',
		price: '933',
		facilities: [
			'Updates once daily.',
			'1 pause allowed per month.',
			'No minimum commitment; ',
			'pause or cancel anytime.',
			'Ownership of source files.',
			'Dedicated designer.',
		],
		tenure: 'Paid quarterly',
		buyType: 'Buy now',
	},
	{
		plan: 'Growth',
		price: '1033',
		facilities: [
			'Updates twice daily.',
			'2 pause allowed per month.',
			'No minimum commitment;',
			'pause or cancel anytime.',
			'Ownership of source files.',
			'Dedicated designer.',
		],
		tenure: 'Paid yearly',
		buyType: 'Buy now',
	},
];

interface MembershipItemsProps {
	plan: string;
	price: string;
	facilities?: string[];
	tenure: string;
	buyType: string;
}

const MembershipItem1 = ({
	plan,
	price,
	facilities = [],
	tenure,
	buyType,
}: MembershipItemsProps) => {
	return (
		<div className='text-left flex flex-col justify-center   lg:justify-around bg-black3 rounded-2xl items-center p-4 pt-8  gap-4 lg:gap-2 lg:p-8 || w-full sm:w-[48%] md:w-[49%] min-h-[18rem] lg:items-start'>
			<div className='flex flex-col gap-4 lg:gap-2  '>
				<h1 className='text-xl md:text-3xl  '>{plan}</h1>

				<div className='small_text  font-SFPro  flex flex-col items-start '>
					<ul className='flex flex-col  gap-2 list-disc	list-inside '>
						{facilities?.length > 0
							? facilities?.map((e) => <li>{e}</li>)
							: ''}
					</ul>
				</div>
				<div className='flex flex-col gap-1 items-start lg:items-start'>
					{price ? (
						<h1 className='text-2xl md:text-3xl'>
							${price}/m
						</h1>
					) : (
						''
					)}
					{tenure ? (
						<span className='small_text text-grey-light pb-3'>
							{tenure}
						</span>
					) : (
						''
					)}
				</div>
			</div>
			{buyType ? (
				<Button
					text={buyType}
					className='bg-color-secondary btn_base w-full '
					onClick={() => {}}
				/>
			) : (
				''
			)}
		</div>
	);
};

const MembershipItem = ({
	plan,
	price,
	facilities = [],
	tenure,
	buyType,
}: MembershipItemsProps) => {
	return (
		<div className='flex flex-col justify-center lg:items-start lg:justify-around bg-black3 rounded-2xl items-center p-4 pt-8   lg:p-8 gap-4 lg:gap-2 h-full w-full '>
			<h1 className='text-xl md:text-3xl text-center'>
				{plan}
			</h1>
			<div className='small_text  font-SFPro  flex flex-col items-start pl-3 '>
				<ul className='flex flex-col  gap-2 list-disc	list-outside  '>
					{facilities?.length > 0
						? facilities?.map((e) => <li>{e}</li>)
						: ''}
				</ul>
			</div>
			<div className='flex flex-col gap-1 items-center lg:items-start'>
				{price ? (
					<h1 className='text-2xl md:text-3xl'>
						${price}/m
					</h1>
				) : (
					''
				)}
				{tenure ? (
					<span className='small_text text-grey-light pb-3'>
						{tenure}
					</span>
				) : (
					''
				)}
			</div>
			{buyType ? (
				<Button
					text={buyType}
					className='bg-color-secondary btn_base   min-w-full max-w-full   pxd'
					onClick={() => {}}
				/>
			) : (
				''
			)}
		</div>
	);
};

const MembershipLevels = () => {
	// const [cwidth, setCWidth] = useState(0);
	useEffect(() => {
		const q = document.getElementsByClassName('pxd');
		if (q?.length > 0) {
			// setCWidth(q[0].clientWidth / 16);
			const p = document.getElementsByClassName('vv');
			for (const i of p) {
				(i as HTMLElement).style.width = `${
					(q[0] as HTMLElement).clientWidth
				}px`;
			}
		}
		const w = document.getElementsByClassName('cg');
		const a = document.getElementsByClassName('cy');
		(a[0] as HTMLElement).style.height = `${
			(w[0] as HTMLElement).clientHeight
		}px`;
	}, []);
	return (
		<>
			<div id='plans' className=' ' />
			<section className='xl:w-[80vw] 2xl:w-[80vw] mx-auto'>
				<div className='m-auto flex flex-col gap-12 px-6 md:px-14  xl:px-4  py-[3rem] md:py-10'>
					<div>
						<H1 text='Membership Tiers' />

						<p className='small_text header_perks pt-2'>
							Choose the plan that fits you best. Our
							diverse range of plans ensures an option
							tailored just for you.
						</p>
					</div>
					<div className='flex  flex-wrap w-full gap-2 justify-center cx'>
						{datas.map((data: MembershipItemsProps) => (
							<MembershipItem1 {...data} />
						))}
						{/* <div className='flex flex-col justify-between lg:items-start lg:p-8  lg:justify-between bg-black3 rounded-2xl items-center p-4 pt-8 gap-4 lg:gap-2 || w-full sm:w-[48%] md:w-[49%] min-h-[18rem]'>
							<div className='flex flex-col justify-center lg:items-start  lg:justify-between bg-black3 rounded-2xl items-center  gap-4 lg:gap-2 || w-full'>
								<h1 className='text-xl md:text-3xl text-center lg:text-left'>
									Website Development
								</h1>
								<div className='flex flex-col gap-1 items-center md:block font-SFPro m1:text-[.6rem] text-[.6rem] lg:text-[1rem]  text-center lg:items-start'>
									<div className='small_text  xl:text-[1rem]  flex flex-col items-center lg:text-left'>
										Build your website faster with our
										website development service.
									</div>
								</div>
								<div className='flex flex-col gap-1 items-center lg:items-start  '>
									<h1 className='text-2xl md:text-3xl'>
										$625/m
									</h1>

									<span className='small_text text-grey-light pb-3 '>
										Requires subscription
									</span>
								</div>
							</div>

							<Button
								text='Add on'
								className='bg-color-secondary btn_base w-full'
								onClick={() => {}}
							/>
						</div> */}
						<div className='text-left flex flex-col justify-center   lg:justify-around bg-black3 rounded-2xl items-center lg:items-start p-4 py-8  gap-4 lg:gap-2 lg:p-8 || w-full sm:w-[48%] md:w-[49%] h-fit lg:min-h-[20rem] cg'>
							<div className='flex flex-col gap-4 lg:gap-2  items-start '>
								<h1 className='text-xl md:text-3xl '>
									What’s <br /> included:
								</h1>

								<div className='small_text  font-SFPro  flex flex-col items-start pl-4  '>
									<ul className='flex flex-col  gap-2 list-disc	list-outside '>
										<li>
											Unlimited briefs <br /> (One request
											at a time)
										</li>
										{[
											'Unlimited brands',
											'Unlimited file request',
											'Easy payments',
											'Pause or cancel anytime.',
										].map((e) => (
											<li>{e}</li>
										))}
									</ul>
								</div>
							</div>
						</div>
						<div className='flex flex-col justify-between lg:items-start lg:justify-between bg-black3 rounded-2xl items-center lg:p-8  p-4 pt-8  gap-4 lg:gap-2 || w-full sm:w-[48%] md:w-[49%] h-fit lg:min-h-[20rem] cy'>
							<div className='flex flex-col justify-center lg:items-start lg:justify-between bg-black3 rounded-2xl items-center  gap-4 lg:gap-2 || w-full '>
								<h1 className='text-xl md:text-3xl text-center lg:text-left'>
									Book a call
								</h1>
								<div className='flex flex-col gap-1 items-center md:block font-SFPro m1:text-[.6rem] text-[.6rem] lg:text-[1rem]  text-center lg:text-left'>
									<div className='small_text  xl:text-[1rem]  flex flex-col items-center lg:items-start'>
										Learn more about how DesignJockey works
										and how it benefits you.
									</div>
								</div>
							</div>

							<Button
								text='book a call'
								className='bg-black btn_base w-full'
								onClick={() =>
									window.open(
										'https://calendly.com/info-designjockey/45min'
									)
								}
							/>
						</div>
					</div>

					<div className=' flex-col ctnr gap-3  '>
						{datas.map((data, index) => (
							<div key={index} className={`m${index + 1}`}>
								<MembershipItem {...data} />
							</div>
						))}
						<div className='m5'>
							<div className='flex flex-col  items-center lg:items-start   bg-black3 rounded-2xl  p-4 pt-8  gap-4 lg:gap-2 lg:p-8  h-full '>
								<h1 className='text-xl md:text-3xl m1:text-center lg:text-start  '>
									What’s included:
								</h1>
								<div className='small_text  font-SFPro  flex flex-col items-start pl-4  '>
									<ul className='flex flex-col  gap-2 list-disc	list-outside '>
										<li>
											Unlimited briefs (One request at a
											time)
										</li>
										{[
											'Unlimited brands',
											'Unlimited file request',
											'Easy payments',
											'Pause or cancel anytime.',
										].map((e) => (
											<li>{e}</li>
										))}
									</ul>
								</div>
							</div>
						</div>
						<div className='m6'>
							<div className='flex flex-row  bg-black3 rounded-2xl  h-full w-full p-4 pt-8   lg:py-8  lg:px-8'>
								<div className='flex flex-col  gap-4 '>
									<h1 className='text-xl md:text-3xl m1:text-center lg:text-start'>
										Book a call
									</h1>
									<div className='flex flex-col gap-1 items-center md:block small_text pr-24'>
										<span className=' block m1:text-center lg:text-start '>
											Learn more about how DesignJockey
											works and how it benefits you.
										</span>
									</div>
								</div>

								<div className=''>
									<Button
										text='Book a call'
										className='bg-black btn_base vv'
										onClick={() =>
											window.open(
												'https://calendly.com/info-designjockey/45min'
											)
										}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default MembershipLevels;

// export default MembershipItems;
