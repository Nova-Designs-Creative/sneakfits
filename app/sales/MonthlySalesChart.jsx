"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

const MonthlySalesChart = ({ chartData }) => {
  const [formattedData, setFormattedData] = useState([]);

  useEffect(() => {
    const processChartData = () => {
      const salesData = {};

      chartData.forEach((shoe) => {
        if (shoe.availability === "sold") {
          const soldDate = new Date(shoe.updatedAt);
          const month = `${soldDate.getFullYear()}-${String(
            soldDate.getMonth() + 1
          ).padStart(2, "0")}`;

          if (!salesData[month]) {
            salesData[month] = {
              month,
              revenue: 0,
              profit: 0,
              shoesSold: 0,
            };
          }

          salesData[month].revenue += shoe.priceSale || 0;

          if (shoe.commission && typeof shoe.commission.profit === "number") {
            salesData[month].profit += shoe.commission.profit;
          }

          salesData[month].shoesSold += 1;
        }
      });

      const sortedData = Object.values(salesData).sort(
        (a, b) => new Date(a.month) - new Date(b.month)
      );
      setFormattedData(sortedData);
    };

    processChartData();
  }, [chartData]);

  const totalRevenue = formattedData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const totalProfit = formattedData.reduce((sum, item) => sum + item.profit, 0);
  const totalShoesSold = formattedData.reduce(
    (sum, item) => sum + item.shoesSold,
    0
  );
  const averageRevenue =
    formattedData.length > 0
      ? Math.round(totalRevenue / formattedData.length)
      : 0;

  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <CardDescription>Monthly Overview</CardDescription>
        <CardTitle className="text-4xl tabular-nums">
          ₱{totalRevenue.toLocaleString()}{" "}
          <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
            total revenue
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 400 }}>
          {formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(month) =>
                    new Date(month).toLocaleString("default", {
                      month: "short",
                    })
                  }
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill="#3B82F6"
                  name="Revenue"
                />
                <Bar
                  yAxisId="left"
                  dataKey="profit"
                  fill="#82ca9d"
                  name="Profit"
                />
                <Bar
                  yAxisId="right"
                  dataKey="shoesSold"
                  fill="#ffc658"
                  name="Shoes Sold"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No sales data available.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <CardDescription>
          Total profit: ₱{totalProfit.toLocaleString()}
        </CardDescription>
        <CardDescription>
          Total shoes sold: {totalShoesSold.toLocaleString()}
        </CardDescription>
      </CardFooter>
    </Card>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className=" bg-slate-900 p-4 border rounded shadow">
        <p className="font-bold">{`Month: ${new Date(label).toLocaleString(
          "default",
          { month: "long", year: "numeric" }
        )}`}</p>
        <p>{`Revenue: ₱${payload[0].value.toLocaleString()}`}</p>
        <p>{`Profit: ₱${payload[1].value.toLocaleString()}`}</p>
        <p>{`Shoes Sold: ${payload[2].value}`}</p>
      </div>
    );
  }

  return null;
};

export default MonthlySalesChart;
