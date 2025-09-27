import React, { useEffect, useState } from "react";
import { getAllRecords } from "../services/api";
import StatsCards from "../components/StatsCards";
import RecordTable from "../components/RecordTable";
import { ImageRecord } from "../types";

function Dashboard() {
  const [records, setRecords] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await getAllRecords();
        setRecords(data);
      } catch (error) {
        console.error("Failed to fetch records", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();

    //re-fetch when "records-updated" is dispatched
    const listener = () => fetchRecords();
    window.addEventListener("records-updated", listener);

    return () => window.removeEventListener("records-updated", listener);
  }, []);

  const total = records.length;
  const illegal = records.filter((r) => r.is_illegal_mining).length;
  const legal = total - illegal;
  const avgConfidence =
    total > 0
      ? (records.reduce((sum, r) => sum + r.confidence, 0) / total).toFixed(2)
      : "0";

  const recentRecords = records.slice(-5).reverse();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <StatsCards
        total={total}
        illegal={illegal}
        legal={legal}
        avgConfidence={avgConfidence}
      />

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Uploads</h2>
        <RecordTable records={recentRecords} loading={loading} />
      </div>
    </div>
  );
}

export default Dashboard;
