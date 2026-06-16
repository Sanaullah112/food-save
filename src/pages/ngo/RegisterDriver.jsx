import React, { useState, useEffect } from "react";
import API from "../../utils/api"; // Your custom Axios instance wrapper
import Navbar from "../../components/Navbar";
import Swal from "sweetalert2"; // Imported SweetAlert2

// ─── Reusable helpers ─────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── Sub-component: Register Form ─────────────────────────────────────────────
function RegisterForm({ onSuccess }) {
  const [form, setForm] = useState({ name: "", phone: "", vehicleNo: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.vehicleNo.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "All fields are required.",
        confirmButtonColor: "#D4A017",
      });
      return;
    }

    setLoading(true);
    try {
      await API.post("/drivers", form, { headers: authHeader() });
      
      Swal.fire({
        icon: "success",
        title: "Registered!",
        text: "Driver registered successfully!",
        confirmButtonColor: "#4ade80",
      });

      setForm({ name: "", phone: "", vehicleNo: "" });
      onSuccess?.();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.response?.data?.message || "Failed to register driver.",
        confirmButtonColor: "#fb923c",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.card}>
      <div className="cardHeader" style={s.cardHeader}>
        <span style={s.cardIcon}>🚗</span>
        <div>
          <h2 style={s.cardTitle}>Register New Driver</h2>
          <p style={s.cardSub}>Add a driver to your fleet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={s.form}>
        <div style={s.fieldGroup}>
          <label style={s.label}>Driver Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Ahmed Khan"
            style={s.input}
          />
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Phone Number</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. 0300-1234567"
            style={s.input}
          />
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Vehicle Number</label>
          <input
            name="vehicleNo"
            value={form.vehicleNo}
            onChange={handleChange}
            placeholder="e.g. ABC-1234"
            style={{ ...s.input, textTransform: "uppercase" }}
          />
        </div>

        <button type="submit" disabled={loading} style={s.submitBtn}>
          {loading ? "Registering…" : "Register Driver"}
        </button>
      </form>
    </div>
  );
}

