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

  // MyComplaints किंवा UserDashboard कडून आलेला डेटा इथे रिसीव्ह होतो
  const { chartData } = location.state || { chartData: [] };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-[#F8FAFC] min-h-screen font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 w-fit px-6 py-3 rounded-2xl transition-all border border-transparent hover:border-blue-100 shadow-sm bg-white"
      >
        ← Back to Portal
      </button>

      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">
          Grievance Insights
        </h2>
        <p className="text-slate-500 font-medium mt-2">
          Comprehensive statistical overview of all your reported issues
        </p>
      </div>

      {/* Main Analytics Card */}
      <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50/50 rounded-full -ml-16 -mb-16 blur-2xl"></div>

        {/* Bar Chart Container */}
        <div
          className="w-full relative z-10"
          style={{ height: "400px", minHeight: "400px" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 40, right: 30, left: 0, bottom: 10 }}
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
                tick={{ fill: "#64748B", fontSize: 10, fontWeight: "900" }}
                dy={15}
              />
              <YAxis hide domain={[0, "dataMax + 2"]} />

              <Tooltip
                cursor={{ fill: "#F8FAFC" }}
                contentStyle={{
                  borderRadius: "24px",
                  border: "none",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
                  padding: "15px 20px",
                  fontWeight: "bold",
                }}
              />

              <Bar
                dataKey="value"
                radius={[12, 12, 12, 12]}
                barSize={50}
                animationBegin={200}
                animationDuration={1200}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
                {/* आकडे बारच्या वर दाखवण्यासाठी */}
                <LabelList
                  dataKey="value"
                  position="top"
                  fill="#1E293B"
                  fontSize={16}
                  fontWeight="900"
                  offset={15}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Info Cards (Summary) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-16 border-t border-slate-50 pt-10">
          {chartData.length > 0 ? (
            chartData.map((item) => (
              <div
                key={item.name}
                className="text-center p-5 rounded-[2rem] bg-slate-50/50 border border-white hover:border-slate-100 transition-all hover:shadow-inner"
              >
                <div
                  className="w-2 h-2 rounded-full mx-auto mb-3"
                  style={{ backgroundColor: item.color }}
                ></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  {item.name}
                </p>
                <p className="text-3xl font-black text-slate-800 mt-1">
                  {item.value}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-slate-400 italic font-medium">
              No statistical data found. Please report issues to see analytics.
            </div>
          )}
        </div>
      </div>

      {/* Footer Branded Tag */}
      <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mt-12">
        SmartGrievance Analytics Engine
      </p>
    </div>
  );
};

export default Analytics;
