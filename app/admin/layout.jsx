import AdminAccessGate from "../../components/admin/AdminAccessGate";
import { isAdminSession } from "../../lib/admin-auth";

export default async function AdminLayout({ children }) {
  if (!(await isAdminSession())) {
    return <AdminAccessGate />;
  }

  return children;
}
