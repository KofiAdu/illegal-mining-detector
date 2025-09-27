import React from 'react'
import { ImageRecord } from "../types";

type RecordTableProps = {
  records: ImageRecord[];
  loading: boolean;
};

function RecordTable({ records, loading }: RecordTableProps) {
  if (loading) return <p>Loading...</p>;

  return (
     <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead>
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Prediction</th>
            <th className="p-3 text-left">Confidence</th>
            <th className="p-3 text-left">Location</th>
            <th className="p-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3">{r.id}</td>
              <td className="p-3">{r.prediction}</td>
              <td className="p-3">{(r.confidence * 100).toFixed(1)}%</td>
              <td className="p-3">{r.location_name}</td>
              <td className="p-3">{new Date(r.upload_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RecordTable