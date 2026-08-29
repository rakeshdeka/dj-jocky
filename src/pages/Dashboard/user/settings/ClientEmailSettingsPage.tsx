import EmailSettings from '../../../../components/dashboard/profile/EmailSettings';

export default function ClientEmailSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">EMAIL</h1>
        <p className="text-muted-foreground text-sm">Manage your email preferences</p>
      </div>
      <div className="glass-panel rounded-md p-6 font-sans">
        <EmailSettings />
      </div>
    </div>
  );
}
