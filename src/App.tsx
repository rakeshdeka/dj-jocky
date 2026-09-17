import { lazy, Suspense } from 'react';
import './App.css';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.tsx'

import { PuffLoader } from 'react-spinners';
const Terms = lazy(() => import('./pages/terms/terms.tsx'));
const PrivacyPolicy = lazy(
  () => import('./pages/privacyPolicy/privacyPolicy.tsx')
);

const NotFound = lazy(
  () => import('./pages/notFound/notFound.router.tsx')
);
const ProductPage = lazy(
  () => import('./pages/product/product.router.tsx')
);

const Store = lazy(
  () => import('./pages/store/store.router.tsx')
);
const Home = lazy(
  () => import('./pages/home/home.router.tsx')
);
const Cart = lazy(
  () => import('./pages/cart/cart.router.tsx')
);
const MainLayout = lazy(
  () => import('./pages/layout/layout.router.tsx')
);
const Work = lazy(
  () => import('./pages/work/work.router.tsx')
);
const Login = lazy(() => import('./pages/Dashboard/Login.tsx'))

const Index = lazy(() => import('./pages/Dashboard/user/Index'))
const Progress = lazy(() => import('./pages/Dashboard/Progress'))
const ProgressDetail = lazy(() => import('./pages/Dashboard/ProgressDetail'))
const BriefDetail = lazy(() => import('./pages/Dashboard/BriefDetail'))
const NotificationHistory = lazy(() => import('./pages/Dashboard/NotificationHistory'))
const CreateBrief = lazy(() => import('./pages/Dashboard/user/CreateBrief'))
const Services = lazy(() => import('./pages/Dashboard/user/Services'))
const ClientServiceDetail = lazy(() => import('./pages/Dashboard/user/ClientServiceDetail'))
const AssignJobs = lazy(() => import('./pages/Dashboard/user/AssignJobs'))
const Profile = lazy(() => import('./pages/Dashboard/user/Profile'))
const ClientSettingsLayout = lazy(() => import('./pages/Dashboard/user/settings/ClientSettingsLayout'))
const ClientProfileSettingsPage = lazy(() => import('./pages/Dashboard/user/settings/ClientProfileSettingsPage'))
const ClientEmailSettingsPage = lazy(() => import('./pages/Dashboard/user/settings/ClientEmailSettingsPage'))
const ClientPaymentSettingsPage = lazy(() => import('./pages/Dashboard/user/settings/ClientPaymentSettingsPage'))
const ClientSubscriptionSettingsPage = lazy(() => import('./pages/Dashboard/user/settings/ClientSubscriptionSettingsPage'))
const ClientSecuritySettingsPage = lazy(() => import('./pages/Dashboard/user/settings/ClientSecuritySettingsPage'))
const StoreClient = lazy(() => import('./pages/Dashboard/user/Store'))
const CartClient = lazy(() => import('./pages/Dashboard/user/Cart'))
const Meetings = lazy(() => import('./pages/Dashboard/user/Meetings'))
const ClientMeetingBooking = lazy(() => import('./pages/Dashboard/user/ClientMeetingBooking'))
const Plans = lazy(() => import('./pages/Dashboard/user/Plans'))
const Team = lazy(() => import('./pages/Dashboard/user/Team'))
const TeamJoin = lazy(() => import('./pages/Dashboard/user/TeamJoin'))
const Invoices = lazy(() => import('./pages/Dashboard/user/Invoices'))
const PauseSubscription = lazy(() => import('./pages/Dashboard/user/PauseSubscription'))

// Designer Pages
const DesignerDashboard = lazy(() => import('./pages/Dashboard/designer/Dashboard'))
const DesignerBriefs = lazy(() => import('./pages/Dashboard/designer/Briefs'))
const OpenedBriefs = lazy(() => import('./pages/Dashboard/designer/Opened'))
const ClosedBriefs = lazy(() => import('./pages/Dashboard/designer/Closed'))
const PriorityBriefs = lazy(() => import('./pages/Dashboard/designer/Priority'))
const DesignerProfile = lazy(() => import('./pages/Dashboard/designer/Profile'))
// const DesignerSettings = lazy(() => import('./pages/Dashboard/designer/Settings'))
// const DesignerMessage = lazy(() => import('./pages/Dashboard/designer/Messages'))
const DesignerResources = lazy(() => import('./pages/Dashboard/designer/Resources'))
const DesignerBriefChat = lazy(() => import('./pages/Dashboard/designer/DesignerBriefChat'))
const DesignerMeetings = lazy(() => import('./pages/Dashboard/designer/DesignerMeetings.tsx'))
// const DesignerProjectView = lazy(() => import('./components/dashboard/designer/DesignerProjectView'))

