import React, { useEffect, useState} from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import axios from 'axios'

const baseUrl = process.env.REACT_APP_BASE_URL

interface ImageRecord {
  prediction: string;
  is_illegal_mining: boolean;
}

const COLORS = ["#0088FE", "#FF8042"];


function Analytics() {
  const [records, setRecords] = useState<ImageRecord[]>([]);
  const [classData, setClassData] = useState<any[]>([]);
  const [miningTypeData, setMiningTypeData] = useState<any[]>([]);


  useEffect(() => {
    axios.get(`${baseUrl}/records`)
      .then((res) => {
        const data = res.data;
        setRecords(data);

        //bar chart data
        const classCounts: Record<string, number> = {};
        data.forEach((r: ImageRecord) => {
          classCounts[r.prediction] = (classCounts[r.prediction] || 0) + 1;
        });
        setClassData(Object.entries(classCounts).map(([label, value]) => ({ label, value })));

        //pie chart data
        const illegal = data.filter((r: ImageRecord) => r.is_illegal_mining).length;
        const legal = data.length - illegal;
        setMiningTypeData([
          { name: "Illegal Mining", value: illegal },
          { name: "Legal/Not a Mining Area ", value: legal },
        ]);
      })
      .catch((err) => console.error("Error fetching records:", err));
  }, []);
  
  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold">Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Predictions by Class</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classData}>
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Mining Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={miningTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                dataKey="value"
              >
                {miningTypeData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Analytics