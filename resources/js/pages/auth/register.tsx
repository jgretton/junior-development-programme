import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface PageProps {
  token: string;
  user: {
    email: string;
    name: string;
  };
}

export default function Register({ user, token }: PageProps) {
  return (
    <AuthLayout title="Finish Your Registration" description="You're almost there! Create a secure password to access your account">
      <Head title="Register" />
      <Form
        {...RegisteredUserController.store.form()}
        resetOnSuccess={['password', 'password_confirmation']}
        disableWhileProcessing
        className="flex flex-col gap-6">
        {({ processing, errors }) => (
          <>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <input type="hidden" name="signup_token" value={token} />
                <Label htmlFor="name">Name</Label>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <InputError message={errors.email} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required tabIndex={3} autoComplete="new-password" name="password" placeholder="Password" />
                <InputError message={errors.password} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password_confirmation">Confirm password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  required
                  tabIndex={4}
                  autoComplete="new-password"
                  name="password_confirmation"
                  placeholder="Confirm password"
                />
                <InputError message={errors.password_confirmation} />
              </div>

              <Button type="submit" className="mt-2 w-full" tabIndex={5} data-test="register-user-button">
                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Complete Registration
              </Button>
            </div>
          </>
        )}
      </Form>
    </AuthLayout>
  );
}
