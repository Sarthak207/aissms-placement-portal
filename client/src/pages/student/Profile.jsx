import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SealBadge from '../../components/ui/SealBadge';
import { SkeletonCard } from '../../components/skeletons/Skeleton';
import { studentApi } from '../../services/studentApi';

function SectionTitle({ children }) {
  return <h2 className="font-display text-lg text-navy mb-4">{children}</h2>;
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      cgpa: 0,
      liveBacklogs: 0,
      historyBacklogs: 0,
      academics: { ssc: {}, hsc: {} },
      skills: { programmingLanguages: [], frameworks: [] },
      projects: [],
      certifications: [],
      codingProfiles: {},
    },
  });

  const projectsArray = useFieldArray({ control, name: 'projects' });
  const certificationsArray = useFieldArray({ control, name: 'certifications' });

  useEffect(() => {
    studentApi
      .getMe()
      .then(({ data }) => {
        const p = data.data;
        setProfile(p);
        reset({
          cgpa: p.cgpa,
          liveBacklogs: p.liveBacklogs,
          historyBacklogs: p.historyBacklogs,
          academics: {
            ssc: p.academics?.ssc || {},
            hsc: p.academics?.hsc || {},
          },
          skills: {
            programmingLanguages: (p.skills?.programmingLanguages || []).join(', '),
            frameworks: (p.skills?.frameworks || []).join(', '),
          },
          projects: p.projects || [],
          certifications: p.certifications || [],
          codingProfiles: p.codingProfiles || {},
        });
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        cgpa: Number(values.cgpa),
        liveBacklogs: Number(values.liveBacklogs),
        historyBacklogs: Number(values.historyBacklogs),
        skills: {
          programmingLanguages: values.skills.programmingLanguages
            ? values.skills.programmingLanguages.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          frameworks: values.skills.frameworks
            ? values.skills.frameworks.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
        },
      };
      const { data } = await studentApi.updateMe(payload);
      setProfile(data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const { data } = await studentApi.uploadResume(file);
      setProfile(data.data);
      toast.success('Resume uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingResume(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { data } = await studentApi.uploadPhoto(file);
      setProfile(data.data);
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) return <SkeletonCard />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy mb-1">My profile</h1>
          <p className="text-slate-light text-sm">Keep this current — it's what recruiters and the placement cell see.</p>
        </div>
        <SealBadge status={profile?.verificationStatus} />
      </div>

      {/* Uploads */}
      <Card>
        <SectionTitle>Resume & photo</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-navy border border-dashed border-navy-100 rounded-card px-4 py-3 cursor-pointer hover:bg-navy-50">
              <Upload className="w-4 h-4" />
              {uploadingResume ? 'Uploading…' : profile?.resumeUrl ? 'Replace resume (PDF)' : 'Upload resume (PDF)'}
              <input type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} disabled={uploadingResume} />
            </label>
            {profile?.resumeUrl && (
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-seal-dark hover:underline mt-1 inline-block">
                View current resume
              </a>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-navy border border-dashed border-navy-100 rounded-card px-4 py-3 cursor-pointer hover:bg-navy-50">
              <Upload className="w-4 h-4" />
              {uploadingPhoto ? 'Uploading…' : profile?.photoUrl ? 'Replace photo' : 'Upload photo'}
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
            </label>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Academics */}
        <Card>
          <SectionTitle>Academics</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <Input label="Overall CGPA" type="number" step="0.01" {...register('cgpa')} />
            <Input label="Live backlogs" type="number" {...register('liveBacklogs')} />
            <Input label="History backlogs" type="number" {...register('historyBacklogs')} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="SSC %" type="number" step="0.01" {...register('academics.ssc.percentage')} />
            <Input label="HSC %" type="number" step="0.01" {...register('academics.hsc.percentage')} />
          </div>
        </Card>

        {/* Skills */}
        <Card>
          <SectionTitle>Skills</SectionTitle>
          <div className="space-y-4">
            <Input label="Programming languages (comma separated)" {...register('skills.programmingLanguages')} />
            <Input label="Frameworks (comma separated)" {...register('skills.frameworks')} />
          </div>
        </Card>

        {/* Projects */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Projects</SectionTitle>
            <button
              type="button"
              onClick={() => projectsArray.append({ title: '', description: '', link: '' })}
              className="flex items-center gap-1 text-sm font-medium text-seal-dark hover:underline"
            >
              <Plus className="w-4 h-4" /> Add project
            </button>
          </div>
          <div className="space-y-4">
            {projectsArray.fields.map((field, index) => (
              <div key={field.id} className="border border-navy-100 rounded-card p-4 relative">
                <button
                  type="button"
                  onClick={() => projectsArray.remove(index)}
                  className="absolute top-3 right-3 text-slate-light hover:text-rejected"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid md:grid-cols-2 gap-3">
                  <Input label="Title" {...register(`projects.${index}.title`)} />
                  <Input label="Link" {...register(`projects.${index}.link`)} />
                </div>
                <Input label="Description" className="mt-3" {...register(`projects.${index}.description`)} />
              </div>
            ))}
            {projectsArray.fields.length === 0 && (
              <p className="text-sm text-slate-light">No projects added yet.</p>
            )}
          </div>
        </Card>

        {/* Certifications */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Certifications</SectionTitle>
            <button
              type="button"
              onClick={() => certificationsArray.append({ title: '', issuer: '', url: '' })}
              className="flex items-center gap-1 text-sm font-medium text-seal-dark hover:underline"
            >
              <Plus className="w-4 h-4" /> Add certification
            </button>
          </div>
          <div className="space-y-4">
            {certificationsArray.fields.map((field, index) => (
              <div key={field.id} className="border border-navy-100 rounded-card p-4 relative">
                <button
                  type="button"
                  onClick={() => certificationsArray.remove(index)}
                  className="absolute top-3 right-3 text-slate-light hover:text-rejected"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid md:grid-cols-2 gap-3">
                  <Input label="Title" {...register(`certifications.${index}.title`)} />
                  <Input label="Issuer" {...register(`certifications.${index}.issuer`)} />
                </div>
              </div>
            ))}
            {certificationsArray.fields.length === 0 && (
              <p className="text-sm text-slate-light">No certifications added yet.</p>
            )}
          </div>
        </Card>

        {/* Coding profiles */}
        <Card>
          <SectionTitle>Coding profiles</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="GitHub" {...register('codingProfiles.github')} />
            <Input label="LinkedIn" {...register('codingProfiles.linkedin')} />
            <Input label="LeetCode" {...register('codingProfiles.leetcode')} />
            <Input label="Codeforces" {...register('codingProfiles.codeforces')} />
          </div>
        </Card>

        <Button type="submit" isLoading={saving} className="w-full md:w-auto">
          Save changes
        </Button>
      </form>
    </div>
  );
}
