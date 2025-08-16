<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $judul }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            margin: 20px;
            color: #2c3e50;
            line-height: 1.4;
            background-color: #ffffff;
            position: relative;
        }
        
        /* Watermark effect */
        body::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 300px;
            height: 300px;
            background: url({{ public_path('logo-clinic.png') }}) no-repeat center center;
            background-size: contain;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            z-index: -1;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            background: #ffffff;
            color: #333333;
            padding: 25px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(13, 122, 188, 0.2);
            position: relative;
            border: 2px solid #0D7ABC;
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
        
        .header h1 {
            margin: 10px 0 5px 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #0D7ABC;
            text-shadow: none;
        }
        
        .header h2 {
            margin: 5px 0;
            font-size: 16px;
            font-weight: 500;
            color: #1E88E5;
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
        
        .header p {
            margin: 5px 0;
            font-size: 11px;
            opacity: 0.8;
        }
        
        .report-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            margin-top: 10px;
            font-size: 12px;
            font-weight: 600;
        }
        .stats {
            width: 100%;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            border: 1px solid #0D7ABC;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(13, 122, 188, 0.1);
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
            font-size: 20px;
            color: #0D7ABC;
            font-weight: 700;
        }
        .stat-item p {
            margin: 5px 0 0 0;
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            font-weight: 500;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(13, 122, 188, 0.1);
        }
        
        th, td {
            border: 1px solid #e9ecef;
            padding: 12px 8px;
            text-align: left;
        }
        
        th {
            background: linear-gradient(135deg, #0D7ABC 0%, #1E88E5 100%);
            color: white;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        tr:hover {
            background-color: rgba(13, 122, 188, 0.05);
        }
        .badge {
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .badge-success { 
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); 
            color: #155724; 
            border: 1px solid #c3e6cb;
        }
        
        .badge-warning { 
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); 
            color: #856404; 
            border: 1px solid #ffeaa7;
        }
        
        .badge-danger { 
            background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); 
            color: #721c24; 
            border: 1px solid #f5c6cb;
        }
        
        .footer {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-size: 9px;
            color: #0D7ABC;
            border-top: 1px solid #e9ecef;
            padding-top: 10px;
            background: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('logo-clinic.png') }}" alt="Logo Klinik" class="logo">
        <h1>KLINIK SEHAT</h1>
        <h2>Yayasan Al Fathonah</h2>
        
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
        
        <div class="report-badge">{{ $judul }}</div>
        <p>Periode: {{ $periode }}</p>
        <p>Dicetak pada: {{ date('d M Y, H:i') }} WIB</p>
    </div>

    <div class="stats">
        <table>
            <tr>
                <td>
                    <div class="stat-item">
                        <h3>{{ $stats['total_rekam_medis'] ?? 0 }}</h3>
                        <p>Total Rekam Medis</p>
                    </div>
                </td>
                <td>
                    <div class="stat-item">
                        <h3>{{ $stats['rekam_medis_bulan_ini'] ?? 0 }}</h3>
                        <p>Bulan Ini</p>
                    </div>
                </td>
                <td>
                    <div class="stat-item">
                        <h3>{{ $stats['rekam_medis_hari_ini'] ?? 0 }}</h3>
                        <p>Hari Ini</p>
                    </div>
                </td>
                <td>
                    <div class="stat-item">
                        <h3>{{ $stats['total_pasien_unik'] ?? 0 }}</h3>
                        <p>Pasien Unik</p>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 15%">Kode RM</th>
                <th style="width: 20%">Pasien</th>
                <th style="width: 15%">Dokter</th>
                <th style="width: 12%">Tanggal</th>
                <th style="width: 20%">Diagnosis</th>
                <th style="width: 10%">Status</th>
                <th style="width: 8%">Gender</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $item)
            <tr>
                <td>{{ $item->kode_rekam_medis }}</td>
                <td>
                    <strong>{{ $item->pasien->nama_lengkap }}</strong><br>
                    <small>{{ $item->pasien->kode_pasien }} • {{ $item->pasien->umur }} th</small>
                </td>
                <td>{{ $item->dokter->nama_lengkap ?? 'N/A' }}</td>
                <td>{{ $item->tanggal_pemeriksaan->format('d/m/Y') }}</td>
                <td>{{ \Str::limit($item->diagnosa, 50) }}</td>
                <td>
                    @if($item->status_rekam_medis === 'selesai')
                        <span class="badge badge-success">Selesai</span>
                    @elseif($item->status_rekam_medis === 'draft')
                        <span class="badge badge-warning">Draft</span>
                    @else
                        <span class="badge badge-danger">Unknown</span>
                    @endif
                </td>
                <td>{{ $item->pasien->jenis_kelamin === 'laki-laki' ? 'L' : 'P' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; color: #666; font-style: italic;">
                    Tidak ada data rekam medis dalam periode yang dipilih
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
