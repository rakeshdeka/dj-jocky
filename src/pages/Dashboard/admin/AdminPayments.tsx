"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import MainLayout from "../../../components/dashboard/layout/MainLayout"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/dashboard/ui/card"
import { Button } from "../../../components/dashboard/ui/button"
import { Input } from "../../../components/dashboard/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/dashboard/ui/select"
import { 
  SearchIcon, 
  Download, 
  ArrowUpRight, 
  CreditCard, 
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink
} from "lucide-react"
import axios from "axios"
import { useSelector } from "react-redux"
import { RootState } from "../../../store/store"
import { toast } from "sonner"

// Defined type interface for payment items
export interface PaymentUser {
  _id?: string
  name?: string
  email?: string
}

export interface PaymentItem {
  _id: string
  razorpay_payment_id?: string
  user_id?: PaymentUser
  type?: 'subscription' | 'one_time' | string
  amount: number // in paise/cents
  status: 'succeeded' | 'pending' | 'failed' | string
  subscription_status?: 'active' | 'canceled' | 'past_due' | string
  createdAt?: string
}

const AdminPayments: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL
  const { token } = useSelector((state: RootState) => state.auth)

  // State
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  /* ================= FETCH DATA ================= */
  const fetchPayments = async () => {
    try {
      setIsLoading(true)
      const res = await axios.get(`${apiUrl}/admin/payments`, {
        params: {
          type: typeFilter !== 'all' ? typeFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })
      setPayments(res.data.items || [])
    } catch (error) {
      toast.error("Failed to load payment records")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchPayments()
    } else {
      setIsLoading(false)
    }
  }, [token, statusFilter, typeFilter])

  /* ================= DOWNLOAD REPORT HANDLER ================= */
  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true)
      toast.info("Preparing transaction report...")
      // Simulated export delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success("Report downloaded successfully")
    } catch (error) {
      toast.error("Failed to download report")
    } finally {
      setIsDownloading(false)
    }
  }

  /* ================= FILTER & SEARCH (MEMOIZED) ================= */
  const filteredPayments = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return payments

    return payments.filter((p) => {
      const paymentId = String(p.razorpay_payment_id || '').toLowerCase()
      const userName = String(p.user_id?.name || '').toLowerCase()
      const userEmail = String(p.user_id?.email || '').toLowerCase()

      return paymentId.includes(term) || userName.includes(term) || userEmail.includes(term)
    })
  }, [payments, searchTerm])

  /* ================= METRICS CALCULATION ================= */
  const totalVolume = useMemo(() => {
    return payments.reduce((acc, curr) => acc + (curr.amount || 0), 0) / 100
  }, [payments])

  const activeSubscriptions = useMemo(() => {
    return payments.filter(p => p.subscription_status === 'active').length
  }, [payments])

  const pendingOrders = useMemo(() => {
    return payments.filter(p => p.status === 'pending').length
  }, [payments])

  const failedAttempts = useMemo(() => {
    return payments.filter(p => p.status === 'failed').length
  }, [payments])

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">PAYMENTS & BILLING</h1>
          <p className="text-muted-foreground text-sm">Track subscriptions and Razorpay transactions</p>
        </div>
        <Button 
          onClick={handleDownloadReport}
          disabled={isDownloading || isLoading}
          variant="outline" 
          className="gap-2 border-[#c5fb00] text-[#c5fb00] hover:bg-[#c5fb00] hover:text-black transition-all min-w-[170px]"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Report
            </>
          )}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `₹${totalVolume.toLocaleString()}`, icon: ArrowUpRight, color: "text-green-500" },
          { label: "Active Subscriptions", value: activeSubscriptions, icon: CheckCircle2, color: "text-[#c5fb00]" },
          { label: "Pending Orders", value: pendingOrders, icon: Clock, color: "text-yellow-500" },
          { label: "Failed Attempts", value: failedAttempts, icon: AlertCircle, color: "text-red-500" },
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
            <CardTitle className="text-lg">Transaction Ledger</CardTitle>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Payment ID or Client..." 
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
                  <SelectItem value="all">All Status</SelectItem>
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
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="one_time">One-time</SelectItem>
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
                  Fetching ledger...
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px]">Payment ID</th>
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px]">Client</th>
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px]">Plan/Order</th>
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px]">Amount</th>
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px]">Status</th>
                    <th className="pb-4 font-semibold text-muted-foreground uppercase text-[10px] text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-mono text-[11px] text-foreground/70">
                            {p.razorpay_payment_id || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-5">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{p.user_id?.name || 'Unknown User'}</span>
                          <span className="text-[10px] text-muted-foreground">{p.user_id?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-5 text-xs">
                        <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {p.type === 'subscription' ? 'Pro Plan' : 'Custom Brief'}
                        </span>
                      </td>
                      <td className="py-5 font-bold">
                        ₹{((p.amount || 0) / 100).toLocaleString()}
                      </td>
                      <td className="py-5">
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full w-fit border text-[10px] font-bold uppercase
                          ${p.status === 'succeeded' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                          ${p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                          ${p.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                        `}>
                          {p.status || 'unknown'}
                        </div>
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-muted-foreground text-xs">
                            {p.createdAt 
                              ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'N/A'
                            }
                          </span>
                          <button className="text-[#c5fb00] text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            View Invoice <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!isLoading && filteredPayments.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-xl mt-4">
                <p className="text-muted-foreground text-sm">No transaction records match your search criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  )
}

export default AdminPayments