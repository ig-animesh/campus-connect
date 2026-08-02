import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, Navigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['CR', 'Faculty']),
  department: z.preprocess(
  (val) => val === "" ? undefined : val,
  z.enum(['BCA', 'BBA'])
).refine((val) => val !== undefined, {
  message: "Department is required",
}),
  year: z.preprocess(
  (val) => val === "" ? undefined : val,
  z.enum(['1','2','3']).optional()
),
  section: z.preprocess(
  (val) => val === "" ? undefined : val,
  z.enum(['A', 'B', 'C', 'D']).optional()
),
  designation: z.preprocess(
  (val) => val === "" ? undefined : val,
  z.enum(['Class Coordinator', 'HOD', 'Dean']).optional()
),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'CR' && !data.section) return false;
  return true;
}, {
  message: "Section is required for CR",
  path: ["section"],
}).refine((data) => {
  if (data.role === 'Faculty' && !data.designation) return false;
  return true;
}, {
  message: "Designation is required for Faculty",
  path: ["designation"],
}).refine((data) => {
  if (data.role === 'CR' && !data.year) return false;
  return true;
}, {
  message: "Year is required for CR",
  path: ["year"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const {
  register,
  handleSubmit,
  watch,
  formState: { errors },
} = useForm<SignupFormData>({
  resolver: zodResolver(signupSchema),
  defaultValues: {
    role: 'CR',
  },
  shouldUnregister: true,
});

  const selectedRole = watch('role');

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (user && profile) {
    if (profile.role === 'CR') return <Navigate to="/dashboard/cr" replace />;
    if (profile.role === 'Faculty') return <Navigate to="/dashboard/faculty" replace />;
  }

const onSubmit = async (data: SignupFormData) => {
  console.log(data);
  setIsLoading(true);

  try {
    const { data: authData, error: signUpError } =
      await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

    if (signUpError) throw signUpError;

    if (authData.user) {
      const { error: profileError } =
        await supabase.from("profiles").insert([
          {
            id: authData.user.id,
            name: data.name,
            email: data.email,
            role: data.role,
            department: data.department,
            year:
              data.role === "CR" && data.year
                ? data.year
                : null,
            section:
              data.role === "CR" && data.section
                ? data.section
                : null,
            designation:
              data.role === "Faculty" ? data.designation : null,
          },
        ]);

      if (profileError) throw profileError;
    }

    toast.success("Account created successfully");
    navigate('/login');

  } catch (error) {
    console.error(error);
    toast.error((error as any).message);
  } finally {
    setIsLoading(false);
  }
};
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Account</h1>
          <p className="text-gray-500">Join Campus Connect</p>
        </div>

        <form
  onSubmit={handleSubmit(
    onSubmit,
    (errors) => {
      console.log("FORM ERRORS:", errors);
    }
  )}
  className="space-y-6"
>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="Enter password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="Confirm password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                {...register('role')}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors bg-white"
              >
                <option value="CR">CR</option>
                <option value="Faculty">Faculty</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Department
  </label>
  <select
    {...register('department')}
    className="w-full rounded-xl border border-gray-200 px-4 py-3"
  >
    <option value="">Select Department</option>
    <option value="BCA">BCA</option>
    <option value="BBA">BBA</option>
  </select>
  {errors.department && (
    <p className="mt-1 text-sm text-red-600">
      {errors.department.message}
    </p>
  )}
</div>

            {selectedRole === 'CR' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Year
    </label>
    <select
      {...register('year')}
      className="w-full rounded-xl border border-gray-200 px-4 py-3"
    >
      <option value="">Select Year</option>
      <option value="1">1st Year</option>
      <option value="2">2nd Year</option>
      <option value="3">3rd Year</option>
    </select>
    {errors.year && (
      <p className="mt-1 text-sm text-red-600">
        {errors.year.message}
      </p>
    )}
  </div>
)}

            {selectedRole === 'CR' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  {...register('section')}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors bg-white"
                >
                  <option value="">Select Section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
                {errors.section && (
                  <p className="mt-1 text-sm text-red-600">{errors.section.message}</p>
                )}
              </div>
            )}

            {selectedRole === 'Faculty' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <select
                  {...register('designation')}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors bg-white"
                >
                  <option value="">Select Designation</option>
                  <option value="Class Coordinator">Class Coordinator</option>
                  <option value="HOD">HOD</option>
                  <option value="Dean">Dean</option>
                </select>
                {errors.designation && (
                  <p className="mt-1 text-sm text-red-600">{errors.designation.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
  type="submit"
  onClick={() => console.log("BUTTON CLICKED")}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
