import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Code2, Share2 } from 'lucide-react';
import { PuffLoader } from 'react-spinners';
import './work.css';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '../../components/dashboard/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../../components/dashboard/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '../../components/dashboard/ui/tooltip';
import {
	fetchPublicPortfolio,
	fetchPublicPortfolios,
	getPortfolioSlugOrId,
	type PortfolioItem as ApiPortfolioItem,
} from '../../lib/portfolio-api';

type WorkPortfolioItem = {
	id: string;
	title: string;
	summary: string;
	category: string;
	client: string;
	year: string;
	services: string[];
	hero: string;
	images: string[];
};

const mapToWorkItem = (item: ApiPortfolioItem, routeKey?: string): WorkPortfolioItem => ({
	id: getPortfolioSlugOrId(item) || routeKey || item._id,
	title: item.title,
	summary: item.summary,
	category: item.category,
	client: item.client,
	year: String(item.year),
	services: item.services,
	hero: item.hero,
	images: item.images.length > 0 ? item.images : [item.hero],
});

const INITIAL_VISIBLE = 20;
const LOAD_MORE_COUNT = 10;

const getColumnCount = () => {
	if (typeof window === 'undefined') return 5;
	if (window.matchMedia('(max-width: 630px)').matches) return 2;
	if (window.matchMedia('(max-width: 1023px)').matches) return 3;
	return 5;
};

const getProjectUrl = (id: string) => `${window.location.origin}/work/${id}`;

