import Navbar from '../../components/navbar/navbar.component';
import { Outlet } from 'react-router-dom';
import Footer from '../../components/footer/footer.component';

export default function MainLayout() {
	return (
		<>
			<Navbar />
			<Outlet />
			<Footer />
		</>
	);
}
