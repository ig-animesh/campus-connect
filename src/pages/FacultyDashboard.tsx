import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, X, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router';
import { cn } from '../lib/utils';

export function FacultyDashboard() {

  const { profile } = useAuth();
  const [filterSection, setFilterSection] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>('All');
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  
  const queryClient = useQueryClient();

  const { data: issues, isLoading } = useQuery({
    queryKey: ['faculty_issues', filterSection, filterYear],
    queryFn: async () => {
      let query = supabase
        .from('class_issues')
        .select(`
  *,
  profiles!class_issues_cr_id_fkey (
    id,
    name,
    email
  )
`)
        .order('created_at', { ascending: false });

      if (filterSection !== 'All') {
        query = query.eq('section', filterSection);
      }
      if (filterYear !== 'All') {
        query = query.eq('year', filterYear);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    enabled: profile?.role === 'Faculty',
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, response }: { id: string, status: 'Accepted' | 'Rejected', response?: string }) => {
      const { error } = await (supabase.from('class_issues') as any)
        .update({ status, faculty_response: response || null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty_issues'] });
      setSelectedIssue(null);
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  if (profile?.role !== 'Faculty') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">All Class Issues</h1>
          <p className="text-gray-500">Review and take action on class issues.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium">
            {profile.designation}
          </div>
          
          <div className="flex items-center gap-4">

              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Year</span>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="All">All</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                </select>
              </div>

              {/* Section Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Section</span>
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="All">All</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>

        </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-600">
                <th className="px-6 py-4 whitespace-nowrap">CR Name</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Section</th>
                <th className="px-6 py-4">Issue Title</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 whitespace-nowrap">Date</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Status</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : issues?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No issues found.
                  </td>
                </tr>
              ) : (
                issues?.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {issue.profiles?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-gray-900">
                      {issue.section}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <span className="line-clamp-1">{issue.title}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="line-clamp-1">{issue.description}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                      {format(new Date(issue.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-full inline-block",
                        issue.status === 'Accepted' && "bg-green-50 text-green-700",
                        issue.status === 'Rejected' && "bg-red-50 text-red-700",
                        issue.status === 'Pending' && "bg-orange-50 text-orange-700",
                      )}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                      {issue.status === 'Pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: issue.id, status: 'Accepted' })}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: issue.id, status: 'Rejected' })}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10">
              <h2 className="text-xl font-bold text-gray-900">Issue Details</h2>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
              {selectedIssue.image_url ? (
                <div className="w-full md:w-1/2 flex-shrink-0">
                  <img
                    src={selectedIssue.image_url}
                    alt={selectedIssue.title}
                    className="w-full h-auto max-h-[300px] object-cover rounded-2xl border border-gray-100"
                  />
                </div>
              ) : null}
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-sm border-b border-gray-100 pb-4">
                  <span className="font-medium text-gray-500 col-span-1">CR Name</span>
                  <span className="text-gray-900 col-span-2 font-medium">{selectedIssue.profiles?.name}</span>
                  
                  <span className="font-medium text-gray-500 col-span-1">Section</span>
                  <span className="text-gray-900 col-span-2 font-medium">Section {selectedIssue.section}</span>
                  
                  <span className="font-medium text-gray-500 col-span-1">Date</span>
                  <span className="text-gray-900 col-span-2 font-medium">{format(new Date(selectedIssue.created_at), 'dd MMM yyyy')}</span>
                  
                  <span className="font-medium text-gray-500 col-span-1">Status</span>
                  <div className="col-span-2 flex items-center">
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-full",
                      selectedIssue.status === 'Accepted' && "bg-green-50 text-green-700",
                      selectedIssue.status === 'Rejected' && "bg-red-50 text-red-700",
                      selectedIssue.status === 'Pending' && "bg-orange-50 text-orange-700",
                    )}>
                      {selectedIssue.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{selectedIssue.title}</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedIssue.description}</p>
                </div>

                {selectedIssue.status !== 'Pending' && selectedIssue.faculty_response && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mt-4">
                    <span className="text-xs font-bold text-gray-700 mb-1 block">Your Response:</span>
                    <p className="text-sm text-gray-600">{selectedIssue.faculty_response}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedIssue.status === 'Pending' && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const response = formData.get('response') as string;
                    // Note: In this UI design reference, the modal just has Accept/Reject buttons,
                    // but the prompt says "Response Textarea" for Faculty Dashboard.
                    // Let's implement a quick response state if they want.
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Faculty Response (Optional)
                    </label>
                    <textarea
                      id="faculty_response"
                      name="response"
                      rows={2}
                      placeholder="Add a comment before accepting or rejecting..."
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors resize-none bg-white"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const response = (document.getElementById('faculty_response') as HTMLTextAreaElement).value;
                        updateStatusMutation.mutate({ id: selectedIssue.id, status: 'Accepted', response });
                      }}
                      className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const response = (document.getElementById('faculty_response') as HTMLTextAreaElement).value;
                        updateStatusMutation.mutate({ id: selectedIssue.id, status: 'Rejected', response });
                      }}
                      className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
