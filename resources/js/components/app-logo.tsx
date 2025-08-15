export default function AppLogo() {
    return (
        <>
            <img 
                src="/logo-clinic.png" 
                alt="Klinik Sehat Logo" 
                className="size-10 object-contain"
            />
            <div className="ml-3 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-gray-800">Klinik Sehat</span>
                <span className="truncate text-xs text-gray-600 font-medium">Yayasan Al Fathonah</span>
            </div>
        </>
    );
}
