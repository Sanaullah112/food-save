import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/api";
import Navbar from "../../components/Navbar";

// ─── Shared config ─────────────────────────────────────────────────────────────
const cat = {
  cooked: {
    label: "🍳 Cooked",
    bg: "#FEF3E2",
    c: "#B45309",
    ib: "linear-gradient(135deg,#FFF7ED,#FEE0B0)",
    e: "🍛",
  },
  raw: {
    label: "🥦 Vegetables",
    bg: "#DCFCE7",
    c: "#15803D",
    ib: "linear-gradient(135deg,#F0FDF4,#BBF7D0)",
    e: "🥦",
  },
  bakery: {
    label: "🥖 Bakery",
    bg: "#FEF9C3",
    c: "#A16207",
    ib: "linear-gradient(135deg,#FEFCE8,#FDE68A)",
    e: "🥖",
  },
  dairy: {
    label: "🥛 Dairy",
    bg: "#EDE9FE",
    c: "#7C3AED",
    ib: "linear-gradient(135deg,#F5F3FF,#DDD6FE)",
    e: "🥛",
  },
  packaged: {
    label: "📦 Packaged",
    bg: "#DBEAFE",
    c: "#1D4ED8",
    ib: "linear-gradient(135deg,#EFF6FF,#BFDBFE)",
    e: "📦",
  },
  other: {
    label: "🍽️ Other",
    bg: "#F4F4F0",
    c: "#4A4A46",
    ib: "linear-gradient(135deg,#FAFAF8,#E8E8E4)",
    e: "🍽️",
  },
};

const statusStyle = {
  Claimed: {
    bg: "#DCFCE7",
    c: "#15803D",
    dot: "#22C55E",
  },
};

