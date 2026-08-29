
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../../../components/dashboard/layout/MainLayout';

const CMSEditor: React.FC = () => {
  const params = useParams();
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">CMS Editor</h1>
        <p className="text-muted-foreground">
          Edit and manage website content
        </p>
      </div>
    </MainLayout>
  );
};

export default CMSEditor;
