import React from 'react'

type StatsCardsProps = {
  total: number;
  illegal: number;
  legal: number;
  avgConfidence: string;
};

function StatsCards({ total, illegal, legal, avgConfidence }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white shadow p-4 rounded-lg">
        <h3 className="text-sm text-gray-500">Total Records</h3>
        <p className="text-xl font-bold">{total}</p>
      </div>
      <div className="bg-white shadow p-4 rounded-lg">
        <h3 className="text-sm text-gray-500">Illegal Mining</h3>
        <p className="text-xl font-bold text-red-500">{illegal}</p>
      </div>
      <div className="bg-white shadow p-4 rounded-lg">
        <h3 className="text-sm text-gray-500">Legal</h3>
        <p className="text-xl font-bold text-green-600">{legal}</p>
      </div>
      <div className="bg-white shadow p-4 rounded-lg">
        <h3 className="text-sm text-gray-500">Avg. Confidence</h3>
        <p className="text-xl font-bold">{avgConfidence}</p>
      </div>
    </div>
  )
}

export default StatsCards