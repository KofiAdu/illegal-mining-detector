import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import MapView from '../components/MapView';

interface Record {
  id: number;
  filename: string;
  prediction: string;
  confidence: number;
  location_name: string;
  latitude: number;
  longitude: number;
  uploaded_at: string;
  is_illegal_mining: boolean;
}

const baseUrl = process.env.REACT_APP_BASE_URL


function RecordDetail() {
  const { id } = useParams<{ id: string }>()
  const [record, setRecord] = useState<Record | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await fetch(`${baseUrl}/records/${id}`);
        if (!res.ok) throw new Error("Failed to fetch record.");
        const data = await res.json();
        setRecord(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!record) return <p className="p-4 text-red-600">Record not found.</p>;

  return (
    <div className="p-6 space-y-6">
    <h2 className="text-3xl font-semibold mb-4">Record Details</h2>

    <div className="w-full h-[450px] rounded-lg overflow-hidden shadow">
      <MapView
        latitude={record.latitude}
        longitude={record.longitude}
        markerLabel={record.location_name}
        height="100%"
      />
    </div>

    <div className="bg-white p-6 rounded-lg shadow space-y-3">
      <h3 className="text-xl font-medium mb-4">Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
        <div><span className="font-semibold">Filename:</span> {record.filename}</div>
        <div><span className="font-semibold">Prediction:</span> {record.prediction}</div>
        <div><span className="font-semibold">Confidence:</span> {(record.confidence * 100).toFixed(2)}%</div>
        <div><span className="font-semibold">Uploaded:</span> {new Date(record.uploaded_at).toLocaleString()}</div>
        <div><span className="font-semibold">Location:</span> {record.location_name}</div>
        <div><span className="font-semibold">Type:</span> {record.is_illegal_mining ? "Illegal" : "Legal/Not a mining area"}</div>
        <div><span className="font-semibold">Latitude:</span> {record.latitude}</div>
        <div><span className="font-semibold">Longitude:</span> {record.longitude}</div>
      </div>
    </div>
  </div>
  )
}

export default RecordDetail