import { Head, useForm } from '@inertiajs/react';
import { Activity, Heart, LoaderCircle, Shield } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout 
            title="Masuk ke Sistem Klinik" 
            description="Masuk dengan akun Anda untuk mengakses sistem manajemen klinik"
        >
            <Head title="Masuk - Sistem Klinik" />
            
            <form method="POST" className="space-y-6" onSubmit={submit}>
                <div className="space-y-4">
                    {/* Medical Info Cards */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
                            <Heart className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                            <p className="text-xs text-blue-600 font-medium">Pelayanan</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                            <Shield className="w-4 h-4 text-green-500 mx-auto mb-1" />
                            <p className="text-xs text-green-600 font-medium">Aman</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-100">
                            <Activity className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                            <p className="text-xs text-purple-600 font-medium">Efisien</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">
                            Alamat Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@klinik.com"
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-gray-700 font-medium">
                                Kata Sandi
                            </Label>
                            {canResetPassword && (
                                <TextLink 
                                    href={route('password.request')} 
                                    className="text-sm text-blue-600 hover:text-blue-700" 
                                    tabIndex={5}
                                >
                                    Lupa kata sandi?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Masukkan kata sandi"
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                            className="border-gray-300"
                        />
                        <Label htmlFor="remember" className="text-gray-600 font-normal">
                            Ingat saya
                        </Label>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl" 
                        tabIndex={4} 
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />}
                        {processing ? 'Memproses...' : 'Masuk ke Sistem'}
                    </Button>
                </div>
            </form>

            {/* Demo Accounts Info */}
            {/* <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Akun Demo:</h4>
                <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                        <span>👨‍💼 Admin:</span>
                        <span>admin@klinik.com</span>
                    </div>
                    <div className="flex justify-between">
                        <span>🏥 Pendaftaran:</span>
                        <span>pendaftaran@klinik.com</span>
                    </div>
                    <div className="flex justify-between">
                        <span>👨‍⚕️ Dokter:</span>
                        <span>dokter@klinik.com</span>
                    </div>
                    <div className="text-center text-gray-500 mt-2">
                        Password: <code className="bg-gray-200 px-1 rounded">password123</code>
                    </div>
                </div>
            </div> */}

            {status && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center text-sm font-medium text-green-700">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
