import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trash } from "lucide-react";
import axios from "axios";

interface ImageRecord {
  id: number;
  filename: string;
  location_name: string;
  latitude: number;
  longitude: number;
  prediction: string;
  confidence: number;
  upload_time: string;
  is_illegal_mining: boolean;
}

const baseUrl = process.env.REACT_APP_BASE_URL;

function Records() {
  const [records, setRecords] = useState<ImageRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${baseUrl}/records`)
      .then((res) => setRecords(res.data))
      .catch((err) => console.error("Error fetching records:", err));
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.prediction.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterType === "All" ||
        (filterType === "Illegal" && record.is_illegal_mining) ||
        (filterType === "Legal" && !record.is_illegal_mining);

      return matchesSearch && matchesFilter;
    });
  }, [records, searchTerm, filterType]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axios.delete(`${baseUrl}/records/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));

      //triggering a global event 
      window.dispatchEvent(new Event("records-updated"));
    } catch (err) {
      console.error("Failed to delete record:", err);
      alert("Delete failed.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">All Records</h2>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by location or prediction"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-72"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-48"
        >
          <option value="All">All</option>
          <option value="Illegal">Illegal Mining</option>
          <option value="Legal">Legal Mining</option>
        </select>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full table-auto border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Prediction</th>
              <th className="px-4 py-2">Confidence</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr
                key={record.id}
                className="border-t hover:bg-gray-100 cursor-pointer"
                onClick={() => navigate(`/records/${record.id}`)}
              >
                <td className="px-4 py-2">{record.id}</td>
                <td className="px-4 py-2">{record.prediction}</td>
                <td className="px-4 py-2">
                  {(record.confidence * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-2">{record.location_name}</td>
                <td className="px-4 py-2">
                  {new Date(record.upload_time).toLocaleString()}
                </td>
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(record.id);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center px-4 py-4 text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Records;
