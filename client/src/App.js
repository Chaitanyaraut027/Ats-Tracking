import { Routes, Route } from 'react-router-dom';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

import { Home } from './Pages/Employer/Home';
import { Navbar } from './components/Navbar';
import { PostJob } from './Pages/Employer/PostJob';
import { AllJobs } from './Pages/Employer/AllJobs';
import { Login } from './components/Login/Login';
import { Register } from './components/Login/Register';
import { RecruiterDashboard } from './Pages/Recruiter/RecruiterDashboard';
import { CoordinatorDashboard } from './Pages/Coordinator/CoordinatorDashboard';
import { JobDetails } from './components/Home/JobDetails';
import { CandidateProfile } from './Pages/Recruiter/CandidateProfile';
import { CandidateManagement } from './Pages/Candidate/CandidateManagement';
import { ShortlistedCandidates } from './components/ShortlistedCandidates';
import { ShortlistedDetails } from './components/ShortlistedDetails';
import { ApplicationForm } from './Pages/Candidate/ApplicationForm';
import { AssignRecruiter } from './Pages/Coordinator/AssignRecruiter';
import { Footer } from './components/Footer';
import { AllPostedJobs } from './components/AllPostedJobs';
import { Dashboard } from './Pages/Dashboard';
import { UpdateJob } from './Pages/Employer/UpdateJob';
import { MyJobs } from './Pages/Candidate/MyJobs';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
    return (
        <div className="App min-h-screen flex flex-col justify-between bg-gray-50/50">
            <div className="flex-grow">
                <Routes>
                    <Route path="/" element={<Navbar />}>
                        {/* Public Routes */}
                        <Route index element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Register />} />
                        <Route path="/all-jobs" element={<AllJobs />} />
                        <Route path="/all-posted-jobs" element={<AllPostedJobs />} />
                        <Route path="/current-job/:id" element={<JobDetails />} />
                        <Route path="/application-form/:id" element={<ApplicationForm />} />

                        {/* Employer & Coordinator: Job Creation & Updates */}
                        <Route
                            path="/post-job"
                            element={
                                <ProtectedRoute allowedRoles={['employer', 'coordinator']}>
                                    <PostJob />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/update-job/:id"
                            element={
                                <ProtectedRoute allowedRoles={['employer', 'coordinator']}>
                                    <UpdateJob />
                                </ProtectedRoute>
                            }
                        />

                        {/* Internal Recruitment Staff: Employer, Coordinator, Recruiter */}
                        <Route
                            path="/dash"
                            element={
                                <ProtectedRoute allowedRoles={['employer', 'coordinator', 'recruiter']}>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/candidates"
                            element={
                                <ProtectedRoute allowedRoles={['employer', 'coordinator', 'recruiter']}>
                                    <CandidateManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/candidate/:id"
                            element={
                                <ProtectedRoute allowedRoles={['employer', 'coordinator', 'recruiter']}>
                                    <CandidateProfile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/shortlist"
                            element={
                                <ProtectedRoute allowedRoles={['recruiter', 'coordinator', 'employer']}>
                                    <ShortlistedCandidates />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/shortlist/details/:candidate_id/:job_id"
                            element={
                                <ProtectedRoute allowedRoles={['recruiter', 'coordinator', 'employer']}>
                                    <ShortlistedDetails />
                                </ProtectedRoute>
                            }
                        />

                        {/* Coordinator Specific */}
                        <Route
                            path="/coordinator/review"
                            element={
                                <ProtectedRoute allowedRoles={['coordinator', 'employer']}>
                                    <CoordinatorDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/assign-recruiter/:id"
                            element={
                                <ProtectedRoute allowedRoles={['coordinator', 'employer']}>
                                    <AssignRecruiter />
                                </ProtectedRoute>
                            }
                        />

                        {/* Recruiter Specific */}
                        <Route
                            path="/recruiter/review"
                            element={
                                <ProtectedRoute allowedRoles={['recruiter', 'coordinator', 'employer']}>
                                    <RecruiterDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Candidate Specific */}
                        <Route
                            path="/my-jobs"
                            element={
                                <ProtectedRoute allowedRoles={['candidate', 'employer', 'coordinator', 'recruiter']}>
                                    <MyJobs />
                                </ProtectedRoute>
                            }
                        />

                        {/* Fallback */}
                        <Route path="*" element={<Home />} />
                    </Route>
                </Routes>
            </div>
            <Footer />
        </div>
    );
}

export default App;
