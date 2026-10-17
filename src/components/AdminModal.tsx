import { useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';
import {
  Lock,
  X,
  LayoutDashboard,
  Eye,
  Layers,
  Image as ImageIcon,
  Briefcase,
  Settings2,
  Plus,
  Trash2,
  Video,
  Upload,
  Play,
  FileVideo,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Sliders,
  Check,
  ShieldCheck,
  LogOut,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { AppData } from '../types';
import { parseVideoUrl } from '../utils/videoUtils';
import { AdminLicensesTab } from './AdminLicensesTab';

// Authorized Gmail for Admin Panel Access
export const AUTHORIZED_ADMIN_EMAIL = 'nazrulcxd@gmail.com';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  updateData: (
    section: keyof AppData,
    id: string | number | null,
    field: string,
    value: any
  ) => void;
  addArrayItem: (section: keyof AppData, item: any) => void;
  removeArrayItem: (section: keyof AppData, id: string | number) => void;
  toggleVisibility: (section: string) => void;
  initialTab?: string;
  onNavigateToShop?: () => void;
}

export const AdminModal = ({
  isOpen,
  onClose,
  data,
  updateData,
  addArrayItem,
  removeArrayItem,
  toggleVisibility,
  initialTab,
  onNavigateToShop,
}: AdminModalProps) => {
  const [, setCurrentUser] = useState<User | null>(() => auth.currentUser);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const user = auth.currentUser;
    return Boolean(user && user.email?.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase());
  });

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab || 'licenses');
  const [isDragOver, setIsDragOver] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState('');

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email?.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  // Handle Google Sign-In with nazrulcxd@gmail.com
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userEmail = (user.email || '').trim().toLowerCase();

      if (userEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setIsAuthenticated(true);
        setErrorMsg('');
        try {
          sessionStorage.setItem('nazrul_admin_authed', 'true');
        } catch {
          // ignore
        }
      } else {
        // Unauthorized Google Account!
        await signOut(auth);
        setIsAuthenticated(false);
        try {
          sessionStorage.removeItem('nazrul_admin_authed');
        } catch {
          // ignore
        }
        setErrorMsg(
          `Access Denied: ${user.email} is not authorized. Only ${AUTHORIZED_ADMIN_EMAIL} can access this admin panel.`
        );
      }
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google sign-in was cancelled. Please try again.');
      } else if (error?.code === 'auth/popup-blocked') {
        setErrorMsg(
          'Browser popup was blocked. Please allow popups for this site or use the master password.'
        );
      } else {
        setErrorMsg(error?.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('nazrul_admin_authed');
    } catch {
      // ignore
    }
  };

  const navTabs = [
    { id: 'licenses', label: 'Orders & Licenses', icon: KeyRound },
    { id: 'shopVideo', label: 'Shop Demo Video', icon: Video },
    { id: 'global', label: 'Global & Hero', icon: LayoutDashboard },
    { id: 'visibility', label: 'Section Toggles', icon: Eye },
    { id: 'showcase', label: 'Project Showcase', icon: Layers },
    { id: 'portfolio', label: 'Portfolio Grid', icon: ImageIcon },
    { id: 'resume', label: 'Resume & Exp', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Settings2 },
  ];

  interface FieldDef {
    key: string;
    label: string;
    type?: string;
  }

  const renderArrayEditor = ({
    listKey,
    title,
    fields,
    template,
  }: {
    listKey: keyof AppData;
    title: string;
    fields: FieldDef[];
    template: any;
  }) => {
    const items = (data[listKey] as any[]) || [];
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={() => addArrayItem(listKey, template)}
            className="flex items-center gap-2 bg-teal-500/20 text-teal-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-500 hover:text-white transition-colors"
          >
            <Plus size={16} /> Add New
          </button>
        </div>

        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#0B1121] border border-white/5 rounded-2xl p-5 flex flex-col xl:flex-row gap-6 items-start relative group"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => removeArrayItem(listKey, item.id)}
                  className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {item.image !== undefined && (
                <div className="w-full xl:w-48 h-32 bg-[#131C31] rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={item.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                    className="w-full h-full object-cover"
                    alt="preview"
                  />
                </div>
              )}

              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className={`flex flex-col gap-1.5 ${
                      field.type === 'textarea' ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        rows={2}
                        value={item[field.key] || ''}
                        onChange={(e) =>
                          updateData(listKey, item.id, field.key, e.target.value)
                        }
                        className="w-full bg-[#131C31] border border-white/10 p-2.5 rounded-lg text-sm text-slate-300 focus:border-teal-400 outline-none transition-colors resize-none"
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={item[field.key] ?? ''}
                        onChange={(e) =>
                          updateData(
                            listKey,
                            item.id,
                            field.key,
                            field.type === 'number'
                              ? Number(e.target.value)
                              : e.target.value
                          )
                        }
                        className="w-full bg-[#131C31] border border-white/10 p-2.5 rounded-lg text-sm text-slate-300 focus:border-teal-400 outline-none transition-colors"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all">
      <div className="bg-[#131C31] w-full max-w-6xl h-[90vh] rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-white/10 bg-[#0B1121] shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <Lock size={22} className="text-teal-400" /> Advanced CMS Dashboard
            </h2>

            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>{AUTHORIZED_ADMIN_EMAIL}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-xs text-slate-300 hover:text-red-400 transition-all font-medium"
                title="Sign out of Admin session"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full"
              aria-label="Close Dashboard"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar navigation */}
            <div className="w-full md:w-64 bg-[#0B1121]/50 border-r border-white/5 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto shrink-0">
              {navTabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-teal-500 text-white shadow-lg'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <TabIcon size={18} /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content pane */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
              {activeTab === 'global' && (
                <div className="space-y-8 max-w-3xl">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-bold text-white">Hero Section Content</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-bold uppercase">
                        Hero Image URL
                      </label>
                      <input
                        type="text"
                        value={data.global.heroImage}
                        onChange={(e) =>
                          updateData('global', null, 'heroImage', e.target.value)
                        }
                        className="w-full bg-[#131C31] border border-white/10 p-3 rounded-xl text-white focus:border-teal-400 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-bold uppercase">
                        Main Title
                      </label>
                      <input
                        type="text"
                        value={data.global.heroTitle}
                        onChange={(e) =>
                          updateData('global', null, 'heroTitle', e.target.value)
                        }
                        className="w-full bg-[#131C31] border border-white/10 p-3 rounded-xl text-white focus:border-teal-400 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-400 font-bold uppercase">
                          Gradient Highlight
                        </label>
                        <input
                          type="text"
                          value={data.global.heroGradient}
                          onChange={(e) =>
                            updateData('global', null, 'heroGradient', e.target.value)
                          }
                          className="w-full bg-[#131C31] border border-white/10 p-3 rounded-xl text-white focus:border-teal-400 outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-400 font-bold uppercase">
                          Subtitle Text
                        </label>
                        <input
                          type="text"
                          value={data.global.heroSub}
                          onChange={(e) =>
                            updateData('global', null, 'heroSub', e.target.value)
                          }
                          className="w-full bg-[#131C31] border border-white/10 p-3 rounded-xl text-white focus:border-teal-400 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-bold uppercase">
                        Hero Description
                      </label>
                      <textarea
                        rows={3}
                        value={data.global.heroDesc}
                        onChange={(e) =>
                          updateData('global', null, 'heroDesc', e.target.value)
                        }
                        className="w-full bg-[#131C31] border border-white/10 p-3 rounded-xl text-white focus:border-teal-400 outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="border-b border-white/10 pb-4 pt-8">
                    <h3 className="text-xl font-bold text-white">Contact Information</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-bold uppercase">
                        Contact Email
                      </label>
                      <input
                        type="text"
                        value={data.global.contactEmail}
                        onChange={(e) =>
                          updateData('global', null, 'contactEmail', e.target.value)
                        }
                        className="w-full bg-[#131C31] border border-white/10 p-3 rounded-xl text-white focus:border-teal-400 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-bold uppercase">
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={data.global.contactPhone}
                        onChange={(e) =>
                          updateData('global', null, 'contactPhone', e.target.value)
                        }
                        className="w-full bg-[#131C31] border border-white/10 p-3 rounded-xl text-white focus:border-teal-400 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className="text-xs text-slate-400 font-bold uppercase">
                        Location Text
                      </label>
                      <input
                        type="text"
                        value={data.global.location}
                        onChange={(e) =>
                          updateData('global', null, 'location', e.target.value)
                        }
                        className="w-full bg-[#131C31] border border-white/10 p-3 rounded-xl text-white focus:border-teal-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'visibility' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="border-b border-white/10 pb-4 mb-8">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Section Visibility Manager
                    </h3>
                    <p className="text-sm text-slate-400">
                      Toggle switches to hide or show entire sections of your website instantly.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.keys(data.visibility).map((key) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-[#0B1121] border border-white/5 rounded-2xl"
                      >
                        <span className="text-white font-semibold capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()} Section
                        </span>
                        <button
                          onClick={() => toggleVisibility(key)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            data.visibility[key] ? 'bg-teal-500' : 'bg-slate-700'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              data.visibility[key] ? 'left-7' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'showcase' &&
                renderArrayEditor({
                  listKey: 'showcase',
                  title: 'Layered Project Showcase',
                  fields: [
                    { key: 'title', label: 'Project Title' },
                    { key: 'category', label: 'Category' },
                    { key: 'image', label: 'Image URL' },
                    { key: 'bg', label: 'Tailwind BG Class (e.g. bg-rose-50)' },
                    { key: 'desc', label: 'Description', type: 'textarea' },
                  ],
                  template: {
                    id: Date.now().toString(),
                    title: 'New Project',
                    category: 'Category',
                    desc: 'Description...',
                    tags: ['Design', 'Creative'],
                    bg: 'bg-slate-50',
                    text: 'text-slate-900',
                    border: 'border-slate-200',
                    image: '',
                  },
                })}

              {activeTab === 'portfolio' &&
                renderArrayEditor({
                  listKey: 'portfolio',
                  title: 'Selected Works (Grid)',
                  fields: [
                    { key: 'title', label: 'Project Title' },
                    { key: 'category', label: 'Category (Creates Filter Tab)' },
                    { key: 'image', label: 'Image URL' },
                    { key: 'desc', label: 'Description', type: 'textarea' },
                  ],
                  template: {
                    id: Date.now(),
                    title: 'New Work',
                    category: 'Packaging',
                    image: '',
                    desc: 'Description...',
                  },
                })}

              {activeTab === 'resume' && (
                <div className="space-y-16">
                  {renderArrayEditor({
                    listKey: 'experience',
                    title: 'Work Experience',
                    fields: [
                      { key: 'role', label: 'Job Role / Title' },
                      { key: 'company', label: 'Company Name' },
                      { key: 'year', label: 'Duration (e.g. 2020 - Present)' },
                      { key: 'desc', label: 'Job Description', type: 'textarea' },
                    ],
                    template: {
                      id: Date.now().toString(),
                      role: 'New Role',
                      company: 'Company',
                      year: '2024 - Present',
                      desc: 'Description...',
                    },
                  })}

                  {renderArrayEditor({
                    listKey: 'education',
                    title: 'Education',
                    fields: [
                      { key: 'degree', label: 'Degree / Certificate' },
                      { key: 'institution', label: 'Institution Name' },
                      { key: 'year', label: 'Duration' },
                      { key: 'desc', label: 'Description', type: 'textarea' },
                    ],
                    template: {
                      id: Date.now().toString(),
                      degree: 'New Degree',
                      institution: 'University',
                      year: '2020 - 2024',
                      desc: 'Description...',
                    },
                  })}
                </div>
              )}

              {activeTab === 'skills' &&
                renderArrayEditor({
                  listKey: 'skills',
                  title: 'Primary Skills Bars',
                  fields: [
                    { key: 'name', label: 'Skill Name' },
                    {
                      key: 'level',
                      label: 'Proficiency Percentage (0-100)',
                      type: 'number',
                    },
                    {
                      key: 'color',
                      label: 'Tailwind Color Class (e.g. bg-teal-500)',
                    },
                  ],
                  template: {
                    id: Date.now().toString(),
                    name: 'New Skill',
                    level: 80,
                    color: 'bg-teal-500',
                  },
                })}

              {activeTab === 'shopVideo' && (
                <div className="space-y-8 max-w-3xl">
                  {/* Header & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Video className="text-[#ffa41b]" size={22} />
                        Shop Interactive Demo & Video Manager
                      </h3>
                      <p className="text-xs md:text-sm text-slate-400 mt-1">
                        Upload your demo video file or paste a link. It will automatically play in the Shop's "Interactive Demo Active" section.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {onNavigateToShop && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToShop();
                          }}
                          className="px-3.5 py-1.5 rounded-lg border border-[#ffa41b]/30 bg-[#ffa41b]/10 hover:bg-[#ffa41b]/20 text-[#ffa41b] text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <ExternalLink size={13} /> View on Shop Page
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="p-4 rounded-xl bg-[#0B1121] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          data.shopVideo?.videoUrl
                            ? 'bg-emerald-400 animate-pulse'
                            : 'bg-[#ffa41b] animate-ping'
                        }`}
                      />
                      <div>
                        <div className="text-xs font-bold text-white">
                          Current Shop Mode:{' '}
                          {data.shopVideo?.videoUrl ? (
                            <span className="text-emerald-400">
                              Active Demo Video (
                              {parseVideoUrl(data.shopVideo.videoUrl).providerName || 'Configured'}
                              )
                            </span>
                          ) : (
                            <span className="text-[#ffa41b]">
                              Interactive Coupon Generator Simulation
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {data.shopVideo?.videoUrl
                            ? data.shopVideo.uploadedFileName
                              ? `Uploaded file: ${data.shopVideo.uploadedFileName} (${data.shopVideo.uploadedFileSize || 'Local'})`
                              : `Source URL: ${data.shopVideo.videoUrl.substring(0, 48)}...`
                            : 'Shows the live interactive 200 coupon/min simulator in the shop until a video is added.'}
                        </div>
                      </div>
                    </div>

                    {saveSuccessNotice && (
                      <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                        {saveSuccessNotice}
                      </span>
                    )}
                  </div>

                  {/* Option A: Upload Video File */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('video/')) {
                        const blobUrl = URL.createObjectURL(file);
                        const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
                        updateData('shopVideo', null, 'videoUrl', blobUrl);
                        updateData('shopVideo', null, 'uploadedFileName', file.name);
                        updateData('shopVideo', null, 'uploadedFileSize', sizeMb);
                        updateData('shopVideo', null, 'videoType', 'upload');
                        setSaveSuccessNotice('Video file loaded successfully!');
                        setTimeout(() => setSaveSuccessNotice(''), 3000);
                      }
                    }}
                    className={`p-6 rounded-2xl bg-[#0B1121] border transition-all space-y-4 ${
                      isDragOver
                        ? 'border-[#ffa41b] bg-[#ffa41b]/5 shadow-lg shadow-[#ffa41b]/10'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Upload size={16} className="text-[#ffa41b]" /> Option 1: Upload Video File
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        .mp4, .webm, .mov, .ogg
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      Drag & drop your screen recording or click below to choose a file from your computer. The video will be playable instantly in the shop.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <label className="cursor-pointer w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] font-bold text-sm rounded-xl hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-[#ffa41b]/20">
                        <FileVideo size={18} />
                        Choose Video File
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
                              // Use Object URL for smooth playback without high memory
                              const blobUrl = URL.createObjectURL(file);
                              updateData('shopVideo', null, 'videoUrl', blobUrl);
                              updateData('shopVideo', null, 'uploadedFileName', file.name);
                              updateData('shopVideo', null, 'uploadedFileSize', sizeMb);
                              updateData('shopVideo', null, 'videoType', 'upload');
                              setSaveSuccessNotice('Video file uploaded successfully!');
                              setTimeout(() => setSaveSuccessNotice(''), 3000);

                              // Also backup as base64 if small file (< 15MB) for session persistence
                              if (file.size < 15 * 1024 * 1024) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const result = event.target?.result as string;
                                  if (result) {
                                    updateData('shopVideo', null, 'videoUrl', result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }
                          }}
                        />
                      </label>

                      {data.shopVideo?.videoUrl && data.shopVideo?.uploadedFileName && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 size={15} />
                          <span>
                            {data.shopVideo.uploadedFileName} ({data.shopVideo.uploadedFileSize})
                          </span>
                        </div>
                      )}

                      {data.shopVideo?.videoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            updateData('shopVideo', null, 'videoUrl', '');
                            updateData('shopVideo', null, 'uploadedFileName', '');
                            updateData('shopVideo', null, 'uploadedFileSize', '');
                            setSaveSuccessNotice('Video removed. Simulation restored.');
                            setTimeout(() => setSaveSuccessNotice(''), 3000);
                          }}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 ml-auto sm:ml-0"
                        >
                          <Trash2 size={14} /> Remove Video
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Option B: Video Link Input */}
                  <div className="p-6 rounded-2xl bg-[#0B1121] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Video size={16} className="text-teal-400" /> Option 2: Paste Video Link
                      </h4>
                      {(() => {
                        const parsed = parseVideoUrl(data.shopVideo?.videoUrl);
                        if (parsed.type !== 'none' && parsed.providerName) {
                          return (
                            <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 flex items-center gap-1">
                              <Check size={12} /> {parsed.providerName} Detected
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                        <span>Video URL (YouTube, Vimeo, Loom, Google Drive, Dropbox, or MP4)</span>
                        {data.shopVideo?.videoUrl && (
                          <button
                            type="button"
                            onClick={() => updateData('shopVideo', null, 'videoUrl', '')}
                            className="text-[11px] text-slate-500 hover:text-red-400"
                          >
                            Clear URL
                          </button>
                        )}
                      </label>
                      <input
                        type="text"
                        value={data.shopVideo?.videoUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateData('shopVideo', null, 'videoUrl', val);
                          updateData('shopVideo', null, 'uploadedFileName', '');
                          updateData('shopVideo', null, 'videoType', 'url');
                          setSaveSuccessNotice('Video link updated!');
                          setTimeout(() => setSaveSuccessNotice(''), 3000);
                        }}
                        placeholder="e.g. https://www.youtube.com/watch?v=YOUR_VIDEO_ID or https://domain.com/demo.mp4"
                        className="w-full bg-[#131C31] border border-white/10 p-3 rounded-xl text-white text-sm focus:border-[#ffa41b] outline-none transition-colors"
                      />
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Supports: YouTube links (watch, share, or shorts), Vimeo URLs, Loom recordings, Google Drive preview links, Dropbox share links, or direct .mp4/.webm links.
                      </p>
                    </div>
                  </div>

                  {/* Option C: One-Click Demo Presets */}
                  <div className="p-6 rounded-2xl bg-[#0B1121] border border-white/5 space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-[#ffcf4a]" /> Option 3: Quick Demo Presets
                    </h4>
                    <p className="text-xs text-slate-400">
                      Test the interactive video player immediately with one of our ready-to-use sample demos:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          updateData(
                            'shopVideo',
                            null,
                            'videoUrl',
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                          );
                          updateData(
                            'shopVideo',
                            null,
                            'title',
                            'Serial Placer in Action · Illustrator Workflow'
                          );
                          updateData(
                            'shopVideo',
                            null,
                            'subtitle',
                            'Watch high-speed coupon batch numbering with auto-page distribution'
                          );
                          updateData('shopVideo', null, 'uploadedFileName', 'illustrator-sample-demo.mp4');
                          updateData('shopVideo', null, 'uploadedFileSize', '3.8 MB');
                          setSaveSuccessNotice('Sample MP4 video loaded!');
                          setTimeout(() => setSaveSuccessNotice(''), 3000);
                        }}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-[#ffa41b] flex items-center gap-1.5">
                          <Play size={13} /> Sample MP4 Video
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          HTML5 direct video file demo
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateData(
                            'shopVideo',
                            null,
                            'videoUrl',
                            'https://www.youtube.com/watch?v=L_LUpnjgPso'
                          );
                          updateData(
                            'shopVideo',
                            null,
                            'title',
                            'Adobe Illustrator Extension Tutorial'
                          );
                          updateData(
                            'shopVideo',
                            null,
                            'subtitle',
                            'Step-by-step setup and live numbering demonstration'
                          );
                          updateData('shopVideo', null, 'uploadedFileName', '');
                          setSaveSuccessNotice('Sample YouTube video loaded!');
                          setTimeout(() => setSaveSuccessNotice(''), 3000);
                        }}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-red-400 flex items-center gap-1.5">
                          <Video size={13} /> YouTube Demo
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Embed player with controls
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateData('shopVideo', null, 'videoUrl', '');
                          updateData('shopVideo', null, 'uploadedFileName', '');
                          updateData('shopVideo', null, 'uploadedFileSize', '');
                          setSaveSuccessNotice('Reset to interactive coupon generator!');
                          setTimeout(() => setSaveSuccessNotice(''), 3000);
                        }}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-teal-400 flex items-center gap-1.5">
                          <RefreshCw size={13} /> Coupon Simulator
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Default live simulated generator
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Section Display Customization */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <Sliders size={16} className="text-[#ffa41b]" /> Interactive Demo Section Content
                    </h4>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase">
                        Demo Heading Title
                      </label>
                      <input
                        type="text"
                        value={data.shopVideo?.title || ''}
                        onChange={(e) =>
                          updateData('shopVideo', null, 'title', e.target.value)
                        }
                        placeholder="Watch Serial Placer in Action"
                        className="w-full bg-[#131C31] border border-white/10 p-3 rounded-xl text-white text-sm focus:border-[#ffa41b] outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase">
                        Demo Subtitle / Description
                      </label>
                      <input
                        type="text"
                        value={data.shopVideo?.subtitle || ''}
                        onChange={(e) =>
                          updateData('shopVideo', null, 'subtitle', e.target.value)
                        }
                        placeholder="Watch it number 200 coupons in a few clicks"
                        className="w-full bg-[#131C31] border border-white/10 p-3 rounded-xl text-white text-sm focus:border-[#ffa41b] outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase">
                        Custom Poster / Cover Image URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={data.shopVideo?.posterImage || ''}
                        onChange={(e) =>
                          updateData('shopVideo', null, 'posterImage', e.target.value)
                        }
                        placeholder="https://images.unsplash.com/... or leave empty for default backdrop"
                        className="w-full bg-[#131C31] border border-white/10 p-3 rounded-xl text-white text-sm focus:border-[#ffa41b] outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap gap-6 pt-2">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs md:text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={data.shopVideo?.autoplay || false}
                          onChange={(e) =>
                            updateData('shopVideo', null, 'autoplay', e.target.checked)
                          }
                          className="w-4 h-4 accent-[#ffa41b] rounded"
                        />
                        <span>Auto-play video when clicked</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs md:text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={data.shopVideo?.loop || false}
                          onChange={(e) =>
                            updateData('shopVideo', null, 'loop', e.target.checked)
                          }
                          className="w-4 h-4 accent-[#ffa41b] rounded"
                        />
                        <span>Loop video continuously</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs md:text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={data.shopVideo?.muted || false}
                          onChange={(e) =>
                            updateData('shopVideo', null, 'muted', e.target.checked)
                          }
                          className="w-4 h-4 accent-[#ffa41b] rounded"
                        />
                        <span>Start muted</span>
                      </label>
                    </div>
                  </div>

                  {/* Live Video Preview in Admin */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Play size={16} className="text-emerald-400" /> Live Demo Player Preview
                      </span>
                      {data.shopVideo?.videoUrl && (
                        <span className="text-xs text-emerald-400 font-normal">
                          ● Video Active
                        </span>
                      )}
                    </h4>

                    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-[#232a38] bg-[#0B1121] flex items-center justify-center relative shadow-inner">
                      {(() => {
                        const parsed = parseVideoUrl(data.shopVideo?.videoUrl, data.shopVideo?.autoplay);
                        if (parsed.type === 'youtube' && parsed.embedUrl) {
                          return (
                            <iframe
                              src={parsed.embedUrl}
                              title="YouTube video player"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        }
                        if (parsed.type === 'vimeo' && parsed.embedUrl) {
                          return (
                            <iframe
                              src={parsed.embedUrl}
                              title="Vimeo video player"
                              className="w-full h-full border-0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        }
                        if ((parsed.type === 'loom' || parsed.type === 'gdrive') && parsed.embedUrl) {
                          return (
                            <iframe
                              src={parsed.embedUrl}
                              title="Video player"
                              className="w-full h-full border-0"
                              allowFullScreen
                            />
                          );
                        }
                        if (parsed.type === 'html5' && parsed.directUrl) {
                          return (
                            <video
                              src={parsed.directUrl}
                              poster={data.shopVideo?.posterImage}
                              controls
                              autoPlay={data.shopVideo?.autoplay}
                              loop={data.shopVideo?.loop}
                              muted={data.shopVideo?.muted}
                              className="w-full h-full object-contain"
                            />
                          );
                        }
                        return (
                          <div className="text-center p-6 space-y-2">
                            <div className="w-12 h-12 rounded-full bg-[#ffa41b]/10 text-[#ffa41b] flex items-center justify-center mx-auto">
                              <Play size={20} className="ml-0.5" />
                            </div>
                            <p className="text-sm font-bold text-white">
                              Interactive Coupon Generator Simulation Active
                            </p>
                            <p className="text-xs text-slate-500 max-w-sm">
                              No external video is set yet. The shop will display the live interactive coupon numbering simulator. Upload a video file or paste a link above to display your video walkthrough.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'licenses' && <AdminLicensesTab />}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] p-4">
            <div className="bg-[#0B1121] p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6 w-full max-w-md shadow-2xl relative">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500/20 to-emerald-500/10 text-teal-400 rounded-3xl border border-teal-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/10">
                  <ShieldCheck size={42} />
                </div>
                <h3 className="text-2xl text-white font-bold tracking-tight">Admin Sign In</h3>
                <p className="text-sm text-slate-400">
                  Firebase Google Authentication Protected
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
                  <span>Authorized Only:</span>
                  <span className="font-bold">{AUTHORIZED_ADMIN_EMAIL}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-500/15 border border-red-500/30 text-red-300 text-xs leading-relaxed text-center rounded-2xl animate-shake">
                  {errorMsg}
                </div>
              )}

              {/* Exclusive Google Sign In with nazrulcxd@gmail.com */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 px-6 rounded-2xl shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSigningIn ? (
                    <Loader2 size={20} className="animate-spin text-slate-700" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span className="text-sm sm:text-base font-semibold">
                    {isSigningIn ? 'Authenticating...' : 'Sign in with Google'}
                  </span>
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Restricted strictly to <b className="text-slate-400">{AUTHORIZED_ADMIN_EMAIL}</b> via Firebase Authentication.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
