import React, { useEffect, useState }  from 'react'
import { Link } from 'react-router-dom'
import { ImageRecord } from '../types'
import axios from 'axios'

const baseUrl = process.env.REACT_APP_BASE_URL

function Gallery() {
  const [records, setRecords] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${baseUrl}/records`)
    .then(res => setRecords(res.data))
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading gallery...</div>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {records.map(record => (
          <Link to={`/records/${record.id}`} key={record.id}>
            <div className="border rounded shadow hover:shadow-lg transition">
              <img
                src={`${baseUrl}/static/uploads/${record.filename}`}
                alt={`Image ${record.id}`}
                className="w-full h-48 object-cover rounded-t"
              />
              <div className="p-2">
                <p className="font-semibold">{record.prediction}</p>
                <p className="text-sm text-gray-600">Confidence: {Math.round(record.confidence * 100)}%</p>
                <p className="text-sm">{record.location_name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Gallery