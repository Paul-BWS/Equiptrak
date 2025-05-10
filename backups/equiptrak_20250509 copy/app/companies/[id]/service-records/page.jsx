import React from 'react';
import CompanyServiceRecords from '@/app/components/CompanyServiceRecords';
import Link from 'next/link';

export default function ServiceRecordsPage({ params }) {
  const companyId = params.id;
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link 
          href={`/companies/${companyId}`}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md mr-4 hover:bg-gray-50"
        >
          ← Back to Company
        </Link>
        
        <h1 className="text-2xl font-bold">Company Service Records</h1>
      </div>
      
      <CompanyServiceRecords companyId={companyId} />
    </div>
  );
} 