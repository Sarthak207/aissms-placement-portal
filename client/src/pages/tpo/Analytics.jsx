import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import Card from '../../components/ui/Card';
import { SkeletonCard } from '../../components/skeletons/Skeleton';
import { analyticsApi } from '../../services/analyticsApi';

const MONTH_LABELS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Analytics() {
  const [trends, setTrends] = useState([]);
  const [topRecruiters, setTopRecruiters] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.trends(), analyticsApi.topRecruiters(8), analyticsApi.funnel()])
      .then(([trendsRes, recruitersRes, funnelRes]) => {
        setTrends(trendsRes.data.data.map((t) => ({ ...t, label: `${MONTH_LABELS[t.month]} ${t.year}` })));
        setTopRecruiters(recruitersRes.data.data);
        setFunnel(funnelRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-navy mb-1">Analytics</h1>
        <p className="text-slate-light text-sm">Trends, top recruiters, and the application funnel.</p>
      </div>

      {funnel && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['Eligible', funnel.eligible],
            ['Applied', funnel.applied],
            ['Selected', funnel.selected],
            ['Rejected', funnel.rejected],
          ].map(([label, value]) => (
            <Card key={label} className="text-center">
              <p className="font-display text-2xl text-navy">{value}</p>
              <p className="text-xs text-slate-light mt-1">{label}</p>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h2 className="font-display text-lg text-navy mb-4">Monthly placement trend</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trends}>
            <CartesianGrid stroke="#EEF0F6" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#C9A227" strokeWidth={2.5} dot={{ r: 3 }} name="Offers issued" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h2 className="font-display text-lg text-navy mb-4">Top recruiters</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topRecruiters} layout="vertical" margin={{ left: 24 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="companyName" tick={{ fontSize: 11 }} width={120} />
            <Tooltip />
            <Bar dataKey="hires" fill="#16213E" radius={[0, 4, 4, 0]} name="Hires" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
