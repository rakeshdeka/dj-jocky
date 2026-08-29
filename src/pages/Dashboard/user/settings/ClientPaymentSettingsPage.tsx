import PaymentMethods from '../../../../components/dashboard/profile/PaymentMethods';

export default function ClientPaymentSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">PAYMENT</h1>
        <p className="text-muted-foreground text-sm">Manage your payment methods</p>
      </div>
      <div className="glass-panel rounded-md p-6 font-sans">
        <PaymentMethods />
      </div>
    </div>
  );
}
