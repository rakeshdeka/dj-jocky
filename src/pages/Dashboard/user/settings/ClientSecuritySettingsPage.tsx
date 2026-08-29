import SecuritySettings from '../../../../components/dashboard/profile/SecuritySettings';

export default function ClientSecuritySettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">SECURITY</h1>
        <p className="text-muted-foreground text-sm">Manage password and account security</p>
      </div>
      <div className="glass-panel rounded-md p-6 font-sans">
        <SecuritySettings />
      </div>
    </div>
  );
}
