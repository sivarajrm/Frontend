import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";

export default function AdminDashboard() {
  const { instance } = useMsal();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 5;

  const [activeView, setActiveView] = useState("all"); // all | new

  /* ================= LOAD STATS ================= */
  useEffect(() => {
    const account = instance.getActiveAccount();
    if (!account) return;

    fetch("http://127.0.0.1:8000/api/admin/overview", {
      headers: { "x-user-email": account.username },
    })
      .then((res) => res.json())
      .then(setStats);
  }, [instance]);

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    const account = instance.getActiveAccount();
    if (!account) return;

    fetch("http://127.0.0.1:8000/api/admin/users", {
      headers: { "x-user-email": account.username },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoadingUsers(false);
      })
      .catch(() => setLoadingUsers(false));
  }, [instance]);

  if (!stats) return <h3>Loading Admin Dashboard...</h3>;

  /* ================= STATUS ================= */
  const getStatus = (createdAt) => {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const days = (now - created) / (1000 * 60 * 60 * 24);
    return days <= 7 ? "Recently Joined" : "Older User";
  };

  const statusStyles = {
    "Recently Joined": { bg: "#dcfce7", color: "#047857" },
    "Older User": { bg: "#fef3c7", color: "#92400e" },
  };

  /* ================= KPI ================= */
  const now = Date.now();
  const newUsers7Days = users.filter((u) => {
    const created = new Date(u.created_at).getTime();
    return created >= now - 7 * 24 * 60 * 60 * 1000;
  }).length;

  /* ================= FILTER ================= */
  const filteredUsers = users.filter((u) => {
    const created = new Date(u.created_at).getTime();
    const isNew =
      created >= now - 7 * 24 * 60 * 60 * 1000 && created <= now;

    if (activeView === "new" && !isNew) return false;

    return (
      u.user_id.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  /* ================= ACTIONS ================= */
  const deleteUser = (userId) => {
    if (!window.confirm("Delete this user?")) return;

    const account = instance.getActiveAccount();
    fetch(`http://127.0.0.1:8000/api/admin/delete-user/${userId}`, {
      method: "DELETE",
      headers: { "x-user-email": account.username },
    }).then(() => {
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    });
  };

  /* ================= EXPORT CSV ================= */
  const exportCSV = () => {
    const csv =
      "User ID,Name,Created At\n" +
      filteredUsers
        .map((u) => `${u.user_id},${u.name},${u.created_at}`)
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      activeView === "new" ? "new_users.csv" : "all_users.csv";
    a.click();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      <p style={styles.subtitle}>System overview & analytics</p>

      {/* KPI CARDS */}
      <div style={styles.kpiWrapper}>
        <div
          style={styles.kpiCard}
          onClick={() => {
            setActiveView("all");
            setShowUsers(true);
            setCurrentPage(1);
          }}
        >
          <p style={styles.kpiLabel}>TOTAL USERS</p>
          <h2 style={styles.kpiValue}>{stats.total_users}</h2>
        </div>

        <div
          style={styles.kpiCard}
          onClick={() => {
            setActiveView("new");
            setShowUsers(true);
            setCurrentPage(1);
          }}
        >
          <p style={styles.kpiLabel}>NEW USERS (7 DAYS)</p>
          <h2 style={styles.kpiValue}>{newUsers7Days}</h2>
        </div>
      </div>

      {/* USERS TABLE */}
      <div
        style={{
          ...styles.tableCard,
          ...(showUsers ? styles.tableOpen : styles.tableClosed),
        }}
      >
        {showUsers && (
          <>
            <div style={styles.tableHeader}>
              <div>
                <h3>
                  {activeView === "new"
                    ? "New Users (Last 7 Days)"
                    : "Registered Users"}
                </h3>
                <p style={styles.helperText}>
                  {activeView === "new"
                    ? "Users who joined in the last 7 days"
                    : "Manage all registered accounts"}
                </p>
              </div>

              <div style={styles.headerActions}>
                <input
                  placeholder="Search user"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={styles.search}
                />
                <button style={styles.exportBtn} onClick={exportCSV}>
                  Export CSV
                </button>
              </div>
            </div>

            {loadingUsers ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={styles.skeleton} />
              ))
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>User ID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Created</th>
                    <th style={styles.th}>Report</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((u, i) => {
                    const status = getStatus(u.created_at);
                    const badge = statusStyles[status];

                    return (
                      <tr
                        key={u.user_id}
                        style={styles.tableRow}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.boxShadow =
                            "0 0 0 1px rgba(59,130,246,0.35), 0 10px 24px rgba(59,130,246,0.25)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.boxShadow = "none")
                        }
                      >
                        <td style={styles.td}>
                          {(currentPage - 1) * USERS_PER_PAGE + i + 1}
                        </td>
                        <td style={styles.td}>{u.user_id}</td>
                        <td style={styles.td}>{u.name}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              padding: "6px 14px",
                              borderRadius: "999px",
                              background: badge.bg,
                              color: badge.color,
                              fontSize: "12px",
                            }}
                          >
                            {status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td style={styles.td}>
                          <a
                            href={`http://127.0.0.1:8000/api/generate-report-pdf/${u.user_id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download
                          </a>
                        </td>
                        <td style={styles.td}>
                          <select
                            style={styles.actionSelect}
                            onChange={(e) => {
                              if (e.target.value === "copy")
                                navigator.clipboard.writeText(u.user_id);
                              if (e.target.value === "delete")
                                deleteUser(u.user_id);
                              e.target.value = "";
                            }}
                          >
                            <option value="">•••</option>
                            <option value="copy">Copy User ID</option>
                            <option value="delete">Delete</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: { padding: "32px", maxWidth: "1280px", margin: "0 auto" },
  title: { fontSize: "30px", fontWeight: 700 },
  subtitle: { color: "#e7e4e4ff", marginBottom: "28px" },

  kpiWrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "20px",
    marginBottom: "28px",
  },

  kpiCard: {
    background: "linear-gradient(135deg,#ffffffee,#f8fafc)",
    borderRadius: "18px",
    padding: "26px",
    boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
    cursor: "pointer",
  },

  kpiLabel: { fontSize: "12px", letterSpacing: "1px", color: "#6b7280" },
  kpiValue: { fontSize: "34px", fontWeight: 700 },

  tableCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 12px 36px rgba(0,0,0,0.1)",
    transition: "all 0.45s ease",
    overflow: "hidden",
  },

  tableOpen: {
    maxHeight: "1000px",
    opacity: 1,
    transform: "translateY(0)",
  },

  tableClosed: {
    maxHeight: "0",
    opacity: 0,
    transform: "translateY(-12px)",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "14px",
  },

  helperText: { fontSize: "13px", color: "#6b7280" },
  headerActions: { display: "flex", gap: "10px" },

  search: { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" },
  exportBtn: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
  },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "14px", borderBottom: "1px solid #e5e7eb" },

  tableRow: {
    transition: "box-shadow 0.25s ease, transform 0.25s ease",
  },

  actionSelect: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },

  skeleton: {
    height: "42px",
    background: "#f3f4f6",
    borderRadius: "10px",
    marginBottom: "10px",
  },
};
