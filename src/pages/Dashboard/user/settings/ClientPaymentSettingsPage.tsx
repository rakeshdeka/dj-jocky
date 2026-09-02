import PaymentHistory from '../../../../components/dashboard/profile/PaymentHistory';

export default function ClientPaymentSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">PAYMENT</h1>
        <p className="text-muted-foreground text-sm">View your Razorpay payment history</p>
      </div>
      <div className="glass-panel rounded-md p-6 font-sans">
        <PaymentHistory />
      </div>
    </div>
  );
}
