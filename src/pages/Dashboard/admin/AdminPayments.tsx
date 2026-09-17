"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import MainLayout from "../../../components/dashboard/layout/MainLayout"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/dashboard/ui/card"
import { Input } from "../../../components/dashboard/ui/input"
import { Button } from "../../../components/dashboard/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/dashboard/ui/select"
import {
  SearchIcon,
  ArrowUpRight,
  CreditCard,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useSelector } from "react-redux"
import { RootState } from "../../../store/store"
import { toast } from "sonner"
import {
  fetchAdminPayments,
  formatPaymentAmount,
  getPaymentProductLabel,
  type PaymentRecord,
} from "../../../lib/payments-api"

const AdminPayments: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth)

  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const loadPayments = useCallback(async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const result = await fetchAdminPayments(token, {
        page,
        limit: 20,
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })
      setPayments(result.items)
      setTotalPages(result.totalPages)
      setTotalCount(result.total)
    } catch {
      toast.error("Failed to load payment records")
    } finally {
      setIsLoading(false)
    }
  }, [token, page, statusFilter, typeFilter])

  useEffect(() => {
    if (token) loadPayments()
    else setIsLoading(false)
  }, [token, loadPayments])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, typeFilter])

  const filteredPayments = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return payments

    return payments.filter((p) => {
      const paymentId = String(p.razorpay_payment_id || "").toLowerCase()
      const orderId = String(p.razorpay_order_id || "").toLowerCase()
      const userName = String(p.user?.name || "").toLowerCase()
      const userEmail = String(p.user?.email || "").toLowerCase()
      const product = getPaymentProductLabel(p).toLowerCase()

      return (
        paymentId.includes(term) ||
        orderId.includes(term) ||
        userName.includes(term) ||
        userEmail.includes(term) ||
        product.includes(term)
      )
    })
  }, [payments, searchTerm])

  const succeededOnPage = useMemo(
    () => payments.filter((p) => p.status === "succeeded"),
    [payments],
  )

  const totalVolume = useMemo(
    () => succeededOnPage.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    [succeededOnPage],
  )

  const activeSubscriptions = useMemo(
    () => payments.filter((p) => p.type === "subscription" && p.subscription_status === "active").length,
    [payments],
  )

  const pendingOrders = useMemo(() => payments.filter((p) => p.status === "pending").length, [payments])
  const failedAttempts = useMemo(() => payments.filter((p) => p.status === "failed").length, [payments])

  const formatVolume = (amount: number) => {
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
        amount,
      )
    } catch {
      return `₹${amount.toLocaleString("en-IN")}`
    }
  }

  const statusBadgeClass = (status?: string) => {
    const s = (status || "").toLowerCase()
    if (s === "succeeded" || s === "paid" || s === "captured") {
      return "bg-green-500/10 text-green-500 border-green-500/20"
    }
    if (s === "pending") return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    if (s === "failed") return "bg-red-500/10 text-red-500 border-red-500/20"
    return "bg-muted text-muted-foreground border-border"
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">PAYMENTS & BILLING</h1>
        <p className="text-muted-foreground text-sm">Razorpay service purchases and plan subscriptions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenue (this page)", value: formatVolume(totalVolume), icon: ArrowUpRight, color: "text-green-500" },
          { label: "Active subs (page)", value: activeSubscriptions, icon: CheckCircle2, color: "text-[#c5fb00]" },
          { label: "Pending (page)", value: pendingOrders, icon: Clock, color: "text-yellow-500" },
          { label: "Failed (page)", value: failedAttempts, icon: AlertCircle, color: "text-red-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-secondary/20 border-border/50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                  {isLoading ? (
                    <div className="h-8 w-24 bg-muted/40 animate-pulse rounded mt-2" />
                  ) : (
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  )}
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-secondary/10 border-border">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle className="text-lg">
              Transactions
              {!isLoading && totalCount > 0 ? (
                <span className="text-muted-foreground font-normal text-sm ml-2">({totalCount} total)</span>
              ) : null}
            </CardTitle>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Client, product, payment ID..."
                  className="pl-9 bg-background/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
                <SelectTrigger className="w-[130px] bg-background/40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter} disabled={isLoading}>
                <SelectTrigger className="w-[140px] bg-background/40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center border border-dashed border-border/40 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-[#c5fb00] mb-3" />
                <p className="text-xs text-muted-foreground animate-pulse tracking-widest uppercase font-bold">
                  Loading payments...
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px]">Date</th>
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px]">Client</th>
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px]">Type</th>
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px]">Product</th>
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px]">Amount</th>
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px]">Payment</th>
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px]">Subscription</th>
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px] text-right">
                      Razorpay ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredPayments.map((p) => (
                    <tr key={p._id || p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{p.user?.name || "—"}</span>
                          <span className="text-[10px] text-muted-foreground">{p.user?.email || ""}</span>
                        </div>
                      </td>
                      <td className="py-4 text-xs capitalize">{p.type || "—"}</td>
                      <td className="py-4 text-xs max-w-[160px] truncate" title={getPaymentProductLabel(p)}>
                        {getPaymentProductLabel(p)}
                      </td>
                      <td className="py-4 font-medium text-xs whitespace-nowrap">{formatPaymentAmount(p)}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusBadgeClass(p.status)}`}
                        >
                          {p.status || "—"}
                        </span>
                      </td>
                      <td className="py-4 text-xs capitalize text-muted-foreground">
                        {p.type === "subscription" && p.subscription_status ? p.subscription_status : "—"}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-mono text-[10px] text-muted-foreground">
                          <CreditCard className="h-3 w-3 shrink-0" />
                          <span className="max-w-[120px] truncate" title={p.razorpay_payment_id || ""}>
                            {p.razorpay_payment_id || "—"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!isLoading && filteredPayments.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-xl mt-4">
                <p className="text-muted-foreground text-sm">No payments match your filters.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  )
}

export default AdminPayments
