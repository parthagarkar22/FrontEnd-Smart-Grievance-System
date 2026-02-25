import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const Analytics = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { chartData } = location.state || { chartData: [] };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-[#F8FAFC] min-h-screen font-sans">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 w-fit px-4 py-2 rounded-xl transition-all"
      >
        ← Back
      </button>

      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">
          Grievance Statistics
        </h2>
        <p className="text-slate-500 font-medium mt-2">
          Detailed breakdown of your reported issues
        </p>
      </div>

      <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 30, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 11, fontWeight: "900" }}
                dy={10}
              />
              <YAxis hide />{" "}
              {/* Y-Axis लपवून आपण बारवर डायरेक्ट आकडे दाखवूया */}
              <Tooltip
                cursor={{ fill: "#F8FAFC" }}
                contentStyle={{
                  borderRadius: "20px",
                  border: "none",
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                  padding: "15px",
                }}
              />
              <Bar dataKey="value" radius={[15, 15, 15, 15]} barSize={55}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                {/* बारच्या वर संख्या दाखवण्यासाठी */}
                <LabelList
                  dataKey="value"
                  position="top"
                  fill="#1E293B"
                  fontSize={14}
                  fontWeight="900"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 border-t border-slate-50 pt-8">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="text-center p-4 rounded-3xl bg-slate-50/50"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {item.name}
              </p>
              <p className="text-2xl font-black text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
