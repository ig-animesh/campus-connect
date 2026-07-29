import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Pencil, Trash2, Loader2, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const issueSchema = z.object({
  student_name: z.string().min(1, 'Name is required'),
  message: z.string().min(1, 'Message is required'),
});

type IssueFormData = z.infer<typeof issueSchema>;

export function CampusIssuesPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
  });

  const { data: issues, isLoading } = useQuery({
    queryKey: ['campus_issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campus_issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
  });

  const postMutation = useMutation({
  mutationFn: async (data: IssueFormData) => {
    if (editingId) {
      const result = await supabase
        .from("campus_issues")
        .update({
          student_name: data.student_name,
          message: data.message,
        })
        .eq("id", editingId)
        .select();

      console.log("UPDATE RESULT:", result);

      if (result.error) {
        console.error("UPDATE ERROR:", result.error);
        throw result.error;
      }

      return result.data;
    }

    const result = await supabase
      .from("campus_issues")
      .insert([
        {
          student_name: data.student_name,
          message: data.message,
        },
      ])
      .select();

    console.log("INSERT RESULT:", result);

    if (result.error) {
      console.error("INSERT ERROR:", result.error);
      throw result.error;
    }

    return result.data;
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["campus_issues"],
    });

    reset();
    setEditingId(null);

    toast.success(
      editingId
        ? "Issue updated successfully"
        : "Issue posted successfully"
    );
  },

  onError: (error: any) => {
    console.error("FULL ERROR OBJECT:", error);

    toast.error(
      error?.message || "Unknown error"
    );
  },
});

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campus_issues')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campus_issues'] });
      toast.success('Issue deleted');
    },
    onError: (error) => {
      toast.error(`Error deleting: ${error.message}`);
    },
  });

  const onSubmit = (data: IssueFormData) => {
    postMutation.mutate(data);
  };

  const handleEdit = (issue: any) => {
    setEditingId(issue.id);
    setValue('student_name', issue.student_name);
    setValue('message', issue.message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Campus Issues</h1>
        <p className="text-gray-500">Share your views and help improve our campus.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name
              </label>
              <input
                {...register('student_name')}
                type="text"
                placeholder="Enter your name"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors"
              />
              {errors.student_name && (
                <p className="mt-1 text-sm text-red-600">{errors.student_name.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('message')}
                rows={4}
                placeholder="Describe your issue..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors resize-none"
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={postMutation.isPending}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {postMutation.isPending ? (
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
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Issues</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : issues?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
            <p className="text-gray-500">No campus issues reported yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues?.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {issue.student_name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {format(new Date(issue.created_at), 'dd MMM yyyy')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm break-words whitespace-pre-wrap">
                      {issue.message}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleEdit(issue)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit issue"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
