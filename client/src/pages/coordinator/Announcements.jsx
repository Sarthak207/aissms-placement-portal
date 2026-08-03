import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Megaphone } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/EmptyState';
import { SkeletonCard } from '../../components/skeletons/Skeleton';
import { announcementApi } from '../../services/announcementApi';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = () => {
    setLoading(true);
    announcementApi
      .list({ limit: 30 })
      .then(({ data }) => setAnnouncements(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (values) => {
    setPosting(true);
    try {
      await announcementApi.create(values);
      toast.success('Announcement posted to your department');
      reset();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post announcement');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-navy mb-1">Announcements</h1>
        <p className="text-slate-light text-sm">Post updates visible to students in your department.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" {...register('title', { required: 'Required' })} error={errors.title?.message} />
          <label className="block">
            <span className="block text-sm font-medium text-navy mb-1.5">Message</span>
            <textarea
              {...register('body', { required: 'Required' })}
              rows={3}
              className="w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm bg-parchment-100 focus:outline-none focus:ring-2 focus:ring-seal/40"
            />
            {errors.body && <span className="block text-xs text-rejected mt-1">{errors.body.message}</span>}
          </label>
          <Button type="submit" isLoading={posting}>
            Post announcement
          </Button>
        </form>
      </Card>

      {loading ? (
        <SkeletonCard />
      ) : announcements.length === 0 ? (
        <Card>
          <EmptyState icon={Megaphone} title="No announcements yet" description="Posts you make will appear here." />
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a._id}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-base text-navy">{a.title}</h3>
                <span className="text-xs text-slate-light font-mono">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate">{a.body}</p>
              <p className="text-xs text-slate-light mt-2">— {a.postedBy?.name}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
