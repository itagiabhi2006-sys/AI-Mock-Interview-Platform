
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'



import Login from './pages/Login'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'


import ForgetPassword from './pages/ForgetPassword'
import ResetPassword from './pages/ResetPassword'
import Reg from './pages/Reg'
import Profile from './pages/Profile'

import Logout from './pages/Logout'
import ChangePassword from './pages/ChangePassword'

import AuthSuccess from './pages/AuthSuccess';
import Dashboard from './pages/Dashboard'
import Interview from './pages/Interview'
import Feedback from './pages/Feedback'
import SelectRole from './pages/SelectRole'
import LiveSoftSkillTracker from './pages/LiveSoftSkillTracker'
import InterviewHistory from './pages/InterviewHistory'
import SessionDetailPage from './pages/SessionDetailPage'
import ModeSelect from './pages/ModeSelect.jsx'
import AllVideos from './pages/AllVideos.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminOverview from './pages/admin/AdminOverview.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminQuestions from './pages/admin/AdminQuestions.jsx'

export default function App(){
  const location = useLocation();
  const hideLayoutRoutes = ['/login', '/register', '/forget-password', '/reset-password'];
  const fullWidthRoutes = ['/select-role', '/profile-view', '/interviews', '/analysis', '/analysis2'];
  const isAuthPage = hideLayoutRoutes.includes(location.pathname) || location.pathname.startsWith('/admin');
  const isFullWidth = fullWidthRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col mandala">
      <ScrollToTop />
      {!isAuthPage && <Navbar />}
      <main className={`flex-1 ${!isAuthPage && !isFullWidth ? 'container mx-auto px-4 py-6' : 'flex flex-col'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
      
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={ <ProtectedRoute> <Logout /></ProtectedRoute>} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Reg />} />
          <Route path="/profile-view" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/change-password" element={ <ChangePassword />} />
          <Route path="/analysis" element={<ProtectedRoute> <Dashboard/></ProtectedRoute>} />
          <Route path="auth/success" element={<AuthSuccess />} /> 
          <Route path="*" element={<div className="p-10 text-center">Page Not Found</div>} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

           <Route path="/start-interview" element={<ProtectedRoute> <Interview /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/select-role" element={<ProtectedRoute> <SelectRole /></ProtectedRoute>} />
         <Route path="/live-track" element={<ProtectedRoute><LiveSoftSkillTracker /></ProtectedRoute>} />
         <Route path="/interviews" element={<ProtectedRoute><InterviewHistory /></ProtectedRoute>} />
         <Route path="/analysis2" element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>} />
         <Route path="/select-mode" element={<ProtectedRoute><ModeSelect /></ProtectedRoute>} />
         <Route path="videos-recorded" element={<ProtectedRoute><AllVideos /></ProtectedRoute>} />

         {/* Admin Routes */}
         <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
           <Route index element={<AdminOverview />} />
           <Route path="users" element={<AdminUsers />} />
           <Route path="questions" element={<AdminQuestions />} />
         </Route>
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}
