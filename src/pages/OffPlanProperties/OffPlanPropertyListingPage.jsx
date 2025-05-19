import React from 'react';
import PropertyListing from '../../components/OffPlan/PropertyListing';
import { useLoaderData } from 'react-router-dom';

function OffPlanListingPage() {
  const offPlanProjects = useLoaderData();
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 pb-8 max-w-7xl">
        <PropertyListing offPlanProjects={offPlanProjects} />
      </main>
    </div>
  );
}

export default OffPlanListingPage;