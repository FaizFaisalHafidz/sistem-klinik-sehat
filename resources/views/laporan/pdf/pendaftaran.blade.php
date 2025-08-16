<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $judul }}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            color: #333;
            background-color: #ffffff;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #0D7ABC;
            padding-bottom: 25px;
            background: #ffffff;
            padding: 20px;
            margin: -20px -20px 30px -20px;
            color: #333333;
            position: relative;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #0D7ABC, #1E88E5, #0D7ABC);
        }
        
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 15px auto;
            display: block;
            border: 3px solid #0D7ABC;
            border-radius: 50%;
            padding: 5px;
            background: #f8f9fa;
        }
        
        .clinic-name {
            margin: 10px 0 5px 0;
            font-size: 28px;
            font-weight: bold;
            color: #0D7ABC;
            text-shadow: none;
            letter-spacing: 2px;
        }
        
        .clinic-subtitle {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #1E88E5;
            font-weight: 500;
        }
        
        .clinic-info {
            margin: 12px 0 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 2px solid #e9ecef;
        }
        
        .clinic-address {
            font-size: 13px;
            color: #333333;
            line-height: 1.6;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .clinic-contact {
            font-size: 12px;
            color: #555555;
            line-height: 1.5;
        }
        
        .clinic-contact div {
            margin: 3px 0;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #0D7ABC, transparent);
            margin: 15px 0;
        }
        .header h2 {
            margin: 15px 0 5px 0;
            font-size: 20px;
            color: #ffffff;
            background: linear-gradient(135deg, #0D7ABC, #1E88E5);
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-weight: 600;
            letter-spacing: 1px;
        }
        
        .header p {
            margin: 8px 0;
            color: #333333;
            font-size: 12px;
            font-weight: 500;
        }
        .stats {
            width: 100%;
            margin-bottom: 25px;
            background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #0D7ABC;
        }
        .stats table {
            width: 100%;
            border: none;
        }
        .stats table td {
            text-align: center;
            width: 25%;
            border: none;
            padding: 15px 10px;
        }
        .stat-item h3 {
            margin: 0;
            font-size: 18px;
            color: #0D7ABC;
            font-weight: bold;
        }
        .stat-item p {
            margin: 8px 0 0 0;
            font-size: 16px;
            color: #333;
        }
        .stat-item p {
            margin: 5px 0 0 0;
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
        }
            font-size: 10px;
            color: #0D7ABC;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(13, 122, 188, 0.1);
        }
        th, td {
            border: 1px solid #E1F5FE;
            padding: 12px 8px;
            text-align: left;
            font-size: 11px;
        }
        th {
            background: linear-gradient(135deg, #0D7ABC 0%, #1565C0 100%);
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 10px;
        }
        tr:nth-child(even) {
            background-color: #F8FCFF;
        }
        tr:hover {
            background-color: #E3F2FD;
        }
        .badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .badge-success { 
            background-color: #C8E6C9; 
            color: #2E7D32;
            border: 1px solid #4CAF50;
        }
        .badge-warning { 
            background-color: #FFF3E0; 
            color: #F57C00;
            border: 1px solid #FF9800;
        }
        .badge-primary { 
            background-color: #E3F2FD; 
            color: #0D7ABC;
            border: 1px solid #2196F3;
        }
        .badge-danger { 
            background-color: #FFEBEE; 
            color: #C62828;
            border: 1px solid #F44336;
        }
        .footer {
            position: fixed;
            bottom: 15px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-size: 9px;
            color: #0D7ABC;
            border-top: 2px solid #E3F2FD;
            padding-top: 10px;
            background-color: white;
        }
        .watermark {
            position: fixed;
            bottom: 50%;
            left: 50%;
            transform: translate(-50%, 50%) rotate(-45deg);
            font-size: 60px;
            color: rgba(13, 122, 188, 0.05);
            font-weight: bold;
            z-index: -1;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('logo-clinic.png') }}" alt="Klinik Sehat Logo" class="logo">
        <h1 class="clinic-name">KLINIK SEHAT</h1>
        <p class="clinic-subtitle">Yayasan Al Fathonah</p>
        
        <div class="clinic-info">
            <div class="clinic-address">
                Jl. Kesehatan Raya No. 123, Kelurahan Sehat<br>
                Kecamatan Sejahtera, Kota Bahagia 12345
            </div>
            
            <div class="divider"></div>
            
            <div class="clinic-contact">
                <div>Telp: (021) 8888-9999 | WA: +62 812-3456-7890</div>
                <div>Email: info@kliniksehat.com | www.kliniksehat.com</div>
                <div>Izin Operasional: 445/DINKES-KS/VIII/2024</div>
            </div>
        </div>
        
        <h2>{{ $judul }}</h2>
        <p><strong>Periode:</strong> {{ $periode }}</p>
        <p><strong>Dicetak pada:</strong> {{ date('d M Y, H:i') }} WIB</p>
    </div>

    <div class="watermark">KLINIK SEHAT</div>

    <div class="stats">
        <table>
            <tr>
                <td>
                    <div class="stat-item">
                        <h3>{{ $stats['total_pendaftaran'] ?? 0 }}</h3>
                        <p>Total Pendaftaran</p>
                    </div>
                </td>
                <td>
                    <div class="stat-item">
                        <h3>{{ $stats['pendaftaran_hari_ini'] ?? 0 }}</h3>
                        <p>Hari Ini</p>
                    </div>
                </td>
                <td>
                    <div class="stat-item">
                        <h3>{{ $stats['pendaftaran_selesai'] ?? 0 }}</h3>
                        <p>Selesai</p>
                    </div>
                </td>
                <td>
                    <div class="stat-item">
                        <h3>{{ $stats['pasien_baru'] ?? 0 }}</h3>
                        <p>Pasien Baru</p>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 15%">Kode Pendaftaran</th>
                <th style="width: 25%">Pasien</th>
                <th style="width: 12%">Tanggal</th>
                <th style="width: 15%">Jenis Pemeriksaan</th>
                <th style="width: 20%">Keluhan</th>
                <th style="width: 13%">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $item)
            <tr>
                <td>{{ $item->kode_pendaftaran }}</td>
                <td>
                    <strong>{{ $item->pasien->nama_lengkap }}</strong><br>
                    <small>{{ $item->pasien->kode_pasien }} • {{ $item->pasien->umur }} th • {{ $item->pasien->jenis_kelamin === 'laki-laki' ? 'L' : 'P' }}</small>
                </td>
                <td>{{ $item->tanggal_pendaftaran->format('d/m/Y H:i') }}</td>
                <td>{{ ucfirst(str_replace('_', ' ', $item->jenis_pemeriksaan)) }}</td>
                <td>{{ \Str::limit($item->keluhan, 40) }}</td>
                <td>
                    @if($item->status_pendaftaran === 'selesai')
                        <span class="badge badge-success">Selesai</span>
                    @elseif($item->status_pendaftaran === 'sedang_diperiksa')
                        <span class="badge badge-primary">Sedang Diperiksa</span>
                    @elseif($item->status_pendaftaran === 'menunggu')
                        <span class="badge badge-warning">Menunggu</span>
                    @else
                        <span class="badge badge-danger">{{ ucfirst($item->status_pendaftaran) }}</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center; color: #666; font-style: italic;">
                    Tidak ada data pendaftaran dalam periode yang dipilih
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>&copy; {{ date('Y') }} Klinik Sehat - Yayasan Al Fathonah | {{ $judul }} | <strong>Halaman 1</strong></p>
        <p style="font-size: 8px; margin-top: 5px; color: #666;">Dokumen ini digenerate secara otomatis oleh Sistem Informasi Klinik Sehat</p>
    </div>
</body>
</html>