function getHrs(d) {
  return d ? Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60)) : null;
}
function getChip(h) {
  if (h === null) return null;
  if (h <= 0) return { label: "Expired", bg: "#F3F4F6", color: "#6B7280" };
  if (h <= 4)
    return { label: `⚡ ${h}h left`, bg: "#FEE2E2", color: "#DC2626" };
  if (h <= 12)
    return { label: `⏰ ${h}h left`, bg: "#FEF9C3", color: "#A16207" };
  return { label: `✅ ${h}h left`, bg: "#DBEAFE", color: "#1D4ED8" };
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtId(id) {
  return "#" + id.toUpperCase().slice(-6);
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function NGODashboard() {
  const [tab, setTab] = useState("browse");
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState({});
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const [histSearch, setHistSearch] = useState("");
  const [histStatus, setHistStatus] = useState("all");
  const [history, setHistory] = useState([]);
  const [filteredHist, setFilteredHist] = useState([]);
  const [histSort, setHistSort] = useState("newest");

  // fetching the donation data
  useEffect(() => {
    const fetchFood = async () => {
      try {
        setLoading(true);

        const { data } = await API.get("/food");

        setListings(data);
        setFiltered(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, []);

  // fetching histroy
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await API.get("/food/requests/my-history");

        setHistory(data);
        setFilteredHist(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    let r = listings;
    if (catFilter !== "all")
      r = r.filter((f) => (f.category || f.cat) === catFilter);
    if (search)
      r = r.filter(
        (f) =>
          (f.foodName || "").toLowerCase().includes(search.toLowerCase()) ||
          (f.pickupAddress || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (f.donor?.name || "").toLowerCase().includes(search.toLowerCase()),
      );
    if (dateFilter) {
      const sel = new Date(dateFilter);
      sel.setHours(0, 0, 0, 0);
      const selEnd = new Date(sel);
      selEnd.setDate(selEnd.getDate() + 1);
      r = r.filter((f) => {
        const exp = new Date(f.expiryDate);
        return exp >= sel && exp < selEnd;
      });
    }
    setFiltered(r);
  }, [search, catFilter, dateFilter, listings]);

  useEffect(() => {
    let r = [...history];
    if (histStatus !== "all") r = r.filter((h) => h.status === histStatus);
    if (histSearch)
      r = r.filter(
        (h) =>
          h.foodName.toLowerCase().includes(histSearch.toLowerCase()) ||
          h.donor?.name.toLowerCase().includes(histSearch.toLowerCase()),
      );
    r.sort((a, b) =>
      histSort === "newest"
        ? new Date(b.updatedAt) - new Date(a.updatedAt)
        : new Date(a.updatedAt) - new Date(b.updatedAt),
    );
    setFilteredHist(r);
  }, [histSearch, histStatus, history, histSort]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleRequest = async (food) => {
    if (!food?._id) return;

    try {
      // 1. Post to your requests endpoint which changes status to "Claimed" & creates the PickupRequest
      await API.post("/food/requests", {
        foodId: food._id,
      });

      // 2. Remove the food item from listings so it disappears from the Browse view
      if (typeof setListings === "function") {
        setListings((prev) => prev.filter((f) => f._id !== food._id));
      }

      // 3. Mark this item ID as requested locally to toggle button text if cached
      if (typeof setRequested === "function") {
        setRequested((prev) => ({
          ...prev,
          [food._id]: true,
        }));
      }

      // 4. Fetch updated NGO request track history
      if (typeof setHistory === "function") {
        const historyRes = await API.get("/food/requests/my-history");
        setHistory(historyRes.data);
      }

      // 5. Close any active display modals safely
      if (typeof setModal === "function") {
        setModal(null);
      }

      showToast(
        `Request sent to ${food.donor?.name || "donor"} successfully! ✓`,
        "success",
      );
    } catch (error) {
      console.error("Error creating pickup request:", error);
      showToast(
        error.response?.data?.message || "Failed to send pickup request.",
        "error",
      );
    }
  };

  const activeCount = filtered.length;
  const claimedCount = history.length;

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        background: "#F4F6FB",
        color: "#0F1C35",
        minHeight: "100vh",
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,800;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:0.6}}
        .au{animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) both}
        .d1{animation-delay:.04s}.d2{animation-delay:.1s}.d3{animation-delay:.16s}.d4{animation-delay:.22s}.d5{animation-delay:.28s}.d6{animation-delay:.34s}
        .skel{background:linear-gradient(90deg,#E8EEF8 25%,#D8E2F0 50%,#E8EEF8 75%);background-size:600px 100%;animation:shimmer 1.4s infinite;border-radius:10px}
        .food-card{background:white;border-radius:18px;overflow:hidden;border:1.5px solid #E2EAF4;transition:all 0.3s cubic-bezier(.34,1.56,.64,1);cursor:pointer;position:relative;min-width:0}
        .food-card:hover{transform:translateY(-8px);box-shadow:0 20px 50px rgba(27,58,107,0.15);border-color:#1B3A6B}
        .food-card:hover .femoji{transform:scale(1.12) rotate(5deg)}
        .femoji{transition:transform 0.3s ease;display:block;font-size:62px}
        .fpill{padding:8px 18px;border-radius:22px;font-size:13px;font-weight:600;border:1.5px solid #D8E2F0;background:white;color:#4A5568;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.22s ease}
        .fpill:hover{border-color:#1B3A6B;color:#1B3A6B;background:#EEF3FB}
        .fpill.active{background:linear-gradient(135deg,#1B3A6B,#2A52A0);color:white;border-color:#1B3A6B;box-shadow:0 4px 14px rgba(27,58,107,0.25)}
        .tab-btn{padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.22s ease}
        .tab-btn.active{background:linear-gradient(135deg,#1B3A6B,#2A52A0);color:white;box-shadow:0 4px 14px rgba(27,58,107,0.25)}
        .tab-btn:not(.active){background:none;color:#4A5568}
        .tab-btn:not(.active):hover{background:#EEF3FB;color:#1B3A6B}
        .hist-row:hover{background:#F4F6FB!important}
        .srch:focus-within{border-color:#1B3A6B!important;box-shadow:0 0 0 3px rgba(27,58,107,0.1)!important}
        .req-btn{background:linear-gradient(135deg,#1B3A6B,#2A52A0);color:white;border:none;padding:11px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;width:100%;transition:all 0.22s ease;box-shadow:0 3px 12px rgba(27,58,107,0.25)}
        .req-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(27,58,107,0.35)}
        .req-btn.sent{background:linear-gradient(135deg,#15803D,#16A34A)!important;cursor:default}
        .stat-card{background:white;border-radius:16px;padding:20px 22px;border:1.5px solid #E2EAF4;transition:all 0.25s ease}
        .stat-card:hover{border-color:#1B3A6B;transform:translateY(-3px);box-shadow:0 10px 30px rgba(27,58,107,0.12)}
        .modal-overlay{position:fixed;inset:0;background:rgba(10,20,50,0.6);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px)}
        .modal-box{background:white;border-radius:24px;width:100%;max-width:440px;overflow:hidden;box-shadow:0 28px 70px rgba(10,20,50,0.35);animation:fadeUp 0.28s cubic-bezier(.34,1.56,.64,1)}
        .toast-bar{position:fixed;bottom:28px;right:28px;z-index:300;background:linear-gradient(135deg,#0F1C35,#1B3A6B);color:white;padding:14px 22px;border-radius:14px;font-size:14px;font-weight:600;box-shadow:0 8px 28px rgba(10,20,50,0.35);animation:slideDown 0.3s ease;display:flex;align-items:center;gap:10px}
        select.fsel{padding:9px 14px;border-radius:10px;font-size:13px;font-weight:600;border:1.5px solid #D8E2F0;background:white;color:#4A5568;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;outline:none}
        select.fsel:focus{border-color:#1B3A6B}
        input[type="date"].fdate{padding:9px 14px;border-radius:10px;font-size:13px;font-weight:600;border:1.5px solid #D8E2F0;background:white;color:#0F1C35;font-family:'Plus Jakarta Sans',sans-serif;outline:none}
        input[type="date"].fdate:focus{border-color:#1B3A6B;box-shadow:0 0 0 3px rgba(27,58,107,0.1)}
        .page-wrapper{padding:32px 32px 64px}
        .stats-grid{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
        .tab-container{display:flex;align-items:center;gap:6px;flex-wrap:wrap;width:100%;}
        .filter-panel{display:flex;flex-direction:column;gap:14px}
        .history-mobile{display:none}
        .history-table{display:block}
        .history-table-wrapper{overflow-x:auto}
        .history-table-inner{min-width:900px}
        @media (max-width: 1024px) {
          .page-wrapper{padding:24px 20px 48px}
          .tab-btn{flex:1 1 auto;min-width:140px}
          .fpill{padding:8px 14px;font-size:12px}
        }
        @media (max-width: 768px) {
          .page-wrapper{padding:20px 16px 40px}
          .filter-panel{padding:0}
          .page-header h1{font-size:28px}
          .page-header p{font-size:14px}
          .tab-btn{min-width:0}
          .fpill{font-size:12px;padding:7px 12px}
          .food-card{min-width:0}
          .history-mobile{display:block;padding-bottom:8px}
          .history-mobile > div{padding:16px;margin-bottom:16px}
          .history-mobile > div:last-child{margin-bottom:0}
          .history-table{display:none}
          .history-table-wrapper{display:none}
        }
        @media (max-width: 640px) {
          .page-wrapper{padding:18px 12px 32px}
          .tab-btn{padding:10px 14px;font-size:13px}
          .fpill{padding:7px 10px;font-size:11px}
          .filter-panel{gap:12px}
          .history-mobile{margin-bottom:16px}
          .history-mobile > div{padding:14px}
        }
      `}</style>

      {/* ── NAV ── */}
      <Navbar />

      <div className="page-wrapper"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        {/* ── PAGE HEADER ── */}
        <div className="au d1 page-header" style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: "Fraunces,serif",
              fontSize: 36,
              fontWeight: 800,
              color: "#0F1C35",
              marginBottom: 6,
              lineHeight: 1.1,
            }}
          >
            Welcome back, Noor Foundation 👋
          </h1>
          <p style={{ fontSize: 15, color: "#6B7280" }}>
            Browse available food donations, request pickups, and track your
            claim history.
          </p>
        </div>

        {/* ── STAT CARDS ── */}
        <div
          className="au d2 stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            {
              icon: "🍱",
              num: activeCount,
              label: "Available now",
              bg: "linear-gradient(135deg,#EEF3FB,#DBEAFE)",
              dot: "#1B3A6B",
            },
            {
              icon: "✅",
              num: claimedCount,
              label: "Successful claims",
              bg: "linear-gradient(135deg,#F0FDF4,#DCFCE7)",
              dot: "#15803D",
            },
            {
              icon: "📋",
              num: history.length,
              label: "Total requests",
              bg: "linear-gradient(135deg,#F5F3FF,#EDE9FE)",
              dot: "#7C3AED",
            },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    background: s.bg,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    background: s.dot,
                    borderRadius: "50%",
                    animation: "pulseDot 2.5s infinite",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: 30,
                  fontWeight: 800,
                  color: "#0F1C35",
                }}
              >
                {s.num}
              </div>
              <div style={{ fontSize: 12, color: "#8A96A8", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div
          className="au d2 tab-container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "white",
            padding: 6,
            borderRadius: 14,
            border: "1.5px solid #E2EAF4",
            width: "100%",
            marginBottom: 28,
          }}
        >
          <button
            className={`tab-btn ${tab === "browse" ? "active" : ""}`}
            onClick={() => setTab("browse")}
          >
            🍱 Browse Donations
          </button>
          <button
            className={`tab-btn ${tab === "history" ? "active" : ""}`}
            onClick={() => setTab("history")}
          >
            📋 History & Reports
          </button>
        </div>

        {/* ════════════════════ BROWSE TAB ════════════════════ */}
        {tab === "browse" && (
          <>
            {/* Filter bar */}
            <div
              className="au d3 filter-panel"
              style={{
                background: "white",
                borderRadius: 16,
                padding: "18px 20px",
                border: "1.5px solid #E2EAF4",
                marginBottom: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {/* Search */}
                <div
                  className="srch"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    background: "#F4F6FB",
                    border: "1.5px solid #E2EAF4",
                    borderRadius: 10,
                    padding: "9px 14px",
                    flex: 1,
                    minWidth: 220,
                    maxWidth: 320,
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: 15 }}>🔍</span>
                  <input
                    placeholder="Food name, location, donor…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      fontFamily: "inherit",
                      fontSize: 13,
                      color: "#0F1C35",
                      background: "transparent",
                      width: "100%",
                    }}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#8A96A8",
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                {/* Date */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    background: "#F4F6FB",
                    border: "1.5px solid #E2EAF4",
                    borderRadius: 10,
                    padding: "6px 12px",
                  }}
                >
                  <span style={{ fontSize: 14 }}>📅</span>
                  <input
                    type="date"
                    className="fdate"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      padding: 0,
                    }}
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter("")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#8A96A8",
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span
                  style={{ fontSize: 12, color: "#8A96A8", marginLeft: "auto" }}
                >
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  {search || catFilter !== "all" || dateFilter
                    ? " (filtered)"
                    : ""}
                </span>
              </div>
              {/* Category pills */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  ["all", "All"],
                  ["cooked", "🍳 Cooked"],
                  ["raw", "🥦 Vegetables"],
                  ["bakery", "🥖 Bakery"],
                  ["dairy", "🥛 Dairy"],
                  ["packaged", "📦 Packaged"],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    className={`fpill ${catFilter === v ? "active" : ""}`}
                    onClick={() => setCatFilter(v)}
                  >
                    {l}
                  </button>
                ))}
                {(search || catFilter !== "all" || dateFilter) && (
                  <button
                    className="fpill"
                    style={{
                      color: "#DC2626",
                      borderColor: "#FCA5A5",
                      background: "#FEF2F2",
                    }}
                    onClick={() => {
                      setSearch("");
                      setCatFilter("all");
                      setDateFilter("");
                    }}
                  >
                    ✕ Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                  gap: 20,
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: "white",
                      borderRadius: 18,
                      overflow: "hidden",
                      border: "1.5px solid #E2EAF4",
                    }}
                  >
                    <div
                      className="skel"
                      style={{ height: 148, borderRadius: 0 }}
                    />
                    <div style={{ padding: 16 }}>
                      <div
                        className="skel"
                        style={{ height: 16, width: "65%", marginBottom: 10 }}
                      />
                      <div
                        className="skel"
                        style={{ height: 13, width: "85%", marginBottom: 8 }}
                      />
                      <div
                        className="skel"
                        style={{ height: 13, width: "50%", marginBottom: 14 }}
                      />
                      <div className="skel" style={{ height: 40 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 20px",
                  background: "white",
                  borderRadius: 20,
                  border: "1.5px solid #E2EAF4",
                }}
              >
                <div style={{ fontSize: 52, marginBottom: 14 }}>🔍</div>
                <p
                  style={{
                    fontFamily: "Fraunces,serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#4A5568",
                    marginBottom: 6,
                  }}
                >
                  No donations found
                </p>
                <p style={{ fontSize: 14, color: "#8A96A8", marginBottom: 20 }}>
                  Try adjusting your search or filters
                </p>
                <button
                  className="fpill active"
                  onClick={() => {
                    setSearch("");
                    setCatFilter("all");
                    setDateFilter("");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div
                className="browse-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                  gap: 20,
                }}
              >
                {filtered.map((food, i) => {
                  const cf = cat[food.category] || cat.other;
                  const qty =
                    `${food.quantity || ""} ${food.unit || ""}`.trim();
                  const hrs = getHrs(food.expiryDate);
                  const chip = getChip(hrs);
                  const done = !!requested[food._id];
                  return (
                    <div
                      key={food._id}
                      className={`food-card au d${Math.min(i + 1, 6)}`}
                      onClick={() => setModal(food)}
                    >
                      <div
                        style={{
                          height: 148,
                          background: cf.ib,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        <span className="femoji">{cf.e}</span>
                        <div
                          style={{ position: "absolute", top: 10, right: 10 }}
                        >
                          <span
                            style={{
                              background: cf.bg,
                              color: cf.c,
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: 18,
                            }}
                          >
                            {cf.label}
                          </span>
                        </div>
                        {done && (
                          <div
                            style={{
                              position: "absolute",
                              top: 10,
                              left: 10,
                              background:
                                "linear-gradient(135deg,#15803D,#16A34A)",
                              color: "white",
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: 18,
                            }}
                          >
                            ✓ Requested
                          </div>
                        )}
                      </div>
                      <div style={{ padding: 16 }}>
                        <h3
                          style={{
                            fontFamily: "Fraunces,serif",
                            fontSize: 17,
                            fontWeight: 700,
                            color: "#0F1C35",
                            marginBottom: 8,
                            lineHeight: 1.2,
                          }}
                        >
                          {food.foodName}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                            marginBottom: 10,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 13,
                              color: "#4A5568",
                            }}
                          >
                            <span>📦</span>
                            <strong style={{ color: "#0F1C35" }}>{qty}</strong>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 13,
                              color: "#4A5568",
                            }}
                          >
                            <span>📍</span>
                            {food.pickupAddress}
                          </div>
                          {chip && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "3px 9px",
                                borderRadius: 6,
                                background: chip.bg,
                                color: chip.color,
                                width: "fit-content",
                              }}
                            >
                              {chip.label}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            paddingTop: 10,
                            borderTop: "1px solid #EEF3FB",
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              background:
                                "linear-gradient(135deg,#1B3A6B,#2A52A0)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 800,
                              color: "white",
                              flexShrink: 0,
                            }}
                          >
                            {(food.donor?.name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#0F1C35",
                              }}
                            >
                              {food.donor?.name || "Anonymous"}
                            </div>
                            <div style={{ fontSize: 11, color: "#8A96A8" }}>
                              ✓ Verified donor
                            </div>
                          </div>
                        </div>
                        <button
                          className={`req-btn${done ? " sent" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!done) handleRequest(food); // Fires the operation directly on click
                          }}
                          disabled={done}
                        >
                          {done ? "✓ Request Sent" : "🚀 Request Pickup"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ════════════════════ HISTORY TAB ════════════════════ */}
        {tab === "history" && (
          <div className="au d3">
            <div style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#0F1C35",
                  marginBottom: 4,
                }}
              >
                Donation History & Reports
              </h2>
              <p style={{ fontSize: 14, color: "#6B7280" }}>
                All pickup requests and claims in one place.
              </p>
            </div>

            {/* History filters */}
            <div
              style={{
                background: "white",
                borderRadius: 14,
                padding: "14px 18px",
                border: "1.5px solid #E2EAF4",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div
                className="srch"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#F4F6FB",
                  border: "1.5px solid #E2EAF4",
                  borderRadius: 9,
                  padding: "8px 13px",
                  flex: 1,
                  minWidth: 200,
                  maxWidth: 280,
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 14 }}>🔍</span>
                <input
                  placeholder="Search history…"
                  value={histSearch}
                  onChange={(e) => setHistSearch(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    fontFamily: "inherit",
                    fontSize: 13,
                    color: "#0F1C35",
                    background: "transparent",
                    width: "100%",
                  }}
                />
              </div>
              <select
                className="fsel"
                value={histStatus}
                onChange={(e) => setHistStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Claimed">✅ Claimed</option>
              </select>
              <select
                className="fsel"
                value={histSort}
                onChange={(e) => setHistSort(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <span
                style={{ fontSize: 12, color: "#8A96A8", marginLeft: "auto" }}
              >
                {filteredHist.length} record
                {filteredHist.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Table */}
            {filteredHist.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "70px 20px",
                  background: "white",
                  borderRadius: 18,
                  border: "1.5px solid #E2EAF4",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <p
                  style={{
                    fontFamily: "Fraunces,serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#4A5568",
                    marginBottom: 6,
                  }}
                >
                  No records found
                </p>
                <p style={{ fontSize: 13, color: "#8A96A8" }}>
                  Your claimed and requested donations will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="history-mobile" style={{ marginBottom: 20 }}>
                  {filteredHist.map((row) => {
                    const cf = cat[row.category] || cat.other;
                    const expChip = getChip(getHrs(row.expiryDate));
                    return (
                      <div
                        key={row._id}
                        style={{
                          background: "white",
                          borderRadius: 20,
                          border: "1.5px solid #E2EAF4",
                          padding: 16,
                          marginBottom: 16,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1C35", marginBottom: 6 }}>
                              {row.foodName}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", color: "#4A5568", fontSize: 12 }}>
                              <span>{cf.e}</span>
                              <span>{cf.label}</span>
                              <span>{fmtId(row._id)}</span>
                            </div>
                          </div>
                          <div style={{ minWidth: 90 }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#0F1C35",
                              }}
                            >
                              {row.quantity} {row.unit}
                            </span>
                            <div style={{ fontSize: 11, color: "#8A96A8" }}>{fmtDate(row.expiryDate)}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 10,
                                background: "linear-gradient(135deg,#1B3A6B,#2A52A0)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: 800,
                                color: "white",
                              }}
                            >
                              {row.donor?.name?.charAt(0) || "A"}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#0F1C35" }}>
                              {row.donor?.name || "Anonymous"}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: expChip?.color || "#6B7280",
                              background: expChip?.bg || "#F3F4F6",
                              borderRadius: 999,
                              padding: "4px 10px",
                            }}
                          >
                            {expChip?.label || "No expiry"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="history-table-wrapper">
                  <div className="history-table"
                    style={{
                      background: "white",
                      borderRadius: 18,
                      border: "1.5px solid #E2EAF4",
                      overflow: "hidden",
                    }}
                  >
                {/* Head */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "96px 1fr 96px 160px 124px 100px 124px",
                    background: "linear-gradient(135deg,#0F1C35,#1B3A6B)",
                    padding: "13px 20px",
                    gap: 0,
                  }}
                >
                  {[
                    "ID",
                    "Title / Category",
                    "Qty",
                    "Donor Name",
                    "Expiry Date",
                    "Status",
                    "Last Updated",
                  ].map((h) => (
                    <div
                      key={h}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.65)",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      {h}
                    </div>
                  ))}
                </div>

                {/* Body rows */}
                {filteredHist.map((row, i) => {
                  const cf = cat[row.category] || cat.other;
                  const expChip = getChip(getHrs(row.expiryDate));
                  return (
                    <div
                      key={row._id}
                      className="hist-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "96px 1fr 96px 160px 124px 100px 124px",
                        gap: 0,
                        padding: "14px 20px",
                        borderBottom:
                          i < filteredHist.length - 1
                            ? "1px solid #F0F4FA"
                            : "none",
                        background: i % 2 === 0 ? "white" : "#FAFBFD",
                        transition: "background 0.18s",
                      }}
                    >
                      {/* ID */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#8A96A8",
                            background: "#F0F4FA",
                            padding: "2px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {fmtId(row._id)}
                        </span>
                      </div>
                      {/* Title */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{cf.e}</span>
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#0F1C35",
                            }}
                          >
                            {row.foodName}
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              background: cf.bg,
                              color: cf.c,
                              padding: "1px 7px",
                              borderRadius: 5,
                            }}
                          >
                            {cf.label}
                          </span>
                        </div>
                      </div>
                      {/* Qty */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0F1C35",
                          }}
                        >
                          {row.quantity}{" "}
                          <span
                            style={{
                              color: "#8A96A8",
                              fontWeight: 400,
                              fontSize: 12,
                            }}
                          >
                            {row.unit}
                          </span>
                        </span>
                      </div>
                      {/* Donor */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 7,
                            background:
                              "linear-gradient(135deg,#1B3A6B,#2A52A0)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 800,
                            color: "white",
                            flexShrink: 0,
                          }}
                        >
                          {(row.donor?.name || "A").charAt(0)}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0F1C35",
                          }}
                        >
                          {row.donor?.name || "Anonymous"}
                        </span>
                      </div>
                      {/* Expiry */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          gap: 2,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#0F1C35",
                          }}
                        >
                          {fmtDate(row.expiryDate)}
                        </div>
                        {expChip && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: expChip.color,
                            }}
                          >
                            {expChip.label}
                          </span>
                        )}
                      </div>
                      {/* Status */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {row.status}
                      </div>
                      {/* Updated */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#8A96A8" }}>
                          {fmtDate(row.updatedAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Footer summary */}
                <div
                  style={{
                    background: "#F4F6FB",
                    padding: "12px 20px",
                    borderTop: "1px solid #E2EAF4",
                    display: "flex",
                    gap: 22,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { label: "Total", val: history.length, c: "#0F1C35" },
                    {
                      label: "Claimed",
                      val: history.filter((h) => h.status === "Claimed").length,
                      c: "#15803D",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span style={{ fontSize: 12, color: "#8A96A8" }}>
                        {s.label}:
                      </span>
                      <span
                        style={{ fontSize: 13, fontWeight: 800, color: s.c }}
                      >
                        {s.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
            )}
          </div>
        )}
      </div>

      {/* ── PICKUP MODAL ── */}
      {modal &&
        (() => {
          const cf = cat[modal.category] || cat.other;
          const chip = getChip(getHrs(modal.expiryDate));
          const done = !!requested[modal._id];
          return (
            <div
              className="modal-overlay"
              onClick={(e) => {
                if (e.target === e.currentTarget) setModal(null);
              }}
            >
              <div className="modal-box">
                <div
                  style={{
                    background: "linear-gradient(135deg,#0F1C35,#1B3A6B)",
                    padding: "22px 24px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle,rgba(212,160,23,0.2),transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />
                  <h3
                    style={{
                      fontFamily: "Fraunces,serif",
                      fontSize: 22,
                      fontWeight: 800,
                      color: "white",
                      marginBottom: 4,
                    }}
                  >
                    Request Pickup
                  </h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    Send a pickup request to the donor
                  </p>
                </div>
                <div style={{ padding: 24 }}>
                  {/* Food info */}
                  <div
                    style={{
                      background: cf.ib,
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 18,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      border: `1px solid ${cf.bg}`,
                    }}
                  >
                    <span style={{ fontSize: 36 }}>{cf.e}</span>
                    <div>
                      <div
                        style={{
                          fontFamily: "Fraunces,serif",
                          fontSize: 16,
                          fontWeight: 800,
                          color: "#0F1C35",
                        }}
                      >
                        {modal.foodName}
                      </div>
                      <div
                        style={{ fontSize: 13, color: "#4A5568", marginTop: 3 }}
                      >
                        📦 {modal.quantity} {modal.unit} · 📍{" "}
                        {modal.pickupAddress}
                      </div>
                      {chip && (
                        <span
                          style={{
                            display: "inline-flex",
                            marginTop: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: chip.bg,
                            color: chip.color,
                          }}
                        >
                          {chip.label}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Donor */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      background: "#F4F6FB",
                      borderRadius: 12,
                      marginBottom: 18,
                      border: "1px solid #E2EAF4",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "linear-gradient(135deg,#1B3A6B,#2A52A0)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 15,
                        fontWeight: 800,
                        color: "white",
                      }}
                    >
                      {(modal.donor?.name || "A").charAt(0)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0F1C35",
                        }}
                      >
                        {modal.donor?.name || "Anonymous"}
                      </div>
                      <div style={{ fontSize: 11, color: "#8A96A8" }}>
                        ✓ Verified donor · Request sent directly to them
                      </div>
                    </div>
                  </div>
                  {/* Info */}
                  <div
                    style={{
                      background: "linear-gradient(135deg,#FFFBEB,#FEF3C7)",
                      border: "1px solid #FDE68A",
                      borderRadius: 11,
                      padding: "11px 14px",
                      fontSize: 12,
                      color: "#A16207",
                      marginBottom: 20,
                      lineHeight: 1.6,
                    }}
                  >
                    🔔 <strong>How it works:</strong> Your request is sent to
                    the donor instantly. They'll confirm and you'll be notified
                    when approved.
                  </div>
                  {/* Buttons */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => handleRequest(modal)}
                      disabled={done}
                      style={{
                        flex: 1,
                        background: done
                          ? "linear-gradient(135deg,#15803D,#16A34A)"
                          : "linear-gradient(135deg,#D4A017,#F0C040)",
                        color: done ? "white" : "#0F1C35",
                        border: "none",
                        padding: 13,
                        borderRadius: 11,
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: done ? "default" : "pointer",
                        fontFamily: "inherit",
                        boxShadow: `0 4px 16px ${done ? "rgba(21,128,61,0.3)" : "rgba(212,160,23,0.4)"}`,
                        transition: "all 0.2s",
                      }}
                    >
                      {done
                        ? "✓ Already Requested"
                        : "🚀 Confirm Request Pickup"}
                    </button>
                    <button
                      onClick={() => setModal(null)}
                      style={{
                        background: "#F4F6FB",
                        color: "#4A5568",
                        border: "1.5px solid #D8E2F0",
                        padding: "13px 18px",
                        borderRadius: 11,
                        fontSize: 14,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#E8EEF8";
                        e.currentTarget.style.color = "#1B3A6B";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#F4F6FB";
                        e.currentTarget.style.color = "#4A5568";
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ── TOAST ── */}
      {toast && (
        <div className="toast-bar">
          <span style={{ fontSize: 18 }}>✅</span>
          {toast}
        </div>
      )}
    </div>
  );
}
