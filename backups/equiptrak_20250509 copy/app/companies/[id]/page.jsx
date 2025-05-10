import React from 'react';
import Link from 'next/link';

export default function CompanyDetailsPage({ params }) {
  const companyId = params.id;
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Company Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          {/* Company information will be loaded here */}
          <p className="text-gray-500">Loading company information...</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <Link 
            href={`/companies/${companyId}/service-records`}
            className="px-4 py-2 bg-[#a6e15a] text-black rounded-md hover:bg-opacity-90 text-center"
          >
            View Service Records
          </Link>
          
          <Link 
            href={`/companies/${companyId}/contacts`}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-center"
          >
            View Contacts
          </Link>
          
          <Link 
            href={`/companies/${companyId}/equipment`}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-center"
          >
            View Equipment
          </Link>
        </div>
      </div>
      
      <Link 
        href="/companies"
        className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        ← Back to Companies
      </Link>
    </div>
  );
} 