import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { reportApi } from '../../services/reportApi';
import { adminApi } from '../../services/adminApi';

export default function Reports() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    adminApi
      .listBranches()
      .then(({ data }) => setBranches(data.data))
      .catch(() => {});
  }, []);

  const handleDownload = async (key, fn) => {
    setDownloading(key);
    try {
      await fn();
      toast.success('Report downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate report');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl text-navy mb-1">Reports</h1>
        <p className="text-slate-light text-sm">Generate placement statistics as PDF or Excel.</p>
      </div>

      <Card>
        <h2 className="font-display text-lg text-navy mb-2">College-wide placement report</h2>
        <p className="text-sm text-slate-light mb-4">All placed students across every branch, with CTC and offer dates.</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            isLoading={downloading === 'placement-pdf'}
            onClick={() => handleDownload('placement-pdf', () => reportApi.downloadPlacementReport('pdf'))}
          >
            <FileDown className="w-4 h-4" /> PDF
          </Button>
          <Button
            variant="outline"
            isLoading={downloading === 'placement-excel'}
            onClick={() => handleDownload('placement-excel', () => reportApi.downloadPlacementReport('excel'))}
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg text-navy mb-2">Branch report</h2>
        <p className="text-sm text-slate-light mb-4">Every student in a branch with CGPA, verification, and placement status.</p>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm bg-parchment-100 mb-4"
        >
          <option value="">Select a branch…</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name} ({b.departmentId?.name})
            </option>
          ))}
        </select>
        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={!selectedBranch}
            isLoading={downloading === 'branch-pdf'}
            onClick={() => handleDownload('branch-pdf', () => reportApi.downloadBranchReport(selectedBranch, 'pdf'))}
          >
            <FileDown className="w-4 h-4" /> PDF
          </Button>
          <Button
            variant="outline"
            disabled={!selectedBranch}
            isLoading={downloading === 'branch-excel'}
            onClick={() => handleDownload('branch-excel', () => reportApi.downloadBranchReport(selectedBranch, 'excel'))}
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </Button>
        </div>
      </Card>
    </div>
  );
}
