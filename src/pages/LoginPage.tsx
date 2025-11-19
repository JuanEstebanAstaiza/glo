import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore, UserRole } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GloLogo } from '@/components/GloLogo';
import { Toaster, toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
type LoginFormValues = z.infer<typeof loginSchema>;
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.63 1.9-3.87 0-7-3.13-7-7s3.13-7 7-7c2.25 0 3.67.9 4.5 1.7l2.48-2.48C18.48 2.44 15.92 1 12.48 1 5.88 1 1 5.88 1 12.48s4.88 11.48 11.48 11.48c6.48 0 11.04-4.44 11.04-11.04 0-.76-.1-1.48-.25-2.16H12.48z" />
  </svg>
);
export function LoginPage() {
  const navigate = useNavigate();
  const loginAction = useAuthStore(state => state.login);
  const [selectedRole, setSelectedRole] = useState<UserRole>('manicurist');
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const handleLogin = (role: UserRole) => {
    toast.success(`Logged in as ${role}! Redirecting...`);
    loginAction(role);
    setTimeout(() => {
      switch (role) {
        case 'manicurist':
          navigate('/dashboard');
          break;
        case 'client':
          navigate('/client-dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    }, 1000);
  };
  const onSubmit = (values: LoginFormValues) => {
    console.log('Login attempt with:', values, 'as', selectedRole);
    handleLogin(selectedRole);
  };
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <Toaster richColors />
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <GloLogo className="h-12 w-12 mx-auto text-brand-rose mb-4" />
          <CardTitle className="text-2xl font-bold text-brand-charcoal">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Glo account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="space-y-3">
                <FormLabel>Sign in as</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => setSelectedRole(value as UserRole)}
                    defaultValue={selectedRole}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="manicurist" />
                      </FormControl>
                      <FormLabel className="font-normal">Manicurist</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="client" />
                      </FormControl>
                      <FormLabel className="font-normal">Client</FormLabel>
                    </FormItem>
                     <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="admin" />
                      </FormControl>
                      <FormLabel className="font-normal">Admin</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
              <Button type="submit" className="w-full bg-brand-charcoal hover:bg-brand-charcoal/90 text-white" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => handleLogin(selectedRole)}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Don't have an account?{' '}
            <Link to="/register" className="underline text-brand-rose hover:text-brand-rose/80">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}