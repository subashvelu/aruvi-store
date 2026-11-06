"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAdmin } from "../../app/admin/actions";
import { useStore } from "../../context/StoreContext";
import { formatCompactNumber, formatCurrency, formatDate } from "../../lib/formatters";
import { BarChartIcon, ClipboardListIcon, LogOutIcon, PlusCircleIcon, UsersIcon, WalletIcon } from "../shared/Icons";

const periods = [
  { label: "Daily", days: 1 },
  { label: "Weekly", days: 7 },
  { label: "Monthly", days: 30 },
];

function withinDays(date, days) {
  const now = Date.now();
  const value = new Date(date).getTime();
  return now - value <= days * 24 * 60 * 60 * 1000;
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    Paid: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    Shipped: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] ${styles[status] || styles.Paid}`}>{status}</span>;
}

export default function AdminDashboardClient() {
  const { orders, users, newsletterSubscribers, products } = useStore();
  const [period, setPeriod] = useState("Weekly");
  const windowDays = periods.find((item) => item.label === period)?.days || 7;

  const filteredOrders = orders.filter((order) => withinDays(order.createdAt, windowDays));
  const filteredUsers = users.filter((user) => withinDays(user.joinedAt, windowDays));
  const filteredSubscribers = newsletterSubscribers.filter((subscriber) => withinDays(subscriber.joinedAt, windowDays));
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.amount, 0);
  const totalUsers = new Set(
    [...filteredUsers.map((user) => user.email.toLowerCase()), ...filteredSubscribers.map((subscriber) => subscriber.email.toLowerCase())]
  ).size;
  const statusBreakdown = {
    paid: filteredOrders.filter((order) => order.status === "Paid").length,
    pending: filteredOrders.filter((order) => order.status === "Pending").length,
    shipped: filteredOrders.filter((order) => order.status === "Shipped").length,
  };

  const userRows = [
    ...users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      joinedAt: user.joinedAt,
      source: user.source,
    })),
    ...newsletterSubscribers.map((subscriber) => ({
      id: subscriber.id,
      name: "Newsletter Subscriber",
      email: subscriber.email,
      phone: "-",
      address: "-",
      joinedAt: subscriber.joinedAt,
      source: subscriber.source,
    })),
  ].sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_30%),rgba(255,255,255,0.03)] p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-teal-300">Aruvi Admin Dashboard</p>
              <h1 className="mt-3 text-5xl font-semibold text-white">Store intelligence, order flow, and customer visibility.</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-100"
              >
                <PlusCircleIcon className="h-4 w-4" />
                Add Product
              </Link>
              <form action={logoutAdmin}>
                <button className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white/78 transition hover:border-white/25 hover:text-white">
                  <LogOutIcon className="h-4 w-4" />
                  Logout
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {periods.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setPeriod(item.label)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  period === item.label ? "bg-white text-zinc-950" : "border border-white/10 bg-white/[0.03] text-white/70"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { label: "Total Revenue", value: formatCurrency(totalRevenue), meta: `${period} gross sales`, icon: WalletIcon },
            { label: "Total Orders", value: formatCompactNumber(filteredOrders.length), meta: `${statusBreakdown.paid} paid / ${statusBreakdown.pending} pending`, icon: ClipboardListIcon },
            { label: "Total Users", value: formatCompactNumber(totalUsers), meta: `${filteredSubscribers.length} newsletter leads`, icon: UsersIcon },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.label} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/12 text-teal-200">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-xs uppercase tracking-[0.32em] text-white/35">{card.label}</p>
                <p className="mt-3 text-4xl font-semibold text-white">{card.value}</p>
                <p className="mt-2 text-sm text-white/55">{card.meta}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-400/12 text-teal-200">
                <BarChartIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/35">Time-filtered analytics</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{period} performance snapshot</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Catalog size</p>
                <p className="mt-3 text-3xl font-semibold text-white">{products.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Orders shipped</p>
                <p className="mt-3 text-3xl font-semibold text-white">{statusBreakdown.shipped}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Subscribers added</p>
                <p className="mt-3 text-3xl font-semibold text-white">{filteredSubscribers.length}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-white/35">Quick admin actions</p>
            <div className="mt-5 space-y-3">
              <Link href="/shop" className="block rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4 text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                Review storefront experience
              </Link>
              <Link href="/admin/products" className="block rounded-[1.5rem] border border-teal-400/30 bg-teal-400/10 px-5 py-4 text-sm text-teal-100 transition hover:border-teal-300/50">
                Add a new product to the live catalog
              </Link>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/35">Orders management</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Live order table</h2>
            </div>
            <p className="text-sm text-white/55">Order ID, customer, product, date, status, and amount.</p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.28em] text-white/35">
                <tr>
                  <th className="pb-4 pr-6 font-medium">Order ID</th>
                  <th className="pb-4 pr-6 font-medium">Customer Name</th>
                  <th className="pb-4 pr-6 font-medium">Product Purchased</th>
                  <th className="pb-4 pr-6 font-medium">Date</th>
                  <th className="pb-4 pr-6 font-medium">Status</th>
                  <th className="pb-4 font-medium">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-4 pr-6 text-white">{order.id}</td>
                    <td className="py-4 pr-6 text-white/72">{order.customerName}</td>
                    <td className="py-4 pr-6 text-white/72">{order.productName}</td>
                    <td className="py-4 pr-6 text-white/55">{formatDate(order.createdAt)}</td>
                    <td className="py-4 pr-6"><StatusBadge status={order.status} /></td>
                    <td className="py-4 text-white">{formatCurrency(order.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/35">User management</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Subscribers, customers, and community users</h2>
            </div>
            <p className="text-sm text-white/55">Unified details view for all signed-up users and leads.</p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.28em] text-white/35">
                <tr>
                  <th className="pb-4 pr-6 font-medium">Name</th>
                  <th className="pb-4 pr-6 font-medium">Email</th>
                  <th className="pb-4 pr-6 font-medium">Phone</th>
                  <th className="pb-4 pr-6 font-medium">Address</th>
                  <th className="pb-4 pr-6 font-medium">Source</th>
                  <th className="pb-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {userRows.map((user) => (
                  <tr key={user.id}>
                    <td className="py-4 pr-6 text-white">{user.name}</td>
                    <td className="py-4 pr-6 text-white/72">{user.email}</td>
                    <td className="py-4 pr-6 text-white/55">{user.phone}</td>
                    <td className="py-4 pr-6 text-white/55">{user.address}</td>
                    <td className="py-4 pr-6 text-white/72">{user.source}</td>
                    <td className="py-4 text-white/55">{formatDate(user.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
