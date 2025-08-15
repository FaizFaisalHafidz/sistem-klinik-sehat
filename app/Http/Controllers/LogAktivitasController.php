<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LogAktivitasController extends Controller
{
    public function index(Request $request)
    {
        $query = LogAktivitas::with(['user'])
            ->orderBy('created_at', 'desc');

        // Filter berdasarkan tanggal
        if ($request->filled('tanggal_dari')) {
            $query->whereDate('created_at', '>=', $request->tanggal_dari);
        }

        if ($request->filled('tanggal_sampai')) {
            $query->whereDate('created_at', '<=', $request->tanggal_sampai);
        }

        // Filter berdasarkan user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter berdasarkan nama tabel
        if ($request->filled('nama_tabel')) {
            $query->where('nama_tabel', $request->nama_tabel);
        }

        // Filter berdasarkan aksi
        if ($request->filled('aksi')) {
            $query->where('aksi', $request->aksi);
        }

        // Filter berdasarkan IP address
        if ($request->filled('ip_address')) {
            $query->where('ip_address', 'like', '%' . $request->ip_address . '%');
        }

        $logAktivitas = $query->paginate(20)->withQueryString();

        // Transform data untuk frontend
        $logAktivitasData = $logAktivitas->through(function ($log) {
            return [
                'id' => $log->id,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'nama_lengkap' => $log->user->nama_lengkap,
                    'nama_pengguna' => $log->user->nama_pengguna,
                    'email' => $log->user->email,
                ] : null,
                'nama_tabel' => $log->nama_tabel,
                'record_id' => $log->record_id,
                'aksi' => $log->aksi,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'data_lama' => $log->data_lama,
                'data_baru' => $log->data_baru,
                'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                'created_at_formatted' => $log->created_at->format('d/m/Y H:i:s'),
                'created_at_diff' => $log->created_at->diffForHumans(),
            ];
        });

        // Statistik untuk dashboard
        $totalLogs = LogAktivitas::count();
        $logsHariIni = LogAktivitas::whereDate('created_at', today())->count();
        $logsMingguIni = LogAktivitas::whereBetween('created_at', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ])->count();
        $logsBulanIni = LogAktivitas::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        // Data untuk filter dropdown
        $userList = User::select('id', 'nama_lengkap', 'nama_pengguna', 'email')
            ->where('is_aktif', true)
            ->orderBy('nama_lengkap')
            ->get();

        // Statistik tabel yang paling sering diubah
        $tabelTerbanyak = LogAktivitas::select('nama_tabel', DB::raw('count(*) as total'))
            ->whereNotNull('nama_tabel')
            ->where('nama_tabel', '!=', '')
            ->groupBy('nama_tabel')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();

        // Statistik aksi
        $aksiStats = LogAktivitas::select('aksi', DB::raw('count(*) as total'))
            ->whereNotNull('aksi')
            ->where('aksi', '!=', '')
            ->groupBy('aksi')
            ->orderBy('total', 'desc')
            ->get();

        // User paling aktif
        $userPalingAktif = LogAktivitas::select('user_id', DB::raw('count(*) as total'))
            ->with(['user:id,nama_lengkap,nama_pengguna'])
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'user' => $item->user ? [
                        'id' => $item->user->id,
                        'nama_lengkap' => $item->user->nama_lengkap,
                        'nama_pengguna' => $item->user->nama_pengguna,
                    ] : null,
                    'total' => $item->total,
                ];
            });

        return Inertia::render('admin/log-aktivitas/index', [
            'logAktivitas' => $logAktivitasData,
            'filters' => $request->only(['tanggal_dari', 'tanggal_sampai', 'user_id', 'nama_tabel', 'aksi', 'ip_address']),
            'statistics' => [
                'total_logs' => $totalLogs,
                'logs_hari_ini' => $logsHariIni,
                'logs_minggu_ini' => $logsMingguIni,
                'logs_bulan_ini' => $logsBulanIni,
            ],
            'userList' => $userList,
            'tabelTerbanyak' => $tabelTerbanyak,
            'aksiStats' => $aksiStats,
            'userPalingAktif' => $userPalingAktif,
        ]);
    }

    public function show(LogAktivitas $logAktivitas)
    {
        $logAktivitas->load(['user']);

        $logData = [
            'id' => $logAktivitas->id,
            'user' => $logAktivitas->user ? [
                'id' => $logAktivitas->user->id,
                'nama_lengkap' => $logAktivitas->user->nama_lengkap,
                'nama_pengguna' => $logAktivitas->user->nama_pengguna,
                'email' => $logAktivitas->user->email,
            ] : null,
            'nama_tabel' => $logAktivitas->nama_tabel,
            'record_id' => $logAktivitas->record_id,
            'aksi' => $logAktivitas->aksi,
            'ip_address' => $logAktivitas->ip_address,
            'user_agent' => $logAktivitas->user_agent,
            'data_lama' => $logAktivitas->data_lama,
            'data_baru' => $logAktivitas->data_baru,
            'created_at' => $logAktivitas->created_at->format('Y-m-d H:i:s'),
            'created_at_formatted' => $logAktivitas->created_at->format('d F Y, H:i:s'),
            'created_at_diff' => $logAktivitas->created_at->diffForHumans(),
        ];

        // Riwayat aktivitas user yang sama
        $riwayatAktivitas = LogAktivitas::where('user_id', $logAktivitas->user_id)
            ->where('id', '!=', $logAktivitas->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'nama_tabel' => $log->nama_tabel,
                    'aksi' => $log->aksi,
                    'created_at' => $log->created_at->format('d/m/Y H:i:s'),
                    'created_at_diff' => $log->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('admin/log-aktivitas/show', [
            'logAktivitas' => $logData,
            'riwayatAktivitas' => $riwayatAktivitas,
        ]);
    }

    public function export(Request $request)
    {
        $query = LogAktivitas::with(['user'])
            ->orderBy('created_at', 'desc');

        // Apply same filters as index
        if ($request->filled('tanggal_dari')) {
            $query->whereDate('created_at', '>=', $request->tanggal_dari);
        }

        if ($request->filled('tanggal_sampai')) {
            $query->whereDate('created_at', '<=', $request->tanggal_sampai);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('nama_tabel')) {
            $query->where('nama_tabel', $request->nama_tabel);
        }

        if ($request->filled('aksi')) {
            $query->where('aksi', $request->aksi);
        }

        if ($request->filled('ip_address')) {
            $query->where('ip_address', 'like', '%' . $request->ip_address . '%');
        }

        $logAktivitas = $query->get();

        $filename = 'log_aktivitas_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($logAktivitas) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for proper UTF-8 encoding in Excel
            fwrite($file, "\xEF\xBB\xBF");
            
            // Header CSV
            fputcsv($file, [
                'No',
                'Tanggal & Waktu',
                'User',
                'Email',
                'Tabel',
                'Record ID',
                'Aksi',
                'IP Address',
                'User Agent',
            ]);

            // Data CSV
            foreach ($logAktivitas as $index => $log) {
                fputcsv($file, [
                    $index + 1,
                    $log->created_at->format('d/m/Y H:i:s'),
                    $log->user ? $log->user->nama_lengkap : 'System',
                    $log->user ? $log->user->email : '-',
                    $log->nama_tabel,
                    $log->record_id,
                    $log->aksi,
                    $log->ip_address,
                    $log->user_agent,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function clear(Request $request)
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:365',
        ]);

        $cutoffDate = Carbon::now()->subDays($request->days);
        
        $deletedCount = LogAktivitas::where('created_at', '<', $cutoffDate)->delete();

        return redirect()->route('admin.log-aktivitas.index')
            ->with('success', "Berhasil menghapus {$deletedCount} log aktivitas yang lebih dari {$request->days} hari.");
    }
}
