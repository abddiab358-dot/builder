import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { InitialSetupPage } from './pages/InitialSetupPage'
import { DebugPage } from './pages/DebugPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectsListPage } from './pages/ProjectsListPage'
import { ProjectNewPage } from './pages/ProjectNewPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { ProjectEditPage } from './pages/ProjectEditPage'
import { ProjectFinancePage } from './pages/ProjectFinancePage'
import { ProjectFilesPage } from './pages/ProjectFilesPage'
import { ProjectTasksPage } from './pages/ProjectTasksPage'
import { ProjectWorkersPage } from './pages/ProjectWorkersPage'
import { ProjectReportsPage } from './pages/ProjectReportsPage'
import { ProjectTimelinePage } from './pages/ProjectTimelinePage'
import { ProjectLocationPage } from './pages/ProjectLocationPage'
import { ProjectSmartFundPage } from './pages/ProjectSmartFundPage'
import { ProjectWorksPage } from './pages/ProjectWorksPage'
import { ClientsPage } from './pages/ClientsPage'
import { SettingsPage } from './pages/SettingsPage'
import { MainLayout } from './components/layout/MainLayout'
import { RequireSetup } from './components/routing/RequireSetup'
import { RequireAuth } from './components/routing/RequireAuth'
import { ThemeManager } from './components/layout/ThemeManager'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <ThemeManager />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/initial-setup" element={<InitialSetupPage />} />
          <Route path="/debug" element={<DebugPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <RequireSetup>
                  <MainLayout />
                </RequireSetup>
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsListPage />} />
            <Route path="projects/new" element={<ProjectNewPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="projects/:id/edit" element={<ProjectEditPage />} />
            <Route path="projects/:id/finance" element={<ProjectFinancePage />} />
            <Route path="projects/:id/reports" element={<ProjectReportsPage />} />
            <Route path="projects/:id/files" element={<ProjectFilesPage />} />
            <Route path="projects/:id/tasks" element={<ProjectTasksPage />} />
            <Route path="projects/:id/workers" element={<ProjectWorkersPage />} />
            <Route path="projects/:id/timeline" element={<ProjectTimelinePage />} />
            <Route path="projects/:id/location" element={<ProjectLocationPage />} />
            <Route path="projects/:id/fund" element={<ProjectSmartFundPage />} />
            <Route path="projects/:id/works" element={<ProjectWorksPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
