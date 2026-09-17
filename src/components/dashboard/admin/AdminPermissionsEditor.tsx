import { Checkbox } from '../ui/checkbox';
import {
  type AdminPermissions,
  EMPTY_ADMIN_PERMISSIONS,
} from '../../../lib/admin-access-api';

type AdminPermissionsEditorProps = {
  value: AdminPermissions;
  onChange: (next: AdminPermissions) => void;
  disabled?: boolean;
};

const clonePermissions = (value: AdminPermissions): AdminPermissions => ({
  ...value,
  settings: { ...EMPTY_ADMIN_PERMISSIONS.settings, ...value.settings },
});

export default function AdminPermissionsEditor({
  value,
  onChange,
  disabled,
}: AdminPermissionsEditorProps) {
  const setTopLevel = (key: keyof Omit<AdminPermissions, 'settings'>, checked: boolean) => {
    onChange({ ...clonePermissions(value), [key]: checked });
  };

  const setSettings = (key: keyof NonNullable<AdminPermissions['settings']>, checked: boolean) => {
    const next = clonePermissions(value);
    next.settings = { ...next.settings, [key]: checked };
    onChange(next);
  };

  const topLevel: { key: keyof Omit<AdminPermissions, 'settings'>; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'users', label: 'Users (clients & designers)' },
    { key: 'projects', label: 'Projects / briefs' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'meetings', label: 'Meetings' },
    { key: 'payments', label: 'Payments' },
  ];

  const settingsItems: { key: keyof NonNullable<AdminPermissions['settings']>; label: string }[] =
    [
      { key: 'categories', label: 'Categories' },
      { key: 'services', label: 'Services' },
      { key: 'plans', label: 'Plans' },
      { key: 'countries', label: 'Countries' },
      { key: 'currencies', label: 'Currencies' },
    ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
          Panel access
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {topLevel.map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2.5 cursor-pointer hover:bg-secondary/30"
            >
              <Checkbox
                checked={Boolean(value[item.key])}
                disabled={disabled}
                onCheckedChange={(c) => setTopLevel(item.key, c === true)}
              />
              <span className="text-sm">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
          Settings submenu
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {settingsItems.map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 rounded-lg border border-border/40 px-3 py-2 pl-4 cursor-pointer hover:bg-secondary/20"
            >
              <Checkbox
                checked={Boolean(value.settings?.[item.key])}
                disabled={disabled}
                onCheckedChange={(c) => setSettings(item.key, c === true)}
              />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Sub-admins need at least one settings permission to see the Settings section.
        </p>
      </div>
    </div>
  );
}