export default function Work() {
	const navigate = useNavigate();
	const { projectId } = useParams<{ projectId?: string }>();
	const observerTarget = useRef<HTMLDivElement | null>(null);
	const [portfolioItems, setPortfolioItems] = useState<WorkPortfolioItem[]>([]);
	const [isLoadingPortfolios, setIsLoadingPortfolios] = useState(true);
	const [selectedDetail, setSelectedDetail] = useState<WorkPortfolioItem | null>(null);
	const [isLoadingDetail, setIsLoadingDetail] = useState(false);
	const [detailError, setDetailError] = useState('');
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const [columnCount, setColumnCount] = useState(getColumnCount);

	const portfolioById = useMemo(
		() => new Map(portfolioItems.map((item) => [item.id, item])),
		[portfolioItems],
	);

	const openPortfolio = (item: WorkPortfolioItem) => {
		const index = portfolioItems.findIndex((entry) => entry.id === item.id);
		if (index >= visibleCount) {
			setVisibleCount(index + 1);
		}
		navigate(`/work/${item.id}`);
	};

	const closePortfolio = () => {
		navigate('/work', { replace: true });
	};

	const handleShare = async (item: WorkPortfolioItem) => {
		const shareUrl = getProjectUrl(item.id);
		const sharePayload = {
			title: item.title,
			text: item.summary,
			url: shareUrl,
		};

		try {
			if (navigator.share) {
				await navigator.share(sharePayload);
				return;
			}
			await navigator.clipboard.writeText(shareUrl);
		} catch {
			// User cancelled native share — no action needed
		}
	};

	const handleEmbed = async (item: WorkPortfolioItem) => {
		const shareUrl = getProjectUrl(item.id);
		const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
		await navigator.clipboard.writeText(embedCode);
	};

	const visibleItems = useMemo(
		() => portfolioItems.slice(0, visibleCount),
		[portfolioItems, visibleCount],
	);

	const columns = useMemo(() => {
		const cols: WorkPortfolioItem[][] = Array.from({ length: columnCount }, () => []);
		visibleItems.forEach((item, index) => {
			cols[index % columnCount].push(item);
		});
		return cols;
	}, [visibleItems, columnCount]);

	useEffect(() => {
		const loadPortfolios = async () => {
			try {
				setIsLoadingPortfolios(true);
				const items = await fetchPublicPortfolios();
				setPortfolioItems(items.map((item) => mapToWorkItem(item)));
			} catch (error) {
				console.error('[Work] Failed to load portfolio:', error);
				setPortfolioItems([]);
			} finally {
				setIsLoadingPortfolios(false);
			}
		};

		loadPortfolios();
	}, []);

	useEffect(() => {
		if (!projectId) {
			setSelectedDetail(null);
			setDetailError('');
			return;
		}

		const fromList = portfolioById.get(projectId);
		if (fromList) {
			setSelectedDetail(fromList);
		}

		const loadDetail = async () => {
			try {
				setIsLoadingDetail(true);
				setDetailError('');
				const item = await fetchPublicPortfolio(projectId);
				setSelectedDetail(mapToWorkItem(item, projectId));
			} catch (error) {
				console.error('[Work] Failed to load portfolio detail:', error);
				if (!fromList) {
					setSelectedDetail(null);
					setDetailError('Project not found');
				}
			} finally {
				setIsLoadingDetail(false);
			}
		};

		loadDetail();
	}, [projectId, portfolioById]);

	useEffect(() => {
		if (!projectId) return;

		const index = portfolioItems.findIndex((entry) => entry.id === projectId);
		if (index >= 0 && index >= visibleCount) {
			setVisibleCount(index + 1);
		}
	}, [projectId, portfolioItems, visibleCount]);

	useEffect(() => {
		setTimeout(() => {
			window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
		}, 200);
	}, []);

	useEffect(() => {
		const updateColumns = () => setColumnCount(getColumnCount());
		updateColumns();
		window.addEventListener('resize', updateColumns);
		return () => window.removeEventListener('resize', updateColumns);
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && visibleCount < portfolioItems.length) {
					setVisibleCount((prev) =>
						Math.min(prev + LOAD_MORE_COUNT, portfolioItems.length),
					);
				}
			},
			{ threshold: 0.25 },
		);

		const target = observerTarget.current;
		if (target) observer.observe(target);

		return () => {
			if (target) observer.unobserve(target);
		};
	}, [visibleCount, portfolioItems.length]);

	return (
		<>
			<div className='relative'>
				<section className='py-4 pt-32 pb-10 mt-8 px-2 md:px-14 lg:px-0'>
					<section>
						{isLoadingPortfolios ? (
							<div className='py-16 flex items-center justify-center'>
								<PuffLoader color='#C4FE01' />
							</div>
						) : portfolioItems.length === 0 ? (
							<p className='text-center text-muted-foreground py-16 text-sm'>
								No portfolio projects available yet.
							</p>
						) : (
						<div className='gallery grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 grid-flow-row-dense grid-rows-1 gap-4'>
							{columns.map((column, columnIndex) => (
								<div key={`column-${columnIndex}`} className='gallery__items'>
									{column.map((item) => (
										<figure
											key={item.id}
											className='gallery__item gallery__item--14 cursor-pointer overflow-hidden rounded-md'
											onClick={() => openPortfolio(item)}
										>
											<img
												src={item.hero}
												alt={item.title}
												className='gallery__img transition-transform duration-300 hover:scale-105'
											/>
										</figure>
									))}
								</div>
							))}
						</div>
						)}
					</section>
					<div ref={observerTarget} className='h-8' />
				</section>
			</div>

			<Dialog
				open={Boolean(projectId)}
				onOpenChange={(open) => {
					if (!open) closePortfolio();
				}}
			>
				<DialogContent className='flex max-h-[92vh] w-[95vw] max-w-6xl flex-col overflow-hidden border-0 bg-[#111] p-0 text-white gap-0 shadow-none'>
					{isLoadingDetail && !selectedDetail ? (
						<div className='py-24 flex items-center justify-center'>
							<PuffLoader color='#C4FE01' />
						</div>
					) : detailError && !selectedDetail ? (
						<div className='py-16 px-8 text-center text-white/70 text-sm'>
							{detailError}
						</div>
					) : selectedDetail ? (
						<>
							<div className='hide-scrollbar flex-1 overflow-y-auto'>
								<div className='relative w-full aspect-[16/9] max-h-[420px] overflow-hidden'>
									<img
										src={selectedDetail.hero}
										alt={selectedDetail.title}
										className='h-full w-full object-cover'
									/>
									<div className='absolute inset-0 bg-gradient-to-t from-[#111] via-black/40 to-transparent' />

									<div className='absolute bottom-5 right-5 z-10'>
										<TooltipProvider delayDuration={200}>
											<DropdownMenu>
												<Tooltip>
													<TooltipTrigger asChild>
														<DropdownMenuTrigger asChild>
															<button
																type='button'
																aria-label='Share options'
																className='inline-flex h-11 w-11 items-center justify-center bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70'
															>
																<Share2 className='h-5 w-5' />
															</button>
														</DropdownMenuTrigger>
													</TooltipTrigger>
													<TooltipContent
														side='left'
														className='z-[120] rounded-none border-0 bg-black/90 px-3 py-1.5 text-xs text-white'
													>
														Share
													</TooltipContent>
												</Tooltip>
												<DropdownMenuContent
													align='end'
													side='top'
													sideOffset={8}
													className='z-[120] min-w-[190px] rounded-none border-0 bg-black/90 p-1 text-white shadow-lg'
												>
													<DropdownMenuItem
														className='cursor-pointer rounded-none text-sm text-white focus:bg-white/10 focus:text-white'
														onClick={() => handleShare(selectedDetail)}
													>
														<Share2 className='mr-2 h-4 w-4' />
														Share
													</DropdownMenuItem>
													<DropdownMenuItem
														className='cursor-pointer rounded-none text-sm text-white focus:bg-white/10 focus:text-white'
														onClick={() => handleEmbed(selectedDetail)}
													>
														<Code2 className='mr-2 h-4 w-4' />
														Embed this project
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TooltipProvider>
									</div>
								</div>

								<div className='space-y-6 p-8'>
									<DialogHeader className='space-y-3 text-left'>
										<p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C4FE01]'>
											{selectedDetail.category}
										</p>
										<DialogTitle className='text-2xl font-bold tracking-tight md:text-3xl'>
											{selectedDetail.title}
										</DialogTitle>
										<div className='flex flex-wrap gap-4 text-sm text-white/60'>
											<span>
												<span className='text-white/40'>Client:</span>{' '}
												{selectedDetail.client}
											</span>
											<span>
												<span className='text-white/40'>Year:</span>{' '}
												{selectedDetail.year}
											</span>
										</div>
										<DialogDescription className='max-w-3xl text-base leading-relaxed text-white/75'>
											{selectedDetail.summary}
										</DialogDescription>
										<div className='flex flex-wrap gap-2 pt-1'>
											{selectedDetail.services.map((service) => (
												<span
													key={service}
													className='bg-white/5 px-3 py-1 text-xs text-white/80'
												>
													{service}
												</span>
											))}
										</div>
									</DialogHeader>

									<div className='grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2'>
										{selectedDetail.images.map((image, index) => (
											<div
												key={`${selectedDetail.id}-${index}`}
												className='aspect-[4/3] overflow-hidden'
											>
												<img
													src={image}
													alt={`${selectedDetail.title} ${index + 1}`}
													className='h-full w-full object-cover'
												/>
											</div>
										))}
									</div>
								</div>
							</div>
						</>
					) : null}
				</DialogContent>
			</Dialog>
		</>
	);
}
