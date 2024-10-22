import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Don't render the layout while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Determine if the current route should have a sidebar
  const shouldShowSidebar = isAuthenticated && location.pathname !== '/';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex min-h-screen pt-16"> {/* pt-16 accounts for fixed header height */}
        {shouldShowSidebar && (
          <aside className="hidden md:block">
            <Sidebar />
          </aside>
        )}
        
        <main className={`flex-1 ${shouldShowSidebar ? 'md:ml-64' : ''}`}>
          {/* Main content area */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {/* Error Boundary could be added here */}
            <div className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.32))]">
              {children}
            </div>
          </div>
          
          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
