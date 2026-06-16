import React, { useState, useEffect } from "react";
import API from "../../utils/api"; // Your custom Axios wrapper instance
import Navbar from "../../components/Navbar";

const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── Driver selector modal ─────────────────────────────────────────────────────
function DriverModal({ drivers, onSelect, onClose }) {
  const [search, setSearch] = useState("");

  // Clean, syntactically correct filter logic
  const filtered = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.vehicleNo.toLowerCase().includes(search.toLowerCase());

    const isAvailable = d.isAvailable !== false;

    return matchesSearch && isAvailable;
  });

  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={(e) => e.stopPropagation()}>
        <div style={m.modalHeader}>
          <h3 style={m.modalTitle}>Select an Available Driver</h3>
          <button onClick={onClose} style={m.closeBtn}>
            ✕
          </button>
        </div>

        <input
          autoFocus
          placeholder="Search by name or vehicle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={m.searchInput}
        />

        <div style={m.driverList}>
          {filtered.length === 0 ? (
            <p style={m.noResult}>No available drivers found.</p>
          ) : (
            filtered.map((d) => (
              <button
                key={d._id}
                style={m.driverRow}
                onClick={() => onSelect(d)}
              >
                <div style={m.driverAvatar}>{d.name[0].toUpperCase()}</div>
                <div style={m.driverInfo}>
                  <span style={m.driverRowName}>{d.name}</span>
                  <span style={m.driverRowSub}>
                    {d.phone} &nbsp;·&nbsp; {d.vehicleNo}
                  </span>
                </div>
                <span style={m.selectTag}>Select</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AssignPickups() {
  const [donations, setDonations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state tracking
  const [activeModal, setActiveModal] = useState(null); // stores donationId
  const [selected, setSelected] = useState({}); // { donationId: driverObj }
  const [assigning, setAssigning] = useState({}); // { donationId: boolean }
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Swapped out old endpoint for the confirmed/accepted pickup requests endpoint
      const [donRes, drRes] = await Promise.all([
        API.get("/donations/confirmed", { headers: authHeader() }), // Make sure this hits your new router path
        API.get("/drivers", { headers: authHeader() }),
      ]);
      setDonations(donRes.data);
      setDrivers(drRes.data);
    } catch (err) {
      showToast("Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDriverSelect = (driver) => {
    setSelected((prev) => ({ ...prev, [activeModal]: driver }));
    setActiveModal(null);
  };

  const handleAssign = async (donationId) => {
    const driver = selected[donationId];
    if (!driver) {
      showToast("Please select a driver first.", "error");
      return;
    }

    setAssigning((prev) => ({ ...prev, [donationId]: true }));
    try {
      await API.patch(
        `/donations/${donationId}/assign-driver`,
        { driverId: driver._id },
        { headers: authHeader() },
      );

      showToast(`Driver "${driver.name}" assigned successfully!`);

      // Cleanly remove the newly assigned item from view
      setDonations((prev) => prev.filter((d) => d._id !== donationId));
      setSelected((prev) => {
        const updated = { ...prev };
        delete updated[donationId];
        return updated;
      });
    } catch (err) {
      showToast(err.response?.data?.message || "Assignment failed.", "error");
    } finally {
      setAssigning((prev) => ({ ...prev, [donationId]: false }));
    }
  };

  return (
     <div style={{minHeight:'100vh',background:'#F4F6FB',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
        
       <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
             <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.au{animation:fadeUp 0.5s ease both;opacity:0}.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.rcard{background:white;border-radius:18px;border:1px solid #D8E2F0;padding:24px;transition:all 0.3s ease;position:relative;overflow:hidden}.rcard::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(135deg,#D4A017,#F0C040);border-radius:18px 0 0 18px}.rcard:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(27,58,107,0.1);border-color:#D4A017}`}</style>
             <Navbar/>

    <div style={s.page}>
      {toast && (
        <div
          style={{
            ...s.toast,
            ...(toast.type === "error" ? s.toastError : s.toastSuccess),
          }}
        >
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {activeModal && (
        <DriverModal
          drivers={drivers}
          onSelect={handleDriverSelect}
          onClose={() => setActiveModal(null)}
        />
      )}

      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>🚀 Confirm Request Pickups</h1>
          <p style={s.pageSub}>
            Assign drivers to confirmed donation pickup requests
          </p>
        </div>
        <button onClick={fetchData} style={s.refreshBtn}>
          ↻ Refresh Data
        </button>
      </div>

      <div style={s.statsRow}>
        <StatCard
          label="Pending Assignments"
          value={donations.length}
          color="#fb923c"
        />
        <StatCard
          label="Total Drivers Available"
          value={drivers.filter((d) => d.isAvailable !== false).length}
          color="#4ade80"
        />
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardIcon}>📦</span>
          <div>
            <h2 style={s.cardTitle}>Donation Pickup Requests</h2>
            <p style={s.cardSub}>
              {donations.length} request(s) awaiting driver assignment
            </p>
          </div>
        </div>

        {loading ? (
          <div style={s.loadingState}>Loading pickups…</div>
        ) : donations.length === 0 ? (
          <div style={s.emptyState}>
            <span style={{ fontSize: 42 }}>🎉</span>
            <p style={s.emptyText}>
              All pickups are assigned! No pending requests.
            </p>
          </div>
        ) : (
          <div style={s.tableWrapper}>
            <table style={s.table}>
              <thead>
                <tr>
                  {[
                    "Donation Title",
                    "Pickup Address",
                    "Driver Assigned",
                    "Action",
                  ].map((h) => (
                    <th key={h} style={s.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {donations.map((don, i) => {
                  const picked = selected[don._id];
                  const busy = assigning[don._id];

                  // Safe Fallbacks: Check if backend sends flattened data or nested schema data
                  const donationTitle =
                    don.title || don.listing?.title || "Food Donation";
                  const pickupLocation =
                    don.pickupAddress || don.listing?.pickupAddress || "N/A";

                  return (
                    <tr
                      key={don._id}
                      style={i % 2 === 0 ? s.rowEven : s.rowOdd}
                    >
                      <td style={s.td}>
                        <span style={s.donationTitle}>{donationTitle}</span>
                      </td>
                      <td style={s.td}>
                        <span style={s.address}>📍 {pickupLocation}</span>
                      </td>
                      <td style={s.td}>
                        {picked ? (
                          <div style={s.assignedDriver}>
                            <div style={s.driverAvatar}>
                              {picked.name[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={s.assignedName}>{picked.name}</div>
                              <div style={s.assignedSub}>
                                {picked.vehicleNo} · {picked.phone}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span style={s.unassignedBadge}>Not Selected</span>
                        )}
                      </td>
                      <td style={s.td}>
                        <div style={s.actionGroup}>
                          <button
                            style={s.selectBtn}
                            onClick={() => setActiveModal(don._id)}
                          >
                            🔍 Select Driver
                          </button>
                          <button
                            style={{
                              ...s.assignBtn,
                              opacity: !picked || busy ? 0.5 : 1,
                              cursor:
                                !picked || busy ? "not-allowed" : "pointer",
                            }}
                            onClick={() => handleAssign(don._id)}
                            disabled={!picked || busy}
                          >
                            {busy ? "Assigning…" : "✅ Confirm Assignment"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={s.statCard}>
      <span style={{ ...s.statValue, color }}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    padding: "32px 24px 60px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: "#f1f5f9",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 12,
  },
  pageTitle: { fontSize: 24, fontWeight: 700, margin: 0, color: "#f8fafc" },
  pageSub: { margin: "6px 0 0", color: "#64748b", fontSize: 14 },
  refreshBtn: {
    background: "rgba(56,189,248,0.1)",
    border: "1px solid rgba(56,189,248,0.25)",
    color: "#38bdf8",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  statsRow: { display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" },
  statCard: {
    flex: "1 1 150px",
    background: "#1e293b",
    borderRadius: 12,
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    border: "1px solid #334155",
  },
  statValue: { fontSize: 28, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: 500 },
  card: {
    background: "#1e293b",
    borderRadius: 16,
    border: "1px solid #334155",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "20px 24px",
    borderBottom: "1px solid #334155",
    background: "#162032",
  },
  cardIcon: { fontSize: 26 },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "#f8fafc" },
  cardSub: { margin: "2px 0 0", fontSize: 12, color: "#64748b" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    color: "#64748b",
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    borderBottom: "1px solid #334155",
    whiteSpace: "nowrap",
  },
  td: { padding: "14px 16px", color: "#cbd5e1", verticalAlign: "middle" },
  rowEven: { background: "transparent" },
  rowOdd: { background: "rgba(255,255,255,0.02)" },
  donationTitle: { color: "#f1f5f9", fontWeight: 600, fontSize: 14 },
  address: { color: "#94a3b8", fontSize: 13 },
  assignedDriver: { display: "flex", alignItems: "center", gap: 10 },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
  },
  assignedName: { color: "#f1f5f9", fontWeight: 600, fontSize: 13 },
  assignedSub: { color: "#64748b", fontSize: 11, marginTop: 2 },
  unassignedBadge: {
    background: "rgba(100,116,139,0.12)",
    color: "#64748b",
    border: "1px solid #334155",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 600,
  },
  actionGroup: { display: "flex", gap: 8, flexWrap: "wrap" },
  selectBtn: {
    padding: "7px 14px",
    background: "rgba(56,189,248,0.10)",
    border: "1px solid rgba(56,189,248,0.28)",
    color: "#38bdf8",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  assignBtn: {
    padding: "7px 14px",
    background: "linear-gradient(135deg,#10b981,#059669)",
    border: "none",
    color: "#fff",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
    transition: "opacity 0.2s",
  },
  emptyState: { textAlign: "center", padding: "56px 24px", color: "#475569" },
  emptyText: { margin: "14px 0 0", fontSize: 14 },
  loadingState: {
    textAlign: "center",
    padding: 40,
    color: "#475569",
    fontSize: 14,
  },
  toast: {
    position: "fixed",
    top: 20,
    right: 24,
    zIndex: 9999,
    padding: "12px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
  toastSuccess: {
    background: "rgba(16,185,129,0.18)",
    border: "1px solid rgba(16,185,129,0.4)",
    color: "#6ee7b7",
  },
  toastError: {
    background: "rgba(239,68,68,0.18)",
    border: "1px solid rgba(239,68,68,0.4)",
    color: "#fca5a5",
  },
};

const m = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 24,
  },
  modal: {
    background: "#1e293b",
    borderRadius: 16,
    border: "1px solid #334155",
    width: "100%",
    maxWidth: 440,
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    borderBottom: "1px solid #334155",
  },
  modalTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: "#f8fafc" },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: 16,
    cursor: "pointer",
  },
  searchInput: {
    margin: "12px 16px",
    padding: "10px 14px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 8,
    color: "#f1f5f9",
    fontSize: 13,
    outline: "none",
  },
  driverList: { overflowY: "auto", padding: "0 8px 12px" },
  driverRow: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
    color: "#f1f5f9",
    transition: "background 0.15s",
    marginBottom: 4,
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  driverInfo: { flex: 1 },
  driverRowName: { fontWeight: 600, fontSize: 14, color: "#f8fafc" },
  driverRowSub: {
    fontSize: 11,
    color: "#64748b",
    display: "block",
    marginTop: 2,
  },
  selectTag: {
    fontSize: 11,
    fontWeight: 700,
    color: "#38bdf8",
    background: "rgba(56,189,248,0.10)",
    border: "1px solid rgba(56,189,248,0.25)",
    borderRadius: 6,
    padding: "3px 8px",
  },
  noResult: {
    textAlign: "center",
    color: "#475569",
    fontSize: 13,
    padding: 20,
  },
};
