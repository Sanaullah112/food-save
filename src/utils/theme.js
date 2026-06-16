export const T = {
    primary: '#1B3A6B',
    primaryDark: '#112850',
    primaryLight: '#EEF3FB',
    gold: '#D4A017',
    goldLight: '#FEF3C7',
    goldBright: '#F0C040',
    surface: '#F4F6FB',
    white: '#FFFFFF',
    text: '#0F1C35',
    muted: '#4A5568',
    light: '#8A96A8',
    border: '#D8E2F0',
    danger: '#DC2626',
    dangerBg: '#FEE2E2',
    success: '#15803D',
    successBg: '#DCFCE7',
    warning: '#A16207',
    warningBg: '#FEF9C3',
    info: '#1D4ED8',
    infoBg: '#DBEAFE',
  }
   
  export const GLOBAL_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
    @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulseDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:0.5}}
    .au{animation:fadeUp 0.55s cubic-bezier(.22,1,.36,1) both;opacity:0}
    .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.16s}.d4{animation-delay:.22s}.d5{animation-delay:.28s}.d6{animation-delay:.34s}
    .skel{background:linear-gradient(90deg,#E8EEF8 25%,#D8E2F0 50%,#E8EEF8 75%);background-size:600px 100%;animation:shimmer 1.4s infinite;border-radius:8px}
    .fs-card{background:white;border:1px solid #D8E2F0;border-radius:18px;transition:all 0.3s cubic-bezier(.34,1.56,.64,1)}
    .fs-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(27,58,107,0.13);border-color:#1B3A6B}
    .fs-card-static{background:white;border:1px solid #D8E2F0;border-radius:18px}
    .stat-card{background:white;border:1px solid #D8E2F0;border-radius:16px;padding:22px;transition:all 0.3s ease;position:relative;overflow:hidden;cursor:default}
    .stat-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#1B3A6B,#D4A017);transform:scaleX(0);transition:transform 0.35s ease;transform-origin:left}
    .stat-card:hover::after{transform:scaleX(1)}
    .stat-card:hover{transform:translateY(-4px);box-shadow:0 12px 36px rgba(27,58,107,0.13)}
    .btn-primary{background:linear-gradient(135deg,#1B3A6B,#2A52A0);color:white;border:none;padding:11px 22px;border-radius:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;display:inline-flex;align-items:center;gap:7px;transition:all 0.25s cubic-bezier(.34,1.56,.64,1);box-shadow:0 3px 12px rgba(27,58,107,0.3);text-decoration:none}
    .btn-primary:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 8px 24px rgba(27,58,107,0.4)}
    .btn-gold{background:linear-gradient(135deg,#D4A017,#F0C040);color:#0F1C35;border:none;padding:11px 22px;border-radius:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;display:inline-flex;align-items:center;gap:7px;transition:all 0.25s cubic-bezier(.34,1.56,.64,1);box-shadow:0 3px 12px rgba(212,160,23,0.35);text-decoration:none}
    .btn-gold:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 8px 24px rgba(212,160,23,0.5)}
    .btn-ghost{background:white;color:#4A5568;border:1.5px solid #D8E2F0;padding:10px 18px;border-radius:11px;font-size:14px;font-weight:500;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;display:inline-flex;align-items:center;gap:7px;transition:all 0.2s ease}
    .btn-ghost:hover{background:#EEF3FB;color:#1B3A6B;border-color:#1B3A6B;transform:translateY(-1px)}
    .btn-danger{background:#FEE2E2;color:#DC2626;border:1px solid #FECACA;padding:9px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;display:inline-flex;align-items:center;gap:6px;transition:all 0.2s ease}
    .btn-danger:hover{background:#DC2626;color:white;transform:translateY(-1px)}
    .fs-input{display:flex;align-items:center;gap:9px;border:2px solid #D8E2F0;border-radius:11px;padding:10px 14px;background:white;transition:all 0.2s ease}
    .fs-input:focus-within{border-color:#1B3A6B;box-shadow:0 0 0 3px rgba(27,58,107,0.08)}
    .fs-input.err{border-color:#DC2626;background:#FEF2F2}
    .fs-input input,.fs-input select,.fs-input textarea{border:none;outline:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#0F1C35;background:transparent;flex:1}
    .fs-input input::placeholder,.fs-input textarea::placeholder{color:#A0AEC0}
    .badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600}
    .badge-available{background:#DCFCE7;color:#15803D}
    .badge-requested{background:#FEF9C3;color:#A16207}
    .badge-collected{background:#DBEAFE;color:#1D4ED8}
    .badge-delivered{background:#EDE9FE;color:#7C3AED}
    .badge-expired{background:#FEE2E2;color:#DC2626}
    .badge-pending{background:#FEF9C3;color:#A16207}
    .badge-accepted{background:#DCFCE7;color:#15803D}
    .badge-rejected{background:#FEE2E2;color:#DC2626}
    .badge-donor{background:#DBEAFE;color:#1D4ED8}
    .badge-ngo{background:#EDE9FE;color:#7C3AED}
    .badge-driver{background:#FEF9C3;color:#A16207}
    .badge-admin{background:linear-gradient(135deg,#EEF3FB,#DBEAFE);color:#1B3A6B}
    .fs-table{width:100%;border-collapse:collapse;font-size:14px}
    .fs-table th{text-align:left;padding:11px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#8A96A8;background:#F4F6FB;border-bottom:1px solid #D8E2F0}
    .fs-table td{padding:14px 16px;border-bottom:1px solid #EEF3FB;color:#0F1C35;vertical-align:middle}
    .fs-table tr:last-child td{border-bottom:none}
    .fs-table tr:hover td{background:#F8FAFF}
    .modal-bg{position:fixed;inset:0;background:rgba(10,20,50,0.6);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);animation:scaleIn 0.2s ease}
    .modal-box{background:white;border-radius:24px;width:100%;overflow:hidden;animation:slideUp 0.3s cubic-bezier(.34,1.56,.64,1);box-shadow:0 32px 80px rgba(10,20,50,0.35)}
    .page-header{background:linear-gradient(135deg,#0F1C35,#1B3A6B);padding:32px;border-radius:0 0 24px 24px;margin-bottom:28px;position:relative;overflow:hidden}
    .page-header::after{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(212,160,23,0.15),transparent 70%)}
    .search-bar{display:flex;align-items:center;gap:9px;background:white;border:2px solid #D8E2F0;border-radius:11px;padding:10px 14px;transition:all 0.2s ease}
    .search-bar:focus-within{border-color:#1B3A6B;box-shadow:0 0 0 3px rgba(27,58,107,0.08)}
    .search-bar input{border:none;outline:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#0F1C35;background:transparent;flex:1}
    .search-bar input::placeholder{color:#A0AEC0}
  `