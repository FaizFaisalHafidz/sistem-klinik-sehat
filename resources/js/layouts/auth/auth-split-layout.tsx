import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Activity, Heart, Shield, Stethoscope } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel - Medical Background */}
            <div className="relative hidden h-full flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 p-10 text-white lg:flex dark:border-r">
                {/* Medical Background Pattern */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-10 left-10 text-white/10">
                        <Stethoscope size={120} />
                    </div>
                    <div className="absolute top-1/4 right-10 text-white/10">
                        <Heart size={80} />
                    </div>
                    <div className="absolute bottom-1/4 left-16 text-white/10">
                        <Activity size={100} />
                    </div>
                    <div className="absolute bottom-10 right-16 text-white/10">
                        <Shield size={90} />
                    </div>
                    {/* Medical Cross Pattern */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/5">
                        <div className="w-32 h-32 relative">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-4 bg-white rounded"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-24 bg-white rounded"></div>
                        </div>
                    </div>
                </div>
                
                {/* Logo and App Name */}
                <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                    <div className="flex aspect-square size-12 items-center justify-center rounded-md bg-white shadow-md mr-3">
                        <img 
                            src="/logo-clinic.png" 
                            alt="Klinik Sehat Logo" 
                            className="size-10 object-contain"
                        />
                    </div>
                    {name}
                </Link>
                
                {/* Medical Info Section */}
                <div className="relative z-20 mt-8">
                    <h2 className="text-2xl font-bold mb-4">Sistem Manajemen Klinik</h2>
                    <p className="text-blue-100 mb-6">Platform terintegrasi untuk pengelolaan klinik yang efisien dan modern</p>
                    
                    {/* Feature Highlights */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Heart className="w-4 h-4" />
                            </div>
                            <span className="text-sm">Pelayanan pasien yang optimal</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Shield className="w-4 h-4" />
                            </div>
                            <span className="text-sm">Keamanan data terjamin</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Activity className="w-4 h-4" />
                            </div>
                            <span className="text-sm">Workflow yang efisien</span>
                        </div>
                    </div>
                </div>
                
                {/* Quote Section */}
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg italic">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-blue-200">— {quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            
            {/* Right Panel - Login Form */}
            <div className="w-full lg:p-8 bg-gray-50/50">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    {/* Mobile Logo */}
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <div className="flex aspect-square size-12 items-center justify-center rounded-md bg-white shadow-md border border-gray-200 mr-3">
                            <img 
                                src="/logo-clinic.png" 
                                alt="Klinik Sehat Logo" 
                                className="size-10 object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold text-gray-800">{name}</span>
                    </Link>
                    
                    {/* Title and Description */}
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                        <p className="text-sm text-balance text-gray-600">{description}</p>
                    </div>
                    
                    {/* Form Content */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
