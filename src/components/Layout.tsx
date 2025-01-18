import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-gradient-to-br from-primary-light to-white">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        {/* 导航栏内容 */}
      </nav>
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        {children}
      </main>

      <footer className="mt-auto py-6 text-center text-gray-600">
        {/* 页脚内容 */}
      </footer>
    </div>
  );
}; 