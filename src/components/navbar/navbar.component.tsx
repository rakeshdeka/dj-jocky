import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import logo from '../../assets/svgs/logo.svg';
import cross from '../../assets/svgs/cross.svg';
import humburger from '../../assets/svgs/humburger.svg';
import Button from '../button/button.component';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdDashboard } from 'react-icons/md';
import { getStoredAuth } from '../../lib/auth-storage';

import './nv.css';

export default function Navbar() {
	const [mobileMenu, setMobileMenu] =
		useState<boolean>(false);
	useEffect(() => {
		const clicked = localStorage.getItem('clicked');
		if (clicked != 'services' && clicked != 'plans') {
			setTimeout(() => {
				window.scrollTo({
					top: 0,
					left: 100,
					behavior: 'smooth',
				});
			}, 200);
		}
	}, []);
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [userRole, setUserRole] = useState<string | null>(null);

	useEffect(() => {
		const { isAuthenticated: loggedIn, role } = getStoredAuth();
		setIsAuthenticated(loggedIn);
		setUserRole(role);
	}, []);

	const handleClick = () => {
		const { isAuthenticated: loggedIn, role } = getStoredAuth();
		if (!loggedIn || !role) {
			navigate('/login');
			return;
		}

		switch (role) {
			case 'client':
				navigate('/client/briefs');
				break;
			case 'designer':
				navigate('/designer/dashboard');
				break;
			case 'admin':
				navigate('/admin/dashboard');
				break;
			default:
				navigate('/login');
		}
	};
	const [lastScrollPosition, setLastScrollPosition] =
		useState(0);
	const [hideNavbar, setHideNavbar] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollPosition = window.pageYOffset;

			if (
				currentScrollPosition > lastScrollPosition &&
				!hideNavbar
			) {
				// If the scroll direction is down and the user has scrolled past the navbar, hide the navbar
				setHideNavbar(true);
			} else if (
				currentScrollPosition < lastScrollPosition ||
				currentScrollPosition === 0
			) {
				// If the scroll direction is up or the user is at the top of the page, show the navbar
				setHideNavbar(false);
			}
			// Set the last scroll position to the current scroll position
			setLastScrollPosition(currentScrollPosition);
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, [lastScrollPosition, hideNavbar]);
	return (
		<>
			<div
				className={`${hideNavbar ? 'hide' : 'n'
					} fixed left-[50%] top-[.4rem] centerrr1  xl:w-[80vw] 2xl:w-[80vw]  z-[100] px-6 md:px-14  xl:px-4 w-full  `}>
				<nav className='w-full mt-8   p-4 px-6 lg:p-0 flex items-center rounded-xl     bg-black2 backdrop-blur-xl    '>
					<div className='flex w-full  justify-between items-center '>
						<Link
							className='h-full  lg:pl-4'
							to='/'
							onClick={() => {
								localStorage.setItem('clicked', 'home');
							}}>
							<img
								src={logo}
								alt='logo'
								className='w-8 md:w-10 '
							/>
						</Link>
						<ul className=' text-color-primary items-center gap-4 m1:text-[.65rem] text-[.65rem]   md:text-[.75rem] hidden lg:flex '>
							<Link
								className=' '
								to='/store'
								onClick={() => {
									localStorage.setItem('clicked', 'store');
								}}>
								store
							</Link>
							<Link
								to='/work'
								onClick={() => {
									localStorage.setItem('clicked', 'work');
								}}>
								work
							</Link>
							<HashLink
								smooth
								to={'/#services'}
								onClick={() => {
									localStorage.setItem(
										'clicked',
										'services'
									);
								}}>
								services
							</HashLink>
							<HashLink
								smooth
								to={'/#plans'}
								onClick={() => {
									localStorage.setItem('clicked', 'plans');
								}}>
								plans
							</HashLink>
							<Link
								to='/cart'
								onClick={() => {
									localStorage.setItem('clicked', 'cart');
								}}>
								cart
							</Link>
						</ul>
						<div
							className='lg:hidden '
							onClick={() => setMobileMenu(!mobileMenu)}>
							{!mobileMenu ? (
								<img src={humburger} alt='logo' />
							) : (
								<img src={cross} alt='logo' />
							)}
						</div>
						<Button
							text={
								isAuthenticated && userRole ? (
									<span className="">
										<MdDashboard className="text-4xl" />
									</span>
								) : (
									'Login'
								)
							}
							className="btn_base bg-black hidden lg:flex items-center justify-center rounded-lg capitalize text-color-primary"
							onClick={handleClick}
						/>
					</div>
				</nav>

				{mobileMenu ? (
					<div className='  z-[100]  pt-6  lg:hidden '>
						<div className='bg-black2 backdrop-blur-xl w-full  rounded-xl '>
							<ul className=' text-color-primary   flex flex-col '>
								<Link
									to='/store'
									className=' p-4  pt-8 m2:py-6 m2:pt-12 w-full text-center text-[1.3rem] m3:text-[1.7rem] md:text-[2.4rem] lg:text-[2.1rem] xl:text-[2.9rem] '
									onClick={() => {
										localStorage.setItem(
											'clicked',
											'store'
										);
										setMobileMenu(false);
									}}>
									store
								</Link>
								<Link
									to='/work'
									className='p-4 py-5  m2:py-6 w-full text-center text-[1.3rem] m3:text-[1.7rem] md:text-[2.4rem] lg:text-[2.1rem] xl:text-[2.9rem]'
									onClick={() => {
										localStorage.setItem('clicked', 'work');
										setMobileMenu(false);
									}}>
									work
								</Link>
								<HashLink
									smooth
									className='p-4 py-5 m2:py-6 w-full text-center text-[1.3rem] m3:text-[1.7rem] md:text-[2.4rem] lg:text-[2.1rem] xl:text-[2.9rem]'
									to={'/#services'}
									onClick={() => {
										setMobileMenu(false);
										localStorage.setItem(
											'clicked',
											'services'
										);
									}}>
									services
								</HashLink>
								<HashLink
									smooth
									className='p-4 py-5 m2:py-6 w-full text-center text-[1.3rem] m3:text-[1.7rem] md:text-[2.4rem] lg:text-[2.1rem] xl:text-[2.9rem]'
									to={'/#plans'}
									onClick={() => {
										setMobileMenu(false);
										localStorage.setItem(
											'clicked',
											'plans'
										);
									}}>
									plans
								</HashLink>
								<Link
									className='p-4 py-5 m2:py-6 w-full text-center text-[1.3rem] m3:text-[1.7rem] md:text-[2.4rem] lg:text-[2.1rem] xl:text-[2.9rem]'
									to='/cart'
									onClick={() => {
										localStorage.setItem('clicked', 'cart');
										setMobileMenu(false);
									}}>
									cart
								</Link>
								<div className=' pt-5 m2:pt-6 w-full p-4'>
									<button
										className='w-full btn_base  rounded-lg capitalize bg-black4  text-white  '
										onClick={(e) => {
											console.log(e);
											setMobileMenu(false);
										}}>
										login
									</button>
								</div>
							</ul>
						</div>
					</div>
				) : (
					''
				)}
			</div>
			{/* {console.log('from navbar', clicked)} */}
		</>
	);
}
