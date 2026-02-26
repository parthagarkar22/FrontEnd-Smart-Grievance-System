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

  // Receive data from Dashboard. If empty, provide a default structure.
  const { chartData } = location.state || { chartData: [] };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 bg-[#F8FAFC] min-h-screen font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 w-fit px-6 py-3 rounded-2xl transition-all border border-transparent hover:border-blue-100 shadow-sm bg-white active:scale-95"
      >
        ← Back to Portal
      </button>

      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">
          Grievance Insights
        </h2>
        <p className="text-slate-500 font-medium mt-2">
          Real-time statistical breakdown of your reported concerns
        </p>
      </div>

      {/* Main Analytics Card */}
      <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/40 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50/40 rounded-full -ml-24 -mb-24 blur-3xl"></div>

        {/* Bar Chart Container */}
        <div className="w-full relative z-10 h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 40, right: 30, left: 0, bottom: 20 }}
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
                tick={{ fill: "#64748B", fontSize: 11, fontWeight: "800" }}
                dy={15}
              />
              <YAxis
                hide
                domain={[0, (dataMax) => (dataMax < 5 ? 5 : dataMax + 2)]}
              />

              <Tooltip
                cursor={{ fill: "#F8FAFC", radius: 15 }}
                contentStyle={{
                  borderRadius: "20px",
                  border: "none",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  padding: "15px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  fontSize: "12px",
                }}
              />

              <Bar
                dataKey="value"
                radius={[15, 15, 15, 15]}
                barSize={60}
                animationDuration={1500}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  fill="#1E293B"
                  fontSize={18}
                  fontWeight="900"
                  offset={15}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-10 border-t border-slate-50">
          {chartData.length > 0 ? (
            chartData.map((item) => (
              <div
                key={item.name}
                className="group relative bg-slate-50/50 p-6 rounded-[2rem] border border-white hover:border-slate-200 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div
                  className="absolute top-4 right-4 w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {item.name}
                </p>
                <p className="text-4xl font-black text-slate-800 mt-2">
                  {item.value}
                </p>
                <div className="w-full h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{ backgroundColor: item.color, width: "100%" }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Analyzing data... Please wait or report an issue.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mt-16">
        SmartGrievance Analytics Engine v2.0
      </p>
    </div>
  );
};

export default Analytics;
