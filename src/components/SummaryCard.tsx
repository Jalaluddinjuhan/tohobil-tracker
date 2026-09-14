import React from 'react';

interface SummaryCardProps {
  year: number;
  totalEntries: number;
  totalContributors: number;
  totalFund: number;
}

export default function SummaryCard({ year, totalEntries, totalContributors, totalFund }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Summary for {year}</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="pt-4 md:pt-0">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Entries</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalEntries}</p>
        </div>
        <div className="pt-4 md:pt-0">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Contributors</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalContributors}</p>
        </div>
        <div className="pt-4 md:pt-0">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Fund</p>
          <p className="mt-2 text-3xl font-bold text-green-600">৳ {totalFund.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
