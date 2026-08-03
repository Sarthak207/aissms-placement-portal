import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, Award, Building2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import { SkeletonCard } from '../../components/skeletons/Skeleton';
import { analyticsApi } from '../../services/analyticsApi';

const PIE_COLORS = ['#C9A227', '#16213E'];

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-navy-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-navy-400" strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-display text-2xl text-navy leading-none">{value}</p>
        <p className="text-xs text-slate-light mt-1">{label}</p>
      </div>
    </Card>
  );
}

export default function TPODashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .overview()
      .then(({ data }) => setOverview(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const pieData = [
    { name: 'Placed', value: overview.placedStudents },
    { name: 'Unplaced', value: overview.unplacedStudents },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-navy mb-1">Placement overview</h1>
        <p className="text-slate-light text-sm">College-wide placement performance at a glance.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total students" value={overview.totalStudents} />
        <StatCard icon={TrendingUp} label="Placement %" value={`${overview.placementPercentage}%`} />
        <StatCard icon={Award} label="Highest package" value={`${overview.highestPackage} LPA`} />
        <StatCard icon={Building2} label="Companies visited" value={overview.companiesVisited} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display text-lg text-navy mb-4">Placed vs unplaced</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {pieData.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 text-xs text-slate-light mt-2">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-seal" /> Placed ({overview.placedStudents})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-navy" /> Unplaced ({overview.unplacedStudents})</span>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-navy mb-4">Branch-wise placements</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={overview.branchWise}>
              <XAxis dataKey="branchName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#EEF0F6" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="placed" fill="#C9A227" radius={[4, 4, 0, 0]} name="Placed" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-light">Average package across all offers</p>
            <p className="font-display text-3xl text-navy">{overview.averagePackage} LPA</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
