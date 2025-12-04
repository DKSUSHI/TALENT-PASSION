import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { DomainType, DOMAIN_COLORS } from '../types';

interface ResultChartProps {
  distribution: { [key in DomainType]: number };
}

export const ResultChart: React.FC<ResultChartProps> = ({ distribution }) => {
  const data = Object.entries(distribution).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  return (
    <div className="w-full h-80 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={DOMAIN_COLORS[entry.name as DomainType]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}%`, '佔比']}
            contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend 
             verticalAlign="bottom" 
             height={36}
             iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};