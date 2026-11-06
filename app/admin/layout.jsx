import AdminAccessGate from "../../components/admin/AdminAccessGate";
import { isAdminSession } from "../../lib/admin-auth";

export default function AdminLayout({ children }) {
  if (!isAdminSession()) {
    return <AdminAccessGate />;
  }

  return children;
}
