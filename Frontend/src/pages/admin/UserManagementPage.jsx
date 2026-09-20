import {
  Building2,
  CheckCircle2,
  Eye,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import ResponsiveDataList from "../../components/admin/ResponsiveDataList";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Loading from "../../components/common/Loading";
import Select from "../../components/common/Select";
import StatCard from "../../components/common/StatCard";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getAdminUsers, updateUser } from "../../services/adminService";

const ROLE_OPTIONS = [
  "All",
  "Student",
  "Teacher",
  "Staff",
  "Driver",
  "Transport Authority",
];

const STATUS_OPTIONS = ["All", "Active", "Inactive"];

function getRoleBadgeStyle(role) {
  switch (role) {
    case "Student":
      return "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-800";
    case "Teacher":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800";
    case "Staff":
      return "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:ring-purple-800";
    case "Driver":
      return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800";
    case "Transport Authority":
      return "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700";
  }
}

function formatDate(isoString) {
  if (!isoString) return "N/A";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}

export default function UserManagementPage() {
  const { setToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const students = users.filter((u) => u.role === "Student").length;
    const facultyAndStaff = users.filter(
      (u) => u.role === "Teacher" || u.role === "Staff"
    ).length;
    return { total, active, students, facultyAndStaff };
  }, [users]);

  const visibleUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole =
        roleFilter === "All" ||
        user.role === roleFilter ||
        (roleFilter === "Transport Authority" && user.role === "Transport Authority");

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      const searchableValues = [
        user.name,
        user.universityId,
        user.email,
        user.department,
        user.phone,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());

      const matchesSearch =
        !needle || searchableValues.some((val) => val.includes(needle));

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [query, roleFilter, statusFilter, users]);

  async function toggleUserStatus(user) {
    const targetStatus = user.status === "Active" ? "Inactive" : "Active";
    setUpdatingId(user.id);
    try {
      const updated = await updateUser(user.id, { status: targetStatus });
      setToast({
        type: "success",
        message: `${user.name} is now ${targetStatus.toLowerCase()}.`,
      });
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, ...updated } : item))
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => (prev ? { ...prev, ...updated } : null));
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Could not update user status.",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  const columns = [
    {
      label: "User",
      render: (user) => {
        const initials = (user.name || "U")
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-brand-maroon/20 to-brand-purple/20 text-xs font-bold text-brand-purple dark:from-brand-maroon/40 dark:to-brand-purple/40 dark:text-purple-300 ring-1 ring-white/20">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-safar-ink dark:text-white">
                {user.name}
              </p>
              <p className="truncate text-xs text-safar-gray dark:text-slate-400">
                {user.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      label: "University ID",
      render: (user) => (
        <span className="font-mono text-xs font-semibold text-safar-ink dark:text-slate-200">
          {user.universityId || "—"}
        </span>
      ),
    },
    {
      label: "Role",
      render: (user) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${getRoleBadgeStyle(
            user.role
          )}`}
        >
          {user.role || "User"}
        </span>
      ),
    },
    {
      label: "Department",
      render: (user) => (
        <span className="text-xs text-safar-gray dark:text-slate-300">
          {user.department || "—"}
        </span>
      ),
    },
    {
      label: "Verification",
      render: (user) =>
        user.isVerified ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            Unverified
          </span>
        ),
    },
    {
      label: "Status",
      render: (user) => <AdminStatusBadge status={user.status} />,
    },
    {
      label: "Actions",
      render: (user) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="focus-ring rounded-lg p-2 text-safar-teal hover:bg-safar-mint/60 dark:text-cyan-400 dark:hover:bg-slate-800 transition"
            aria-label={`View details for ${user.name}`}
            title="View full profile details"
            onClick={() => setSelectedUser(user)}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={updatingId === user.id}
            className={`focus-ring rounded-lg p-2 transition ${
              user.status === "Active"
                ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                : "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            } disabled:opacity-50`}
            aria-label={`${
              user.status === "Active" ? "Deactivate" : "Activate"
            } ${user.name}`}
            title={
              user.status === "Active"
                ? "Deactivate user account"
                : "Activate user account"
            }
            onClick={() => toggleUserStatus(user)}
          >
            {user.status === "Active" ? (
              <UserX className="h-4 w-4" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Access & Identity"
          title="Users Management"
          description="View registered university community members, inspect verified identities, and manage account access."
          action={
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => loadData(true)}
              loading={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          }
        />

        {error ? (
          <ErrorState
            title="Users unavailable"
            message={error}
            action={
              <Button onClick={() => loadData(true)}>Try Again</Button>
            }
          />
        ) : (
          <>
            {/* Stat Cards */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.total}
                helper="All university accounts"
              />
              <StatCard
                icon={ShieldCheck}
                label="Active Accounts"
                value={stats.active}
                helper="Permitted to book & ride"
              />
              <StatCard
                icon={GraduationCap}
                label="Students"
                value={stats.students}
                helper="Enrolled student accounts"
              />
              <StatCard
                icon={Building2}
                label="Faculty & Staff"
                value={stats.facultyAndStaff}
                helper="Teachers, officers & staff"
              />
            </section>

            {/* Filter Bar */}
            <section className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-md sm:flex-row sm:items-center dark:bg-slate-900/70 dark:ring-slate-800">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-safar-gray dark:text-slate-400" />
                <input
                  type="text"
                  className="focus-ring h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm text-safar-ink placeholder:text-safar-gray dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500"
                  placeholder="Search by name, ID, email, or department..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-3.5 text-safar-gray hover:text-safar-ink dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:w-auto">
                <div className="min-w-[150px]">
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    aria-label="Filter by role"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === "All" ? "All Roles" : opt}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="min-w-[140px]">
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === "All" ? "All Status" : opt}
                      </option>
                    ))}
                  </Select>
                </div>

                {(query || roleFilter !== "All" || statusFilter !== "All") && (
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => {
                      setQuery("");
                      setRoleFilter("All");
                      setStatusFilter("All");
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </section>

            {/* Results count info */}
            <div className="flex items-center justify-between text-xs text-safar-gray dark:text-slate-400 px-1">
              <span>
                Showing <strong className="text-safar-ink dark:text-white">{visibleUsers.length}</strong> of{" "}
                {users.length} users
              </span>
              {updatingId && (
                <span className="text-safar-teal animate-pulse">
                  Updating account status...
                </span>
              )}
            </div>

            {/* Table / Mobile List */}
            {loading ? (
              <div className="py-12">
                <Loading message="Loading university users..." />
              </div>
            ) : visibleUsers.length === 0 ? (
              <EmptyState
                title="No users match your criteria"
                message="Try adjusting your search query, role filter, or status filter."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery("");
                      setRoleFilter("All");
                      setStatusFilter("All");
                    }}
                  >
                    Clear Filters
                  </Button>
                }
              />
            ) : (
              <ResponsiveDataList
                columns={columns}
                rows={visibleUsers}
                rowKey="id"
                renderMobile={(user) => {
                  const initials = (user.name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  return (
                    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-brand-maroon/20 to-brand-purple/20 text-xs font-bold text-brand-purple dark:text-purple-300 ring-1 ring-white/20">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h2 className="truncate font-bold text-safar-ink dark:text-white">
                              {user.name}
                            </h2>
                            <p className="font-mono text-xs text-safar-gray dark:text-slate-400">
                              {user.universityId || "—"}
                            </p>
                          </div>
                        </div>
                        <AdminStatusBadge status={user.status} />
                      </div>

                      <div className="mt-4 space-y-1 text-xs text-safar-gray dark:text-slate-300">
                        <p className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-safar-gray" />
                          <span className="truncate">{user.email}</span>
                        </p>
                        {user.department && (
                          <p className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-safar-gray" />
                            <span className="truncate">{user.department}</span>
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${getRoleBadgeStyle(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            className="h-8 px-2.5 text-xs"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Details
                          </Button>
                          <Button
                            variant={
                              user.status === "Active" ? "danger" : "primary"
                            }
                            className="h-8 px-2.5 text-xs"
                            disabled={updatingId === user.id}
                            onClick={() => toggleUserStatus(user)}
                          >
                            {user.status === "Active" ? (
                              <>
                                <UserX className="mr-1.5 h-3.5 w-3.5" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                }}
              />
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-safar-ink/60 backdrop-blur-sm p-4">
          <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            {/* Modal Close Button */}
            <button
              type="button"
              className="focus-ring absolute right-4 top-4 rounded-lg p-2 text-safar-gray hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition"
              onClick={() => setSelectedUser(null)}
              aria-label="Close user details"
            >
              <X className="h-5 w-5" />
            </button>

            {/* User Header */}
            <div className="flex items-start gap-4 pr-8">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-brand-maroon/20 to-brand-purple/20 text-lg font-bold text-brand-purple dark:text-purple-300 ring-1 ring-brand-purple/30">
                {(selectedUser.name || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-safar-ink dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="font-mono text-xs font-semibold text-safar-gray dark:text-slate-400">
                  ID: {selectedUser.universityId || "—"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${getRoleBadgeStyle(
                      selectedUser.role
                    )}`}
                  >
                    {selectedUser.role}
                  </span>
                  <AdminStatusBadge status={selectedUser.status} />
                </div>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="mt-6 divide-y divide-slate-100 rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-200/60 dark:divide-slate-800 dark:bg-slate-800/50 dark:ring-slate-700/60 space-y-3">
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 pt-2 first:pt-0">
                <div>
                  <p className="text-xs font-medium text-safar-gray dark:text-slate-400">
                    Email Address
                  </p>
                  <p className="text-sm font-semibold text-safar-ink dark:text-white break-all">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-safar-gray dark:text-slate-400">
                    Phone Contact
                  </p>
                  <p className="text-sm font-semibold text-safar-ink dark:text-white">
                    {selectedUser.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 pt-3">
                <div>
                  <p className="text-xs font-medium text-safar-gray dark:text-slate-400">
                    Department
                  </p>
                  <p className="text-sm font-semibold text-safar-ink dark:text-white">
                    {selectedUser.department || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-safar-gray dark:text-slate-400">
                    Department Code
                  </p>
                  <p className="text-sm font-semibold text-safar-ink dark:text-white">
                    {selectedUser.departmentCode || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 pt-3">
                <div>
                  <p className="text-xs font-medium text-safar-gray dark:text-slate-400">
                    Verification
                  </p>
                  <p className="text-sm font-semibold text-safar-ink dark:text-white flex items-center gap-1">
                    {selectedUser.isVerified ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">
                        Unverified
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-safar-gray dark:text-slate-400">
                    Gender
                  </p>
                  <p className="text-sm font-semibold text-safar-ink dark:text-white capitalize">
                    {selectedUser.gender
                      ? selectedUser.gender.toLowerCase().replace(/_/g, " ")
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 pt-3">
                <div>
                  <p className="text-xs font-medium text-safar-gray dark:text-slate-400">
                    Approval Status
                  </p>
                  <p className="text-sm font-semibold text-safar-ink dark:text-white">
                    {selectedUser.approvalStatus || "APPROVED"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-safar-gray dark:text-slate-400">
                    Registered On
                  </p>
                  <p className="text-sm font-semibold text-safar-ink dark:text-white">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center">
              <Button
                variant={
                  selectedUser.status === "Active" ? "danger" : "primary"
                }
                disabled={updatingId === selectedUser.id}
                onClick={() => toggleUserStatus(selectedUser)}
                className="w-full sm:w-auto"
              >
                {selectedUser.status === "Active" ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate Account
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate Account
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedUser(null)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
