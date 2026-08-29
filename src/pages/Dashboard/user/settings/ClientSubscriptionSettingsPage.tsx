import SubscriptionDetails from '../../../../components/dashboard/profile/SubscriptionDetails';

export default function ClientSubscriptionSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">SUBSCRIPTION</h1>
        <p className="text-muted-foreground text-sm">View and manage your subscription</p>
      </div>
      <div className="glass-panel rounded-md p-6 font-sans">
        <SubscriptionDetails />
      </div>
    </div>
  );
}
