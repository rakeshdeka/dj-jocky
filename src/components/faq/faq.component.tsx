// import { useEffect, useState } from 'react';
import cross from './cross.svg';
import plus from './plus.svg';
import H1 from '../header/header.component';
// import {useDispatch, useSelector } from 'react-redux';

// import { setFaqId, resetFaq } from './faqSlice';
// import { RootState, AppDispatch } from '../../store/store';
import { Transition } from '@headlessui/react';


const faqItems = [
	{
		id: 'f1',
		question: 'Why not hire a full-time designer?',
		answer:
			'DesignJockey provides unlimited design requests at a cost-effective price, without the overhead costs of hiring a full-time designer.',
	},

	{
		id: 'f2',
		question:
			'Is there a limit on the number of requests and revisions I can make?',
		answer:
			"Unlimited revisions until you're completely satisfied. Just provide feedback to your designer, and they'll make the necessary adjustments.",
	},

	{
		id: 'f3',
		question:
			'What design services does DesignJockey provide?',
		answer:
			"DesignJockey offers a variety of design services such as logo design, website design, social media post, video editing, and more. We've got your design needs covered.",
	},
	{
		id: 'f4',
		question:
			' How soon can I expect updates for the design?',
		answer:
			'Design updates are available every 48 hours, once daily, or twice daily depending on your membership level.',
	},
	{
		id: 'f5',
		question:
			'What if I need to pause or cancel my subscription?',
		answer:
			"You can cancel or pause your subscription anytime depending on the plans. Just let us know, and we'll handle it.",
	},
	{
		id: 'f6',
		question: 'How do I request designs?',
		answer:
			'With an active plan on DesignJockey, submitting design requests is a breeze. Log in and create a brief with necessary details or files on the dashboard, and our team will take care of the rest.',
	},
	{
		id: 'f7',
		question: 'What if I only have a single request?',
		answer:
			'No problem! You can purchase individual services from our store, which offers a wide range of options.',
	},
	{
		id: 'f8',
		question: 'Who will be handling my design projects?',
		answer:
			'Our experienced and talented designers will take care of your projects. Your dedicated designer will work closely with you to understand your requirements and provide excellent results.',
	},
	{
		id: 'f9',
		question: 'How do I get started with DesignJockey?',
		answer:
			"Sign up for DesignJockey's membership plan, submit your design requests through our dashboard, and let our team work their magic. Elevate your brand now!",
	},
	{
		id: 'f10',
		question: 'Can I see examples of your past work?',
		answer:
			'Check out our portfolio for impressive examples of our previous design projects.',
	},
	{
		id: 'f11',
		question:
			'How can I get in touch if I have more questions?',
		answer:
			'If you need assistance or have any questions, our support team is readily available. You can easily book a call with us at any time or just send us an email at dhruba@designjockey.in.',
	},
];
interface FaqItemsProps {
	question: string;
	answer: string;
	id: string;
}
const FaqItems = (props: FaqItemsProps) => {
	// const dispatch = useDispatch<AppDispatch>();
	// const currentFaqId = useSelector((state: RootState) => state.faq.currentFaqId);
	// const isOpen = currentFaqId === props.id;
  
	// const toggleFaq = () => {
	//   if (isOpen) {
	// 	dispatch(resetFaq());
	//   } else {
	// 	dispatch(setFaqId(props.id));
	//   }
	// };
  
	return (
	  <div className='bg-[#121212] rounded-2xl cursor-pointer faq'>
		<div
		  className='flex justify-between bg-black3 rounded-2xl items-center m2:px-8 py-5 m1:px-4
				gap-2 m1:text-[.7rem] m2:text-[.8rem]  m3:text-[.85rem] md:text-[.9rem] hover:bg-[#373636]'
		//   onClick={toggleFaq}
		>
		  <span className='w-[90%]'>{props.question}</span>
		  <span className='w-[10%] justify-end hidden lg:flex'>
			<Transition
			//   show={!isOpen}
			  enter='transition-opacity ease-in-out duration-400 delay-75'
			  enterFrom='opacity-0'
			  enterTo='opacity-100'
			  leave='transition-opacity ease-in-out duration-400 delay-75'
			  leaveFrom='opacity-100'
			  leaveTo='opacity-0'
			>
			  <img src={plus} alt='' className='w-[1rem]' />
			</Transition>
			<Transition
			//   show={isOpen}
			  enter='transition-opacity ease-in-out duration-300 delay-75'
			  enterFrom='opacity-0'
			  enterTo='opacity-100'
			  leave='transition-opacity ease-in-out duration-300 delay-75'
			  leaveFrom='opacity-100'
			  leaveTo='opacity-0'
			>
			  <img src={cross} alt='' className='w-[1rem]' />
			</Transition>
		  </span>
		</div>
		<Transition
		//   show={isOpen}
		  enter='transition-opacity ease-in-out duration-400'
		  enterFrom='opacity-0'
		  enterTo='opacity-100'
		  leave='transition-opacity ease-in-out duration-400'
		  leaveFrom='opacity-100'
		  leaveTo='opacity-0'
		>
		  <div className='m2:px-8 py-5 m1:px-4 m1:text-[.7rem] m2:text-[.8rem] m3:text-[.85rem] md:text-[.9rem] font-SFPro'>
			{props.answer}
		  </div>
		</Transition>
	  </div>
	);
  };
  
export default function Faq() {
	return (
		<section className='xl:w-[80vw] 2xl:w-[80vw] mx-auto  '>
			<div className='  m-auto flex flex-col gap-8  px-6 md:px-14  xl:px-4 py-4 pb-[6rem] md:py-10 md:pb-20'>
				<H1 text='FAQs' />
				<div className='w-full flex flex-col gap-2'>
					{' '}
					{faqItems.map((e) => (
						<FaqItems key={e.id} {...e} />
					))}
				</div>
			</div>
		</section>
	);
}
// import React from 'react'

// const faq = () => {
//   return (
// 	<div>faq.component</div>
//   )
// }

// export default faq