// Admin Pages
const AdminLogin = lazy(() => import('./pages/Dashboard/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/Dashboard/admin/Dashboard'))
const AdminUsers = lazy(() => import('./pages/Dashboard/admin/Users'))
const AdminProjects = lazy(() => import('./pages/Dashboard/admin/Projects'))
const AdminProjectDetail = lazy(() => import('./pages/Dashboard/admin/AdminProjectDetail'))
const AdminAssignDesigner = lazy(() => import('./pages/Dashboard/admin/AdminAssignDesigner'))
const AdminSubscriptions = lazy(() => import('./pages/Dashboard/admin/Subscriptions'))
// const AdminAnalytics = lazy(() => import('./pages/Dashboard/admin/Analytics'))
// const AdminMessages = lazy(() => import('./pages/Dashboard/admin/Messages'))
// const AdminReports = lazy(() => import('./pages/Dashboard/admin/Reports'))
// const AdminSupport = lazy(() => import('./pages/Dashboard/admin/Support'))
// const AdminSecurity = lazy(() => import('./pages/Dashboard/admin/Security'))
const AdminSettingsLayout = lazy(() => import('./pages/Dashboard/admin/settings/AdminSettingsLayout'))
const AdminCategoriesPage = lazy(() => import('./pages/Dashboard/admin/settings/AdminCategoriesPage'))
const AdminCategoryFormPage = lazy(() => import('./pages/Dashboard/admin/settings/AdminCategoryFormPage'))
const AdminServicesPage = lazy(() => import('./pages/Dashboard/admin/settings/AdminServicesPage'))
const AdminServiceFormPage = lazy(() => import('./pages/Dashboard/admin/settings/AdminServiceFormPage'))
const AdminPlansPage = lazy(() => import('./pages/Dashboard/admin/settings/AdminPlansPage'))
const AdminPlanFormPage = lazy(() => import('./pages/Dashboard/admin/settings/AdminPlanFormPage'))
const AdminCountriesPage = lazy(() => import('./pages/Dashboard/admin/settings/AdminCountriesPage'))
const AdminCountryFormPage = lazy(() => import('./pages/Dashboard/admin/settings/AdminCountryFormPage'))
const AdminCurrenciesPage = lazy(() => import('./pages/Dashboard/admin/settings/AdminCurrenciesPage'))
const AdminCurrencyFormPage = lazy(() => import('./pages/Dashboard/admin/settings/AdminCurrencyFormPage'))
const AdminProjectsMessage = lazy(() => import('./pages/Dashboard/admin/AdminProjectsMessage'))
const AdminProjectChat = lazy(() => import('./pages/Dashboard/admin/AdminProjectChat'))
const CMSDashboard = lazy(() => import('./pages/Dashboard/admin/CMS'))
const CMSEditor = lazy(() => import('./pages/Dashboard/admin/CMSEditor'))
const AddUser = lazy(() => import('./components/dashboard/admin/AddUser.tsx'))
const AddProject = lazy(() => import('./components/dashboard/admin/AddProject.tsx'))
const AdminMeetings = lazy(() => import('./pages/Dashboard/admin/AdminMeetings.tsx'))
const AdminAssignMeetingDesigner = lazy(() => import('./pages/Dashboard/admin/AdminAssignMeetingDesigner'))
const AdminPortfolio = lazy(() => import('./pages/Dashboard/admin/AdminPortfolio'))
const AdminPortfolioFormPage = lazy(() => import('./pages/Dashboard/admin/AdminPortfolioFormPage'))
const AdminPayments = lazy(() => import('./pages/Dashboard/admin/AdminPayments.tsx'))
const AdminSubAdmins = lazy(() => import('./pages/Dashboard/admin/AdminSubAdmins.tsx'))
const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<Home />} />
      <Route path='/' element={<MainLayout />}>
        <Route path='/cart' element={<Cart />} />
        <Route path='store' element={<Store />} />
        <Route path='store/:id' element={<ProductPage />} />
        <Route
          path='privacy-policy'
          element={<PrivacyPolicy />}
        />
        <Route path='terms' element={<Terms />} />
        <Route path='work/:projectId?' element={<Work />} />
        <Route path='*' element={<NotFound />} />
      </Route>

      {/* <Route path='dashboard' element={<Dashboard />} />  */}
      <Route path='login' element={<Login />} />
      <Route path='/team/join' element={<TeamJoin />} />
      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLogin />} />


      {/* Client Routes */}
      <Route path="/client/briefs" element={<ProtectedRoute requiredRole="client"><Index /></ProtectedRoute>} />
      <Route path="/client/briefs/:briefId" element={<ProtectedRoute requiredRole="client"><BriefDetail /></ProtectedRoute>} />
      <Route path="/client/progress" element={<ProtectedRoute requiredRole="client"><Progress /></ProtectedRoute>} />
      <Route path="/client/progress/:briefId" element={<ProtectedRoute requiredRole="client"><ProgressDetail /></ProtectedRoute>} />
      <Route path="/client/create-brief" element={<ProtectedRoute requiredRole="client"><CreateBrief /></ProtectedRoute>} />
      <Route path="/client/edit-brief/:id" element={<ProtectedRoute requiredRole="client"><CreateBrief /></ProtectedRoute>} />
      <Route path="/client/assign-jobs" element={<ProtectedRoute requiredRole="client"><AssignJobs /></ProtectedRoute>} />
      <Route path="/client/profile" element={<ProtectedRoute requiredRole="client"><Profile /></ProtectedRoute>} />
      <Route path="/client/settings" element={<ProtectedRoute requiredRole="client"><ClientSettingsLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ClientProfileSettingsPage />} />
        <Route path="email" element={<ClientEmailSettingsPage />} />
        <Route path="payment" element={<ClientPaymentSettingsPage />} />
        <Route path="subscription" element={<ClientSubscriptionSettingsPage />} />
        <Route path="security" element={<ClientSecuritySettingsPage />} />
      </Route>
      <Route path="/client/invite" element={<Navigate to="/client/team" replace />} />
      <Route path="/client/store" element={<ProtectedRoute requiredRole="client"><StoreClient /></ProtectedRoute>} />
      <Route path="/client/cart" element={<ProtectedRoute requiredRole="client"><CartClient /></ProtectedRoute>} />
      {/* <Route path="/client/file-manager" element={<ProtectedRoute requiredRole="client"><FileManager /></ProtectedRoute>} /> */}
      <Route
        path="/client/meetings"
        element={
          <ProtectedRoute requiredRole="client">
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Meetings />} />
        <Route path="new" element={<ClientMeetingBooking />} />
      </Route>
      <Route path="/client/plans" element={<ProtectedRoute requiredRole="client"><Plans /></ProtectedRoute>} />
      <Route path="/client/services" element={<ProtectedRoute requiredRole="client"><Services /></ProtectedRoute>} />
      <Route path="/client/services/:slugOrId" element={<ProtectedRoute requiredRole="client"><ClientServiceDetail /></ProtectedRoute>} />
      <Route path="/client/team" element={<ProtectedRoute requiredRole="client"><Team /></ProtectedRoute>} />
      <Route path="/client/invoices" element={<ProtectedRoute requiredRole="client"><Invoices /></ProtectedRoute>} />
      <Route path="/client/subscription/pause" element={<ProtectedRoute requiredRole="client"><PauseSubscription /></ProtectedRoute>} />
      <Route path="/client/notifications" element={<ProtectedRoute requiredRole="client"><NotificationHistory /></ProtectedRoute>} />


      {/* Designer Routes */}
      <Route path="/designer/dashboard" element={<ProtectedRoute requiredRole="designer"><DesignerDashboard /></ProtectedRoute>} />
      <Route path="/designer/briefs" element={<ProtectedRoute requiredRole="designer"><DesignerBriefs /></ProtectedRoute>} />
      <Route path="/designer/briefs/:briefId" element={<ProtectedRoute requiredRole="designer"><BriefDetail /></ProtectedRoute>} />
      <Route path="/designer/briefs/:briefId/messages" element={<ProtectedRoute requiredRole="designer"><DesignerBriefChat /></ProtectedRoute>} />
      <Route path="/designer/opened" element={<ProtectedRoute requiredRole="designer"><OpenedBriefs /></ProtectedRoute>} />
      <Route path="/designer/closed" element={<ProtectedRoute requiredRole="designer"><ClosedBriefs /></ProtectedRoute>} />
      <Route path="/designer/priority" element={<ProtectedRoute requiredRole="designer"><PriorityBriefs /></ProtectedRoute>} />
      <Route path="/designer/profile" element={<ProtectedRoute requiredRole="designer"><DesignerProfile /></ProtectedRoute>} />
      {/* <Route path="/designer/settings" element={<ProtectedRoute requiredRole="designer"><DesignerSettings /></ProtectedRoute>} /> */}
      {/* <Route path="/designer/messages" element={<ProtectedRoute requiredRole="designer"><DesignerMessage /></ProtectedRoute>} /> */}
      <Route path="/designer/resources" element={<ProtectedRoute requiredRole="designer"><DesignerResources /></ProtectedRoute>} />
      <Route path="/designer/progress" element={<ProtectedRoute requiredRole="designer"><Progress /></ProtectedRoute>} />
      <Route path="/designer/progress/:briefId" element={<ProtectedRoute requiredRole="designer"><ProgressDetail /></ProtectedRoute>} />
      <Route path="/designer/meetings" element={<ProtectedRoute requiredRole="designer"><DesignerMeetings /></ProtectedRoute>} />
      <Route path="/designer/notifications" element={<ProtectedRoute requiredRole="designer"><NotificationHistory /></ProtectedRoute>} />
      {/* <Route path="/designer/brief/:id" element={<ProtectedRoute requiredRole="designer"><DesignerProjectView /></ProtectedRoute>} /> */}
      {/* <Route path="/designer/project" element={< />} /> */}
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute requiredRole="admin"><NotificationHistory /></ProtectedRoute>} />
      <Route path="/admin/sub-admins" element={<ProtectedRoute requiredRole="admin"><AdminSubAdmins /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/users/add" element={<ProtectedRoute requiredRole="admin"><AddUser /></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute requiredRole="admin"><AdminProjects /></ProtectedRoute>} />
      <Route path="/admin/projects/add" element={<ProtectedRoute requiredRole="admin"><AddProject /></ProtectedRoute>} />
      <Route path="/admin/projects/messages" element={<ProtectedRoute requiredRole="admin"><AdminProjectsMessage /></ProtectedRoute>} />
      <Route path="/admin/projects/:briefId/messages" element={<ProtectedRoute requiredRole="admin"><AdminProjectChat /></ProtectedRoute>} />
      <Route path="/admin/projects/:briefId/assign-designer" element={<ProtectedRoute requiredRole="admin"><AdminAssignDesigner /></ProtectedRoute>} />
      <Route path="/admin/projects/:briefId" element={<ProtectedRoute requiredRole="admin"><AdminProjectDetail /></ProtectedRoute>} />
      <Route path="/admin/subscriptions" element={<ProtectedRoute requiredRole="admin"><AdminSubscriptions /></ProtectedRoute>} />
      <Route path="/admin/meetings" element={<ProtectedRoute requiredRole="admin"><AdminMeetings /></ProtectedRoute>} />
      <Route path="/admin/meetings/availability" element={<Navigate to="/admin/meetings" replace />} />
      <Route path="/admin/meetings/new" element={<Navigate to="/admin/meetings" replace />} />
      <Route path="/admin/meetings/:meetingId/assign-designer" element={<ProtectedRoute requiredRole="admin"><AdminAssignMeetingDesigner /></ProtectedRoute>} />
      <Route path="/admin/portfolio" element={<ProtectedRoute requiredRole="admin"><AdminPortfolio /></ProtectedRoute>} />
      <Route path="/admin/portfolio/new" element={<ProtectedRoute requiredRole="admin"><AdminPortfolioFormPage /></ProtectedRoute>} />
      <Route path="/admin/portfolio/:slugOrId/edit" element={<ProtectedRoute requiredRole="admin"><AdminPortfolioFormPage /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute requiredRole="admin"><AdminPayments /></ProtectedRoute>} />
      {/* <Route path="/admin/messages" element={<ProtectedRoute requiredRole="admin"><AdminMessages /></ProtectedRoute>} /> */}
      {/* <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} /> */}
      {/* <Route path="/admin/support" element={<ProtectedRoute requiredRole="admin"><AdminSupport /></ProtectedRoute>} /> */}
      {/* <Route path="/admin/security" element={<ProtectedRoute requiredRole="admin"><AdminSecurity /></ProtectedRoute>} /> */}
      <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettingsLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="categories" replace />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="categories/new" element={<AdminCategoryFormPage />} />
        <Route path="categories/:categoryId/edit" element={<AdminCategoryFormPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="services/new" element={<AdminServiceFormPage />} />
        <Route path="services/:serviceId/edit" element={<AdminServiceFormPage />} />
        <Route path="plans" element={<AdminPlansPage />} />
        <Route path="plans/new" element={<AdminPlanFormPage />} />
        <Route path="plans/:planId/edit" element={<AdminPlanFormPage />} />
        <Route path="countries" element={<AdminCountriesPage />} />
        <Route path="countries/new" element={<AdminCountryFormPage />} />
        <Route path="countries/:countryId/edit" element={<AdminCountryFormPage />} />
        <Route path="currencies" element={<AdminCurrenciesPage />} />
        <Route path="currencies/new" element={<AdminCurrencyFormPage />} />
        <Route path="currencies/:currencyId/edit" element={<AdminCurrencyFormPage />} />
      </Route>
      <Route path="/admin/cms" element={<ProtectedRoute requiredRole="admin"><CMSDashboard /></ProtectedRoute>} />
      <Route path="/admin/cms/:section/:subsection" element={<ProtectedRoute requiredRole="admin"><CMSEditor /></ProtectedRoute>} />




    </>
  )
);
function App() {
  return (
    <>
      <Suspense
        fallback={
          <div className='w-[100vw] h-[100vh] flex items-center  justify-center '>
            <PuffLoader color='#C4FE01' />
          </div>
        }>
        <RouterProvider router={routes} />
      </Suspense>
    </>
  );
}

export default App;