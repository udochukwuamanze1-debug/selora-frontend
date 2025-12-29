import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ShieldCheck, UserPlus, Trash2 } from "lucide-react";

type GuardianPermissions = {
  viewRecords: boolean;
  accessRequests: boolean;
  prescriptionUpdates: boolean;
};

type TrustedContact = {
  id: string;
  name: string;
  address: string;
  permissions: GuardianPermissions;
  createdAt: string;
};

function keyFor(walletAddress: string) {
  return `selora_trusted_contacts_${walletAddress}`;
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function TrustedContacts({ walletAddress }: { walletAddress: string }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const [viewRecords, setViewRecords] = useState(true);
  const [accessRequests, setAccessRequests] = useState(true);
  const [prescriptionUpdates, setPrescriptionUpdates] = useState(false);

  const [contacts, setContacts] = useState<TrustedContact[]>(() =>
    safeParse(localStorage.getItem(keyFor(walletAddress)), [])
  );

  const persist = (next: TrustedContact[]) => {
    setContacts(next);
    localStorage.setItem(keyFor(walletAddress), JSON.stringify(next));
  };

  const canAdd = useMemo(() => {
    return name.trim().length > 0 && address.trim().length > 0;
  }, [name, address]);

  const addContact = () => {
    if (!canAdd) return;

    const next: TrustedContact = {
      id: crypto.randomUUID(),
      name: name.trim(),
      address: address.trim(),
      permissions: {
        viewRecords,
        accessRequests,
        prescriptionUpdates,
      },
      createdAt: new Date().toISOString(),
    };

    persist([next, ...contacts]);
    setName("");
    setAddress("");
    toast.success("Trusted contact added");
  };

  const remove = (id: string) => {
    persist(contacts.filter((c) => c.id !== id));
    toast.success("Removed");
  };

  const togglePermission = (
    id: string,
    key: keyof GuardianPermissions,
    value: boolean
  ) => {
    const next = contacts.map((c) =>
      c.id === id ? { ...c, permissions: { ...c.permissions, [key]: value } } : c
    );
    persist(next);
  };

  return (
    <section className="space-y-6" aria-label="Trusted Contacts">
      <header>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Trusted Contacts</h1>
        <p className="text-muted-foreground">
          Add guardians and control what they can do.
        </p>
      </header>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-semibold">Add a guardian</h2>
            <p className="text-sm text-muted-foreground">Permissions apply immediately.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Alex Johnson" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Wallet address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." />
          </div>
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
            <div>
              <p className="font-medium">View records</p>
              <p className="text-xs text-muted-foreground">Can view shared files</p>
            </div>
            <Switch checked={viewRecords} onCheckedChange={setViewRecords} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
            <div>
              <p className="font-medium">Access requests</p>
              <p className="text-xs text-muted-foreground">Can request access</p>
            </div>
            <Switch checked={accessRequests} onCheckedChange={setAccessRequests} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
            <div>
              <p className="font-medium">Prescription updates</p>
              <p className="text-xs text-muted-foreground">Can view updates</p>
            </div>
            <Switch checked={prescriptionUpdates} onCheckedChange={setPrescriptionUpdates} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button className="gap-2" onClick={addContact} disabled={!canAdd}>
            <UserPlus className="w-4 h-4" />
            Add contact
          </Button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">No trusted contacts yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <article key={c.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading font-semibold">{c.name}</h2>
                  <p className="text-sm text-muted-foreground break-all">{c.address}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(c.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                  <div>
                    <p className="font-medium">View records</p>
                    <p className="text-xs text-muted-foreground">Shared files</p>
                  </div>
                  <Switch
                    checked={c.permissions.viewRecords}
                    onCheckedChange={(v) => togglePermission(c.id, "viewRecords", v)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                  <div>
                    <p className="font-medium">Access requests</p>
                    <p className="text-xs text-muted-foreground">Request access</p>
                  </div>
                  <Switch
                    checked={c.permissions.accessRequests}
                    onCheckedChange={(v) => togglePermission(c.id, "accessRequests", v)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                  <div>
                    <p className="font-medium">Prescription updates</p>
                    <p className="text-xs text-muted-foreground">View updates</p>
                  </div>
                  <Switch
                    checked={c.permissions.prescriptionUpdates}
                    onCheckedChange={(v) => togglePermission(c.id, "prescriptionUpdates", v)}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
