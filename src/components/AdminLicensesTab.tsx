import { useState, useEffect, FormEvent } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Copy,
  Check,
  Clock,
  Lock,
  Unlock,
  Mail,
  RefreshCw,
} from 'lucide-react';
import {
  generateLicenseKey,
  LicenseRecord,
  OrderRecord,
} from '../utils/licenseSecurity';

export const AdminLicensesTab = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [requireManualApproval, setRequireManualApproval] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // New license generator form
  const [newBuyerEmail, setNewBuyerEmail] = useState('');
  const [newUsersCount, setNewUsersCount] = useState(1);
  const [newMaxDownloads, setNewMaxDownloads] = useState(5);
  const [isCreatingLicense, setIsCreatingLicense] = useState(false);

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      const list: OrderRecord[] = [];
      snap.forEach((d) => list.push(d.data() as OrderRecord));
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setOrders(list);
    });

    const unsubLicenses = onSnapshot(collection(db, 'licenses'), (snap) => {
      const list: LicenseRecord[] = [];
      snap.forEach((d) => list.push(d.data() as LicenseRecord));
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setLicenses(list);
    });

    const unsubConfig = onSnapshot(doc(db, 'siteConfig', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.paymentSecurity?.requireManualApproval === false) {
          setRequireManualApproval(false);
        } else {
          setRequireManualApproval(true);
        }
      }
    });

    return () => {
      unsubOrders();
      unsubLicenses();
      unsubConfig();
    };
  }, []);

  const flashNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const handleToggleSecurityMode = async (strictMode: boolean) => {
    setRequireManualApproval(strictMode);
    try {
      await setDoc(
        doc(db, 'siteConfig', 'main'),
        {
          paymentSecurity: {
            requireManualApproval: strictMode,
            updatedAt: new Date().toISOString(),
          },
        },
        { merge: true }
      );
      flashNotice(
        strictMode
          ? 'Strict Admin Approval Mode enabled (100% protection against fake TX IDs).'
          : 'Automated Receipt Verification Mode enabled.'
      );
    } catch (err) {
      console.error('Error updating security mode:', err);
    }
  };

  const handleGenerateLicense = async (e: FormEvent) => {
    e.preventDefault();
    setIsCreatingLicense(true);
    try {
      const key = generateLicenseKey();
      const emailClean = newBuyerEmail.trim().toLowerCase() || 'any';
      const newLic: LicenseRecord = {
        licenseKey: key,
        buyerEmail: emailClean,
        paypalTxId: 'ADMIN-ISSUED',
        users: newUsersCount,
        amountPaid: newUsersCount * 20,
        status: 'active',
        downloadsCount: 0,
        maxDownloads: newMaxDownloads,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'licenses', key), newLic);
      setNewBuyerEmail('');
      flashNotice(`Generated & activated License Key: ${key}`);
    } catch (err) {
      console.error('Failed to generate license:', err);
    } finally {
      setIsCreatingLicense(false);
    }
  };

  const handleApproveOrder = async (ord: OrderRecord) => {
    try {
      const licKey = ord.licenseKey || generateLicenseKey();
      await updateDoc(doc(db, 'orders', ord.orderId), {
        status: 'verified',
        licenseKey: licKey,
      });

      // Also create a corresponding active license record in /licenses/{licKey}
      const newLic: LicenseRecord = {
        licenseKey: licKey,
        buyerEmail: ord.buyerEmail,
        paypalTxId: ord.paypalTxId,
        users: ord.users || 1,
        amountPaid: ord.amount || 20,
        status: 'active',
        downloadsCount: 0,
        maxDownloads: 5,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'licenses', licKey), newLic);
      flashNotice(`Order ${ord.orderId} approved! Customer download unlocked live.`);
    } catch (err) {
      console.error('Failed to approve order:', err);
    }
  };

  const handleRevokeOrder = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'revoked',
      });
      flashNotice(`Order ${orderId} revoked.`);
    } catch (err) {
      console.error('Failed to revoke order:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      flashNotice(`Order ${orderId} deleted.`);
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const handleToggleLicenseStatus = async (lic: LicenseRecord) => {
    const nextStatus = lic.status === 'active' ? 'revoked' : 'active';
    try {
      await updateDoc(doc(db, 'licenses', lic.licenseKey), {
        status: nextStatus,
      });
      flashNotice(`License ${lic.licenseKey} set to ${nextStatus}.`);
    } catch (err) {
      console.error('Failed to update license:', err);
    }
  };

  const handleDeleteLicense = async (licenseKey: string) => {
    try {
      await deleteDoc(doc(db, 'licenses', licenseKey));
      flashNotice(`License ${licenseKey} deleted.`);
    } catch (err) {
      console.error('Failed to delete license:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <ShieldCheck size={14} /> High-Security Payment & Download Gatekeeper
          </div>
          <h3 className="text-2xl font-bold text-white">
            PayPal Orders & License Keys Manager
          </h3>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Control download access, approve PayPal transactions in real time, and issue cryptographic License Keys.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs md:text-sm font-semibold flex items-center gap-2.5">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Security Mode Selector */}
      <div className="bg-[#0B1121] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <Lock size={18} className="text-[#ffa41b]" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Payment Verification Security Mode
            </h4>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              requireManualApproval
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            }`}
          >
            {requireManualApproval
              ? 'Strict Gatekeeper Active (Maximum Security)'
              : 'Auto-Receipt Validation Active'}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleToggleSecurityMode(true)}
            className={`p-4 rounded-xl border text-left transition-all space-y-1.5 ${
              requireManualApproval
                ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                : 'bg-[#131C31] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs md:text-sm">
              <span className="flex items-center gap-2">
                <Lock size={15} className="text-emerald-400" />
                Strict Admin Approval / License Key Only
              </span>
              {requireManualApproval && <Check size={16} className="text-emerald-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              100% immune to fake Transaction IDs. Customers who submit a PayPal TX ID wait on a live screen until you click <b>Approve</b> below (or enter a License Key you issued).
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleToggleSecurityMode(false)}
            className={`p-4 rounded-xl border text-left transition-all space-y-1.5 ${
              !requireManualApproval
                ? 'bg-amber-500/10 border-amber-500/50 text-white'
                : 'bg-[#131C31] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs md:text-sm">
              <span className="flex items-center gap-2">
                <Unlock size={15} className="text-amber-400" />
                Automated 17-Char PayPal TX Validation
              </span>
              {!requireManualApproval && <Check size={16} className="text-amber-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Automatically unlocks downloads when a customer launches PayPal checkout and submits a valid, unique 17-character PayPal Receipt ID + email.
            </p>
          </button>
        </div>
      </div>

      {/* Section 1: Live PayPal Orders & Verification Queue */}
      <div className="bg-[#0B1121] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Clock size={18} className="text-[#ffa41b]" />
            <span>PayPal Orders & Verification Requests ({orders.length})</span>
          </h4>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
            No PayPal transaction submissions yet. When a customer submits their PayPal Transaction ID, it will appear here live.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.orderId}
                className="p-4 rounded-xl bg-[#131C31] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white bg-black/40 px-2.5 py-1 rounded border border-white/10">
                      TX: {ord.paypalTxId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] uppercase ${
                        ord.status === 'verified'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : ord.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span className="text-[#ffa41b] font-bold">
                      ${ord.amount} USD ({ord.users} user{ord.users > 1 ? 's' : ''})
                    </span>
                  </div>

                  <div className="text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Mail size={12} /> {ord.buyerEmail}
                    </span>
                    {ord.licenseKey && (
                      <span className="font-mono text-teal-400">
                        Key: {ord.licenseKey}
                      </span>
                    )}
                    <span>{new Date(ord.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {ord.status !== 'verified' && (
                    <button
                      type="button"
                      onClick={() => handleApproveOrder(ord)}
                      className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0b0d12] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 size={14} /> Approve & Unlock Live
                    </button>
                  )}

                  {ord.status === 'verified' && (
                    <button
                      type="button"
                      onClick={() => handleRevokeOrder(ord.orderId)}
                      className="px-3 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle size={14} /> Revoke
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(ord.orderId)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
                    title="Delete Order"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Generate & Manage License Keys */}
      <div className="bg-[#0B1121] border border-white/10 rounded-2xl p-5 space-y-5">
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <KeyRound size={18} className="text-teal-400" />
          <span>Generate & Manage License Keys ({licenses.length})</span>
        </h4>

        <form
          onSubmit={handleGenerateLicense}
          className="grid sm:grid-cols-4 gap-3 bg-[#131C31] p-4 rounded-xl border border-white/10 items-end"
        >
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">
              Buyer Email (or leave blank for any email)
            </label>
            <input
              type="email"
              value={newBuyerEmail}
              onChange={(e) => setNewBuyerEmail(e.target.value)}
              placeholder="customer@email.com (optional)"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B1121] border border-white/10 text-xs text-white outline-none focus:border-teal-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">
              Users / Max Downloads
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={1}
                max={50}
                value={newUsersCount}
                onChange={(e) => setNewUsersCount(Number(e.target.value) || 1)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0B1121] border border-white/10 text-xs text-white outline-none"
                title="Number of users"
              />
              <input
                type="number"
                min={1}
                max={100}
                value={newMaxDownloads}
                onChange={(e) => setNewMaxDownloads(Number(e.target.value) || 5)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0B1121] border border-white/10 text-xs text-white outline-none"
                title="Max downloads allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreatingLicense}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-[#0B1121] font-black text-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus size={15} /> Generate License Key
          </button>
        </form>

        {licenses.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
            No license keys generated yet. Click "Generate License Key" above to create a verified key.
          </div>
        ) : (
          <div className="space-y-2.5">
            {licenses.map((lic) => (
              <div
                key={lic.licenseKey}
                className="p-3.5 rounded-xl bg-[#131C31] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-lg border border-teal-500/20">
                    {lic.licenseKey}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(lic.licenseKey)}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1"
                  >
                    {copiedId === lic.licenseKey ? (
                      <>
                        <Check size={12} className="text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy
                      </>
                    )}
                  </button>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      lic.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {lic.status}
                  </span>
                  <span className="text-slate-400">
                    Email: <b className="text-white">{lic.buyerEmail}</b>
                  </span>
                  <span className="text-slate-400">
                    Downloads: <b className="text-white">{lic.downloadsCount} / {lic.maxDownloads}</b>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleLicenseStatus(lic)}
                    className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-semibold flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    {lic.status === 'active' ? 'Revoke' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLicense(lic.licenseKey)}
                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
