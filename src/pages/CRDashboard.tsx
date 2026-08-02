import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useFileUpload } from '../hooks/useFileUpload';
import { Pencil, Trash2, Loader2, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router';
import { cn } from '../lib/utils';

const classIssueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

type ClassIssueFormData = z.infer<typeof classIssueSchema>;

export function CRDashboard() {
  const { user, profile } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { uploadFile, isUploading } = useFileUpload();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ClassIssueFormData>({
    resolver: zodResolver(classIssueSchema),
  });

  const { data: issues, isLoading } = useQuery({
    queryKey: ['class_issues', profile?.section],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_issues')
        .select('*')
        .eq('cr_id', user!.id)
        .order('created_at', { ascending: false });

        console.log("PROFILE DATA 👉", profile);
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user && !!profile?.section,
  });

  const postMutation = useMutation({
    mutationFn: async (data: ClassIssueFormData) => {
      let imageUrl = existingImageUrl;

      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
      }

      const payload = {
        cr_id: user!.id,
        section: profile!.section as 'A' | 'B' | 'C' | 'D',
        department: profile!.department, 
        year: profile?.year ?? null,           
        title: data.title,
        description: data.description,
        image_url: imageUrl,
      };

      if (editingId) {
        const { error } = await (supabase.from('class_issues') as any)
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from('class_issues') as any)
          .insert([{ ...payload, status: 'Pending' }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class_issues', profile?.section] });
      handleCancelEdit();
      toast.success(editingId ? 'Issue updated' : 'Issue posted successfully');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('class_issues')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class_issues', profile?.section] });
      toast.success('Issue deleted');
    },
    onError: (error) => {
      toast.error(`Error deleting: ${error.message}`);
    },
  });

  const onSubmit = (data: ClassIssueFormData) => {
    postMutation.mutate(data);
  };

  const handleEdit = (issue: any) => {
    setEditingId(issue.id);
    setValue('title', issue.title);
    setValue('description', issue.description);
    setExistingImageUrl(issue.image_url);
    setSelectedFile(null);
    setPreviewUrl(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
    setSelectedFile(null);
    setPreviewUrl(null);
    setExistingImageUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExistingImageUrl(null);
  };

  if (profile?.role !== 'CR') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Class Issues</h1>
          <p className="text-gray-500">Post, update or delete class issues.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium">
          Section {profile.section}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="Enter issue title"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe the issue..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors resize-none"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Upload
              </label>
              <div className="w-full rounded-xl border border-gray-200 p-4 min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden bg-gray-50/50">
                {(previewUrl || existingImageUrl) ? (
                  <div className="relative w-full h-40">
                    <img 
                      src={previewUrl || existingImageUrl!} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={postMutation.isPending || isUploading}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {(postMutation.isPending || isUploading) ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : editingId ? (
                'Update'
              ) : (
                'Post'
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">My Issues</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : issues?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
            <p className="text-gray-500">No issues posted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues?.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md"
              >
                {issue.image_url ? (
                  <img src={issue.image_url} alt={issue.title} className="w-full h-48 object-cover border-b border-gray-100" />
                ) : (
                  <div className="w-full h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2" title={issue.title}>
                      {issue.title}
                    </h3>
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-full shrink-0",
                      issue.status === 'Accepted' && "bg-green-50 text-green-700",
                      issue.status === 'Rejected' && "bg-red-50 text-red-700",
                      issue.status === 'Pending' && "bg-orange-50 text-orange-700",
                    )}>
                      {issue.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                    {issue.description}
                  </p>
                  
                  {issue.faculty_response && (
                    <div className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Faculty Response:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{issue.faculty_response}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-medium">
                      {format(new Date(issue.created_at), 'dd MMM yyyy')}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(issue)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit issue"
                        disabled={issue.status !== 'Pending'}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this issue?')) {
                            deleteMutation.mutate(issue.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete issue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
