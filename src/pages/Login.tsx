import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

interface AuthForm {
  email: string;
  password: string;
  confirmPassword?: string;
}

export default function Login() {
  const { signIn, signUp, requestPasswordReset, updatePassword, isRecoveringPassword } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<AuthForm>();

  const onSubmit = async (data: AuthForm) => {
    try {
      setIsSubmitting(true);
      if (isRecoveringPassword) {
        await updatePassword(data.password);
      } else if (isRequestingReset) {
        await requestPasswordReset(data.email);
      } else if (isRegistering) {
        await signUp(data.email, data.password);
      } else {
        await signIn(data.email, data.password);
      }
      reset();
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Construction QC System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRecoveringPassword
              ? 'Choose a new password'
              : isRequestingReset
                ? 'Recover your account'
                : isRegistering
                  ? 'Create your account'
                  : 'Sign in to your account'}
          </p>
        </div>

          <>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="rounded-md shadow-sm -space-y-px">
                {!isRecoveringPassword && <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>}
                {!isRequestingReset && <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type="password"
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                      isRegistering || isRecoveringPassword ? '' : 'rounded-b-md'
                    } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                    placeholder="Password"
                    disabled={isSubmitting}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>}
                {(isRegistering || isRecoveringPassword) && (
                  <div>
                    <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                    <input
                      {...register('confirmPassword', {
                        validate: value => value === watch('password') || 'Passwords do not match'
                      })}
                      type="password"
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Confirm password"
                      disabled={isSubmitting}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Processing...'
                    : isRecoveringPassword
                      ? 'Set new password'
                      : isRequestingReset
                        ? 'Send recovery link'
                        : isRegistering
                          ? 'Create Account'
                          : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center space-y-2">
              {!isRegistering && !isRequestingReset && !isRecoveringPassword && (
                <button
                  onClick={() => {
                    setIsRequestingReset(true);
                    reset();
                  }}
                  className="block w-full text-sm text-indigo-600 hover:text-indigo-500"
                  disabled={isSubmitting}
                >
                  Forgot your password?
                </button>
              )}
              {!isRecoveringPassword && <button
                onClick={() => {
                  if (isRequestingReset) {
                    setIsRequestingReset(false);
                  } else {
                    setIsRegistering(!isRegistering);
                  }
                  reset();
                }}
                className="block w-full text-sm text-gray-600 hover:text-gray-500"
                disabled={isSubmitting}
              >
                {isRequestingReset || isRegistering
                  ? 'Back to sign in'
                  : "Don't have an account? Create one"}
              </button>}
            </div>
          </>
      </div>
    </div>
  );
}
