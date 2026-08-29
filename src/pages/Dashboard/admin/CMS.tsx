
import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
// import { Button } from '../../../components/dashboard/ui/button';

const CMSDashboard: React.FC = () => {
  // const { section, subsection } = useParams();
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">CMS Dashboard</h1>
        <p className="text-muted-foreground">
          Manage website content, pages, and media
        </p>
      </div>
    </MainLayout>
  );
};

export default CMSDashboard;
