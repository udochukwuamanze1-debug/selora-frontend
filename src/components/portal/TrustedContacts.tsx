import { useMemo, useState, useCallback } from "react";
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

function notificationsKeyFor(walletAddress: string) {
  return `selora_notifications_${walletAddress}`;
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Helper to send notification to a user by their wallet address
function sendNotificationToUser(
  targetWalletAddress: string,
  notification: {
    title: string;
    message: string;
    type: string;
  }
) {
  const notifKey = notificationsKeyFor(targetWalletAddress);
  const existing = safeParse<any[]>(localStorage.getItem(notifKey), []);
  
  const newNotification = {
    id: crypto.randomUUID(),
    ...notification,
    read: false,
    created_at: new Date().toISOString(),
    wallet_address: targetWalletAddress,
  };
  
  const updated = [newNotification, ...existing];
  localStorage.setItem(notifKey, JSON.stringify(updated));
  
  // Broadcast to other tabs via BroadcastChannel
  try {
    const channel = new BroadcastChannel("selora_notifications");
    channel.postMessage({ kind: "add", notification: newNotification });
    channel.close();
  } catch {
    // BroadcastChannel not supported
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

  const persist = useCallback((next: TrustedContact[]) => {
    setContacts(next);
    localStorage.setItem(keyFor(walletAddress), JSON.stringify(next));
  }, [walletAddress]);

  const canAdd = useMemo(() => {
    return name.trim().length > 0 && address.trim().length > 0;
  }, [name, address]);

  const addContact = useCallback(() => {
    if (!canAdd) return;

    const trimmedAddress = address.trim();
    const trimmedName = name.trim();

    const next: TrustedContact = {
      id: crypto.randomUUID(),
      name: trimmedName,
      address: trimmedAddress,
      permissions: {
        viewRecords,
        accessRequests,
        prescriptionUpdates,
      },
      createdAt: new Date().toISOString(),
    };

    persist([next, ...contacts]);
    
    // Send notification to the added user
    sendNotificationToUser(trimmedAddress, {
      title: "You've been added as a trusted contact",
      message: `${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)} has added you as a trusted contact with ${viewRecords ? "view records" : ""}${accessRequests ? ", access requests" : ""}${prescriptionUpdates ? ", prescription updates" : ""} permissions.`,
      type: "trusted_contact",
    });
    
    setName("");
    setAddress("");
    toast.success("Trusted contact added and notified");
  }, [canAdd, name, address, viewRecords, accessRequests, prescriptionUpdates, persist, contacts, walletAddress]);

  const remove = useCallback((id: string) => {
    const contactToRemove = contacts.find((c) => c.id === id);
    persist(contacts.filter((c) => c.id !== id));
    
    // Notify the removed user
    if (contactToRemove) {
      sendNotificationToUser(contactToRemove.address, {
        title: "Trusted contact access removed",
        message: `${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)} has removed you as a trusted contact.`,
        type: "trusted_contact_removed",
      });
    }
    
    toast.success("Contact removed and notified");
  }, [contacts, persist, walletAddress]);

  const togglePermission = useCallback(
    (id: string, key: keyof GuardianPermissions, value: boolean) => {
      const next = contacts.map((c) =>
        c.id === id ? { ...c, permissions: { ...c.permissions, [key]: value } } : c
      );
      persist(next);
      
      // Notify the user about permission change
      const contact = contacts.find((c) => c.id === id);
      if (contact) {
        sendNotificationToUser(contact.address, {
          title: "Trusted contact permissions updated",
          message: `${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)} has ${value ? "granted" : "revoked"} your "${key.replace(/([A-Z])/g, ' $1').toLowerCase()}" permission.`,
          type: "permission_change",
        });
      }
    },
    [contacts, persist, walletAddress]
  );

  return (
    <section className="space-y-6" aria-label="Trusted Contacts">
      <header>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Trusted Contacts</h1>
        <p className="text-muted-foreground">
          Add guardians and control what they can do. They'll be notified automatically.
        </p>
      </header>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-semibold">Add a guardian</h2>
            <p className="text-sm text-muted-foreground">Permissions apply immediately. The user will be notified.</p>
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
