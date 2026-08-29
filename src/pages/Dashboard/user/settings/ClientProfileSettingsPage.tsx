import UserProfileInfo from '../../../../components/dashboard/profile/UserProfileInfo';

export default function ClientProfileSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">PROFILE</h1>
        <p className="text-muted-foreground text-sm">Manage your personal information</p>
      </div>
      <div className="glass-panel rounded-md p-6 font-sans">
        <UserProfileInfo />
      </div>
    </div>
  );
}
