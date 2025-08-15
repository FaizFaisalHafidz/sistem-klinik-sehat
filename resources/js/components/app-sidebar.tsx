import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    Clock,
    FileText,
    LayoutGrid,
    Pill,
    Receipt,
    Stethoscope,
    UserCheck,
    Users,
    UsersRound
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage();
    const auth = page.props.auth as any;
    const roles = auth?.user?.roles?.map((role: any) => role.name) || [];

    // console.log('User Roles:', roles);
    
    // Menu dasar untuk semua pengguna
    const dashboardMenu: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];
    
    // Menu untuk Admin
    const adminMenu: NavItem[] = [
        {
            title: 'Manajemen Pengguna',
            href: '/admin/users',
            icon: Users,
        },
        {
            title: 'Data Pasien',
            href: '/admin/pasien',
            icon: UsersRound,
        },
        {
            title: 'Data Pegawai',
            href: '/admin/pegawai',
            icon: UserCheck,
        },
        {
            title: 'Data Obat',
            href: '/admin/obat',
            icon: Pill,
        },
        {
            title: 'Laporan Rekam Medis',
            href: '/admin/laporan',
            icon: FileText,
        },
        // {
        //     title: 'Log Aktivitas',
        //     href: '/admin/log-aktivitas',
        //     icon: Activity,
        // },
    ];
    
    // Menu untuk Bagian Pendaftaran
    const pendaftaranMenu: NavItem[] = [
        {
            title: 'Data Pasien',
            href: '/pendaftaran/pasien',
            icon: UsersRound,
        },
        {
            title: 'Pendaftaran Baru',
            href: '/pendaftaran/baru',
            icon: ClipboardList,
        },
        // {
        //     title: 'Pendaftaran Pemeriksaan',
        //     href: '/pendaftaran/pemeriksaan',
        //     icon: Calendar,
        // },
        {
            title: 'Antrian Pasien',
            href: '/pendaftaran/antrian',
            icon: Clock,
        },
        {
            title: 'Laporan Rekam Medis',
            href: '/pendaftaran/laporan',
            icon: FileText,
        },
    ];
    
    // Menu untuk Dokter
    const dokterMenu: NavItem[] = [
        {
            title: 'Antrian Pasien',
            href: '/dokter/antrian',
            icon: Clock,
        },
        {
            title: 'Pemeriksaan Pasien',
            href: '/dokter/pemeriksaan',
            icon: Stethoscope,
        },
        {
            title: 'Rekam Medis',
            href: '/dokter/rekam-medis',
            icon: FileText,
        },
        {
            title: 'Resep',
            href: '/dokter/resep',
            icon: Receipt,
        },
        {
            title: 'Data Obat',
            href: '/dokter/obat',
            icon: Pill,
        },
    ];
    
    // Menentukan menu yang akan ditampilkan berdasarkan role
    let mainNavItems = [...dashboardMenu];
    
    if (roles.includes('admin')) {
        mainNavItems = [...mainNavItems, ...adminMenu];
    } else if (roles.includes('pendaftaran')) {
        mainNavItems = [...mainNavItems, ...pendaftaranMenu];
    } else if (roles.includes('dokter')) {
        mainNavItems = [...mainNavItems, ...dokterMenu];
    }

    const footerNavItems: NavItem[] = [
        // {
        //     title: 'Bantuan',
        //     href: '/bantuan',
        //     icon: BookOpen,
        // },
    ];

    return (
        <Sidebar collapsible="icon" variant="floating" className="border-r-0">
            {/* Medical Background Pattern for Sidebar */}
            {/* <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-green-50 overflow-hidden">
                <div className="absolute top-4 right-4 text-blue-100 opacity-30">
                    <Stethoscope size={60} />
                </div>
                <div className="absolute top-1/3 left-2 text-green-100 opacity-20">
                    <Heart size={40} />
                </div>
                <div className="absolute bottom-1/3 right-2 text-blue-100 opacity-20">
                    <Activity size={50} />
                </div>
                <div className="absolute bottom-4 left-4 text-green-100 opacity-30">
                    <Shield size={35} />
                </div>
            </div> */}

            <SidebarHeader className="relative z-10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white/90 hover:border-gray-300/50 transition-all duration-200 shadow-sm">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                
                {/* Role Indicator */}
                {/* {roles.length > 0 && (
                    <div className="mt-3 px-3">
                        <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 backdrop-blur-sm border border-blue-200/50 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-700 capitalize">
                                    {roles.includes('admin') && '👨‍💼 Administrator'}
                                    {roles.includes('pendaftaran') && '🏥 Bagian Pendaftaran'}
                                    {roles.includes('dokter') && '👨‍⚕️ Dokter'}
                                    {roles.includes('apoteker') && '💊 Apoteker'}
                                </span>
                            </div>
                        </div>
                    </div>
                )} */}
            </SidebarHeader>

            <SidebarContent className="relative z-10">
                <div className="px-3">
                    <NavMain items={mainNavItems} />
                </div>
            </SidebarContent>

            <SidebarFooter className="relative z-10">
                <div className="px-3">
                    {/* Medical Stats Card */}
                    {/* <div className="mb-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg p-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="space-y-1">
                                <Heart className="w-4 h-4 text-red-500 mx-auto" />
                                <div className="text-xs font-medium text-gray-700">Pasien</div>
                                <div className="text-xs text-gray-500">Active</div>
                            </div>
                            <div className="space-y-1">
                                <Activity className="w-4 h-4 text-blue-500 mx-auto" />
                                <div className="text-xs font-medium text-gray-700">Status</div>
                                <div className="text-xs text-green-600">Online</div>
                            </div>
                            <div className="space-y-1">
                                <Shield className="w-4 h-4 text-green-500 mx-auto" />
                                <div className="text-xs font-medium text-gray-700">Aman</div>
                                <div className="text-xs text-green-600">Secure</div>
                            </div>
                        </div>
                    </div> */}
                    
                    <NavFooter items={footerNavItems} className="mb-3" />
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