// ─── Sub-component: Driver Table ───────────────────────────────────────────────
function DriverTable({ drivers, onDelete, onSelectAssign }) {
  if (drivers.length === 0) {
    return (
      <div style={s.emptyState}>
        <span style={{ fontSize: 36 }}>🚘</span>
        <p style={s.emptyText}>No drivers registered yet.</p>
      </div>
    );
  }

  return (
    <div style={s.tableWrapper}>
      <table style={s.table}>
        <thead>
          <tr>
            {["Driver Name", "Phone", "Vehicle No.", "Status", "Action"].map(
              (h) => (
                <th key={h} style={s.th}>
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {drivers.map((d, i) => (
            <tr key={d._id} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
              <td style={s.td}>
                <span style={s.driverName}>{d.name}</span>
              </td>
              <td style={s.td}>{d.phone}</td>
              <td style={s.td}>
                <span style={s.vehicleBadge}>{d.vehicleNo}</span>
              </td>
              <td style={s.td}>
                <span style={d.isAvailable ? s.statusAvailable : s.statusUnavailable}>
                  {d.isAvailable ? "Available" : "On Duty"}
                </span>
              </td>
              <td style={{ ...s.td, display: "flex", gap: "8px" }}>
                {d.isAvailable && (
                  <button
                    onClick={() => onSelectAssign(d)}
                    style={s.assignBtn}
                  >
                    Assign Pickup
                  </button>
                )}
                <button
                  onClick={() => onDelete(d._id)}
                  style={s.deleteBtn}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RegisterDriver() {
  const [drivers, setDrivers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedDonationId, setSelectedDonationId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchDrivers = async () => {
    try {
      const { data } = await API.get("/drivers", { headers: authHeader() });
      setDrivers(data);
    } catch (err) {
      console.error("Could not fetch drivers");
    }
  };  

  const fetchUnassignedDonations = async () => {
    try {
      const { data } = await API.get("/drivers/unassigned-donations", { headers: authHeader() });
      setDonations(data);
    } catch (err) {
      console.error("Could not fetch unassigned donations");
    }
  };

  const loadDashboardData = async () => {
    setFetchLoading(true);
    await Promise.all([fetchDrivers(), fetchUnassignedDonations()]);
    setFetchLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDelete = async (id) => {
    // Replaced native window.confirm with SweetAlert2 interactive configuration
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this driver registration!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove them!",
    });

    if (!result.isConfirmed) return;

    try {
      await API.delete(`/drivers/${id}`, { headers: authHeader() });
      setDrivers((prev) => prev.filter((d) => d._id !== id));
      
      Swal.fire({
        icon: "success",
        title: "Removed!",
        text: "Driver profile deleted cleanly.",
        confirmButtonColor: "#4ade80",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Action Failed",
        text: "Failed to remove driver from database.",
        confirmButtonColor: "#fb923c",
      });
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDonationId) {
      Swal.fire({
        icon: "warning",
        title: "Selection Needed",
        text: "Please select an active unassigned donation package first.",
        confirmButtonColor: "#D4A017",
      });
      return;
    }

    setAssignLoading(true);
    try {
      await API.patch(
        "/drivers/assign",
        { 
          driverId: selectedDriver._id,  
          donationId: selectedDonationId 
        },
        { headers: authHeader() }
      );

      Swal.fire({
        icon: "success",
        title: "Route Assigned!",
        text: `Successfully assigned pickup tracking details to ${selectedDriver.name}!`,
        confirmButtonColor: "#a78bfa",
      });

      setSelectedDriver(null);
      setSelectedDonationId("");
      loadDashboardData(); 
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Assignment Failed",
        text: err.response?.data?.message || "Failed to assign donation.",
        confirmButtonColor: "#fb923c",
      });
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'#F4F6FB',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.au{animation:fadeUp 0.5s ease both;opacity:0}.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.rcard{background:white;border-radius:18px;border:1px solid #D8E2F0;padding:24px;transition:all 0.3s ease;position:relative;overflow:hidden}.rcard::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(135deg,#D4A017,#F0C040);border-radius:18px 0 0 18px}.rcard:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(27,58,107,0.1);border-color:#D4A017}.page-shell{padding:32px 24px 60px}.layout-grid{display:grid;grid-template-columns:minmax(300px,400px) 1fr;gap:24px;align-items:start}.stats-row{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:28px}.stats-row > div{flex:1 1 220px;min-width:180px}.assign-form{display:flex;gap:16px;align-items:flex-end}.assign-form button{min-width:0}.table-wrapper{overflow-x:auto}.cardHeader{display:flex;align-items:center;gap:14px;padding:20px 24px;border-bottom:1px solid #334155;background:#162032}.cardHeader button{margin-left:auto}.cardHeader h2{margin:0}.cardHeader p{margin:2px 0 0}.button-full{width:100%}@media (max-width: 1024px){.page-shell{padding:28px 18px 48px}}@media (max-width: 768px){.page-shell{padding:20px 14px 40px}.layout-grid{grid-template-columns:1fr}.assign-form{flex-direction:column;align-items:stretch}.assign-form button{width:100%}.table th,.table td{padding:10px 12px}.table th{white-space:nowrap}.cardHeader{flex-direction:column;align-items:flex-start}.cardHeader button{margin-left:0;align-self:flex-end}}@media (max-width: 640px){.page-shell{padding:18px 12px 32px}.stats-row{gap:12px}.cardHeader{padding:18px 18px 16px}}`}</style>
      <Navbar/>
      <div className="page-shell" style={s.page}>
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>Driver Management Dashboard</h1>
          <p style={s.pageSub}>Register drivers and assign donation pick-ups</p>
        </div>

        <div className="stats-row" style={s.statsRow}>
          <StatCard label="Total Drivers"     value={drivers.length}                               color="#38bdf8" />
          <StatCard label="Available"         value={drivers.filter((d) => d.isAvailable).length}     color="#4ade80" />
          <StatCard label="On Duty"           value={drivers.filter((d) => !d.isAvailable).length}    color="#fb923c" />
          <StatCard label="Pending Pickups"   value={donations.length}                               color="#a78bfa" />
        </div>

        {selectedDriver && (
          <div style={{ ...s.card, marginBottom: 24, border: "1px solid #a78bfa" }}>
            <div className="cardHeader" style={{ ...s.cardHeader, background: "#2e1065" }}>
              <span style={s.cardIcon}>📦</span>
              <div>
                <h2 style={s.cardTitle}>Assign Pickup to {selectedDriver.name}</h2>
                <p style={{ ...s.cardSub, color: "#c084fc" }}>Link an unassigned pending donation with vehicle ({selectedDriver.vehicleNo})</p>
              </div>
              <button 
                onClick={() => setSelectedDriver(null)} 
                style={{ marginLeft: "auto", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                ✕ Cancel
              </button>
            </div>
            <form onSubmit={handleAssignSubmit} className="assign-form" style={{ ...s.form, display: "flex", gap: 16, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Select Available Pending Donation</label>
                <select 
                  value={selectedDonationId} 
                  onChange={(e) => setSelectedDonationId(e.target.value)}
                  style={s.input}
                >
                  <option value="">-- Choose a Donation Location / Items --</option>
                  {donations.map((don) => (
                    <option key={don._id} value={don._id}>
                      {don.foodName || don.title || "Donation Name"} — ({don.pickupAddress || "No Address Given"})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={assignLoading} style={{ ...s.submitBtn, padding: "10px 24px" }}>
                {assignLoading ? "Assigning..." : "Confirm Assignment"}
              </button>
            </form>
          </div>
        )}

        <div className="layout-grid" style={s.layout}>
          <RegisterForm onSuccess={loadDashboardData} />

          <div className="card" style={s.card}>
            <div className="cardHeader" style={s.cardHeader}>
              <span style={s.cardIcon}>👥</span>
              <div>
                <h2 style={s.cardTitle}>Registered Drivers</h2>
                <p style={s.cardSub}>{drivers.length} driver(s) in your fleet</p>
              </div>
            </div>

            {fetchLoading ? (
              <div style={s.loadingState}>Loading drivers…</div>
            ) : (
              <DriverTable 
                drivers={drivers} 
                onDelete={handleDelete} 
                onSelectAssign={(driver) => {
                  setSelectedDriver(driver);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
              />
            )}
          </div>
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
  // Keeping your styling intact and adding styles for new elements:
  page: { minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#f1f5f9" },
  pageHeader: { marginBottom: 28 },
  pageTitle: { fontSize: 26, fontWeight: 700, margin: 0, color: "#f8fafc" },
  pageSub: { margin: "6px 0 0", color: "#64748b", fontSize: 14 },
  statsRow: { display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" },
  statCard: { flex: "1 1 130px", background: "#1e293b", borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 4, border: "1px solid #334155" },
  statValue: { fontSize: 28, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: 500 },
  layout: { display: "grid", gap: 24, alignItems: "start" },
  card: { background: "#1e293b", borderRadius: 16, border: "1px solid #334155", overflow: "hidden" },
  cardHeader: { display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", borderBottom: "1px solid #334155", background: "#162032" },
  cardIcon: { fontSize: 26 },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "#f8fafc" },
  cardSub: { margin: "2px 0 0", fontSize: 12, color: "#64748b" },
  form: { padding: "24px" },
  fieldGroup: { marginBottom: 18 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box" },
  errorMsg: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, margin: "0 0 14px" },
  successMsg: { background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.30)", color: "#86efac", borderRadius: 8, padding: "10px 14px", fontSize: 13, margin: "0 0 14px" },
  submitBtn: { width: "100%", padding: "11px 0", background: "linear-gradient(135deg,#0ea5e9,#3b82f6)", border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4 },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "12px 16px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid #334155" },
  td: { padding: "13px 16px", color: "#cbd5e1", verticalAlign: "middle" },
  rowEven: { background: "transparent" },
  rowOdd:  { background: "rgba(255,255,255,0.02)" },
  driverName: { color: "#f1f5f9", fontWeight: 600 },
  vehicleBadge: { background: "rgba(56,189,248,0.12)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.25)", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 600 },
  statusAvailable: { background: "rgba(74,222,128,0.12)", color: "#4ade80", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 },
  statusUnavailable: { background: "rgba(251,146,60,0.12)", color: "#fb923c", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 },
  deleteBtn: { background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 500 },
  emptyState: { textAlign: "center", padding: "48px 24px", color: "#475569" },
  emptyText: { margin: "12px 0 0", fontSize: 14 },
  loadingState: { textAlign: "center", padding: 36, color: "#475569", fontSize: 14 },
  // New Style Rule added for Assignment Button
  assignBtn: { background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", color: "#c084fc", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }
};