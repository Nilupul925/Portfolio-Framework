import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient.js';

const STORAGE_BUCKET = 'portfolio-images'; //This use for store the images in supabase storage bucket.

// Function to create an icon component from SVG paths
const createIcon = (paths) => ({ className = "w-4 h-4", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {paths}
  </svg>
);
const Eye = createIcon(<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>);
const LayoutDashboard = createIcon(<><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></>);
const Plus = createIcon(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>);
const Trash2 = createIcon(<><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>);
const Edit3 = createIcon(<><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>);
const Check = createIcon(<polyline points="20 6 9 17 4 12" />);
const X = createIcon(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);
const AlertCircle = createIcon(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>);
const Mail = createIcon(<><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>);
const LogOut = createIcon(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>);
const RefreshCw = createIcon(<><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></>);

//The AdminHub component is the main component for the admin panel. It will contain the logic and UI for managing the portfolio images and other admin functionalities.
export default function AdminHub() {
  // State variables for managing session, authentication status, email, password, and login state
  const [session, setSession] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(Boolean(supabase));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // APP STATE
  const [toastMsg, setToastMsg] = useState('');
  const [isErrorToast, setIsErrorToast] = useState(false);
  const toastTimeoutRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('project');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // PORTFOLIO DATA
  const [profile, setProfile] = useState({
    name: '',
    headline: '',
    tagline: '',
    bio: '',
    phone: '',
    email: '',
    linkedin: '',
    github: '',
    location: '',
    avatarUrl: ''
  });
  const [caseStudies, setCaseStudies] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [communityActivities, setCommunityActivities] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [messagesList, setMessagesList] = useState([]);

  // ATS CV DATA
  const [atsCvData, setAtsCvData] = useState({
    fullName: '',
    title: '',
    phone: '',
    email: '',
    linkedin: '',
    address: '',
    summary: '',
    hardSkills: [],
    softSkills: []
  });
  const [newHardSkill, setNewHardSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [cvProjects, setCvProjects] = useState([]);
  const [cvWork, setCvWork] = useState([]);
  const [cvEducation, setCvEducation] = useState([]);
  const [cvRefs, setCvRefs] = useState([]);

  // Toast handler with timer cleanup
  const triggerToast = (msg, isError = false) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setIsErrorToast(isError);
    setToastMsg(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg('');
    }, 4000);
  };

  // Keyboard shortcut for closing modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Fetch data from Supabase on component mount
  const fetchData = async () => {
    if (!supabase) {
      setIsLoading(false);
      triggerToast("Supabase client unavailable. Check environment variables.", true);
      return;
    }

    setIsLoading(true);

    try {
      const results = await Promise.allSettled([
        supabase.from('profile').select('*').eq('id', 1).maybeSingle(),
        supabase.from('projects').select('*').order('id', { ascending: true }),
        supabase.from('skills').select('*').order('id', { ascending: true }),
        supabase.from('education').select('*').order('id', { ascending: true }),
        supabase.from('certifications').select('*').order('id', { ascending: true }),
        supabase.from('activities').select('*').order('id', { ascending: true }),
        supabase.from('testimonials').select('*').order('id', { ascending: true }),
        supabase.from('messages').select('*').order('id', { ascending: false }),
        supabase.from('cv_metadata').select('*').eq('id', 1).maybeSingle(),
        supabase.from('cv_projects').select('*').order('id', { ascending: true }),
        supabase.from('cv_work').select('*').order('id', { ascending: true }),
        supabase.from('cv_education').select('*').order('id', { ascending: true }),
        supabase.from('cv_references').select('*').order('id', { ascending: true }),
      ]);

      const [
        profRes, projRes, skillRes, eduRes, certRes,
        actRes, testRes, msgRes, cvMetaRes, cvProjRes,
        cvWorkRes, cvEduRes, cvRefRes
      ] = results;

      if (profRes.status === 'fulfilled' && profRes.value.data) {
        const p = profRes.value.data;
        setProfile({
          name: p.name || '',
          headline: p.headline || '',
          tagline: p.tagline || '',
          bio: p.bio || '',
          phone: p.phone || '',
          email: p.email || '',
          linkedin: p.linkedin || '',
          github: p.github || '',
          location: p.location || '',
          avatarUrl: p.avatar_url || ''
        });
      }

      if (projRes.status === 'fulfilled' && projRes.value.data) {
        setCaseStudies(projRes.value.data.map(p => ({
          ...p,
          tools: Array.isArray(p.tools) ? p.tools : [],
          proofImageUrl: p.proof_image_url || ''
        })));
      }

      if (skillRes.status === 'fulfilled' && skillRes.value.data) {
        setSkillsList(skillRes.value.data.map(s => ({
          ...s,
          logoUrl: s.logo_url || ''
        })));
      }

      if (eduRes.status === 'fulfilled' && eduRes.value.data) {
        setEducationList(eduRes.value.data.map(e => ({
          ...e,
          modules: Array.isArray(e.modules) ? e.modules : [],
          logoUrl: e.logo_url || ''
        })));
      }

      if (certRes.status === 'fulfilled' && certRes.value.data) {
        setCertifications(certRes.value.data.map(c => ({
          ...c,
          credentialUrl: c.credential_url || '',
          badgeLogoUrl: c.badge_logo_url || '',
          certImageUrl: c.cert_image_url || ''
        })));
      }

      if (actRes.status === 'fulfilled' && actRes.value.data) {
        setCommunityActivities(actRes.value.data);
      }

      if (testRes.status === 'fulfilled' && testRes.value.data) {
        setTestimonials(testRes.value.data);
      }

      if (msgRes.status === 'fulfilled' && msgRes.value.data) {
        setMessagesList(msgRes.value.data);
      }

      if (cvMetaRes.status === 'fulfilled' && cvMetaRes.value.data) {
        const m = cvMetaRes.value.data;
        setAtsCvData({
          fullName: m.full_name || '',
          title: m.title || '',
          phone: m.phone || '',
          email: m.email || '',
          linkedin: m.linkedin || '',
          address: m.address || '',
          summary: m.summary || '',
          hardSkills: Array.isArray(m.hard_skills) ? m.hard_skills : [],
          softSkills: Array.isArray(m.soft_skills) ? m.soft_skills : []
        });
      }

      if (cvProjRes.status === 'fulfilled' && cvProjRes.value.data) {
        setCvProjects(cvProjRes.value.data);
      }

      if (cvWorkRes.status === 'fulfilled' && cvWorkRes.value.data) {
        setCvWork(cvWorkRes.value.data);
      }

      if (cvEduRes.status === 'fulfilled' && cvEduRes.value.data) {
        setCvEducation(cvEduRes.value.data.map(e => ({
          ...e,
          keyPoints: e.key_points || ''
        })));
      }

      if (cvRefRes.status === 'fulfilled' && cvRefRes.value.data) {
        setCvRefs(cvRefRes.value.data);
      }

    } catch (error) {
      console.error("Fetch error:", error);
      triggerToast("Error syncing with Supabase.", true);
    } finally {
      setIsLoading(false);
    }
  };

  // Authentication state management
  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    // Check existing session once
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setIsAuthChecking(false);
      if (session) {
        fetchData();
      }
    }).catch(err => {
      console.error("Session verification error:", err);
      if (isMounted) setIsAuthChecking(false);
    });

    // Listen for subsequent auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      if (event === 'SIGNED_IN' && newSession) {
        fetchData();
      }
      if (event === 'SIGNED_OUT') {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      triggerToast("Supabase client unavailable. Check environment variables.", true);
      return;
    }
    setIsLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      if (error) {
        triggerToast(error.message, true);
      } else if (data?.session) {
        triggerToast("Login successful!");
      }
    } catch (err) {
      triggerToast(err.message || "Failed to log in", true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setSession(null);
      triggerToast("Logged out successfully.");
    } catch (err) {
      triggerToast(`Logout failed: ${err.message}`, true);
    }
  };

  // Function to handle image uploads to Supabase Storage with a fallback to Data URL
  const handleCloudImageUpload = async (file, callback) => {
    if (!file) return;

    // Check file size (max 5MB recommended)
    if (file.size > 5 * 1024 * 1024) {
      triggerToast("Image file size exceeds 5MB limit. Please choose a smaller image.", true);
      return;
    }

    setIsUploading(true);
    triggerToast('Uploading image...');

    const fileExt = file.name.split('.').pop();
    const sanitizedName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    try {
      if (!supabase) throw new Error("Supabase unavailable");

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(sanitizedName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(sanitizedName);

      if (data?.publicUrl) {
        callback(data.publicUrl);
        triggerToast('Image uploaded to Supabase Storage!');
      } else {
        throw new Error("Could not retrieve public image URL.");
      }
    } catch (error) {
      console.warn('Storage bucket upload failed, using Data URL fallback:', error);
      const reader = new FileReader();
      reader.onload = (e) => {
        callback(e.target.result);
        triggerToast('Image attached (Local Data URL fallback).');
      };
      reader.onerror = () => {
        triggerToast("Failed to read image file.", true);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to save profile data and cv metadata to Supabase
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!supabase) {
      triggerToast("Supabase client unavailable.", true);
      return;
    }
    setIsSubmitting(true);
    const payload = {
      id: 1,
      name: profile.name.trim(),
      headline: profile.headline.trim(),
      tagline: profile.tagline.trim(),
      bio: profile.bio.trim(),
      phone: profile.phone.trim(),
      email: profile.email.trim(),
      linkedin: profile.linkedin.trim(),
      github: profile.github.trim(),
      location: profile.location.trim(),
      avatar_url: profile.avatarUrl
    };

    try {
      const { error } = await supabase.from('profile').upsert(payload, { onConflict: 'id' });
      if (!error) {
        triggerToast('Profile saved to Cloud DB!');
      } else {
        triggerToast(`Failed to save profile: ${error.message}`, true);
      }
    } catch (err) {
      triggerToast(`Network error: ${err.message}`, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCvMeta = async (e) => {
    e.preventDefault();
    if (!supabase) {
      triggerToast("Supabase client unavailable.", true);
      return;
    }
    setIsSubmitting(true);
    const payload = {
      id: 1,
      full_name: atsCvData.fullName.trim(),
      title: atsCvData.title.trim(),
      phone: atsCvData.phone.trim(),
      email: atsCvData.email.trim(),
      linkedin: atsCvData.linkedin.trim(),
      address: atsCvData.address.trim(),
      summary: atsCvData.summary.trim(),
      hard_skills: atsCvData.hardSkills,
      soft_skills: atsCvData.softSkills
    };

    try {
      const { error } = await supabase.from('cv_metadata').upsert(payload, { onConflict: 'id' });
      if (!error) {
        triggerToast('ATS CV Metadata & Skills saved to DB!');
      } else {
        triggerToast(`Failed to save CV Metadata: ${error.message}`, true);
      }
    } catch (err) {
      triggerToast(`Network error: ${err.message}`, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to open the CRUD modal for adding or editing records
  const openCrudModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);

    if (!item) {
      if (type === 'project') setFormData({ title: '', category: '', status: 'COMPLETED', summary: '', tools: '', github: '', proofImageUrl: '' });
      if (type === 'skill') setFormData({ name: '', category: '', proficiency: 'Advanced', logoUrl: '' });
      if (type === 'education') setFormData({ degree: '', institution: '', period: '', location: '', modules: '', logoUrl: '' });
      if (type === 'cert') setFormData({ type: 'badge', title: '', org: '', date: '', credentialUrl: '', badgeLogoUrl: '', certImageUrl: '' });
      if (type === 'activity') setFormData({ type: 'Volunteering & Community', title: '', entity: '', period: '', description: '' });
      if (type === 'testimonial') setFormData({ quote: '', author: '', role: '' });
      if (type === 'cv_project') setFormData({ title: '', date: '', summary: '' });
      if (type === 'cv_work') setFormData({ role: '', company: '', location: '', period: '', description: '' });
      if (type === 'cv_education') setFormData({ degree: '', institution: '', period: '', location: '', keyPoints: '' });
      if (type === 'cv_ref') setFormData({ name: '', designation: '', institution: '', contact: '' });
    } else {
      const data = { ...item };
      if (type === 'project') data.tools = Array.isArray(item.tools) ? item.tools.join(', ') : (item.tools || '');
      if (type === 'education') data.modules = Array.isArray(item.modules) ? item.modules.join(', ') : (item.modules || '');
      if (type === 'cv_education') data.keyPoints = item.keyPoints || item.key_points || '';
      setFormData(data);
    }
    setIsModalOpen(true);
  };

  const saveRecord = async (table, payload, isEdit, editId) => {
    if (!supabase) throw new Error('Supabase client unavailable. Please check your credentials.');

    if (isEdit) {
      const { data, error } = await supabase.from(table).update(payload).eq('id', editId).select().maybeSingle();
      if (error) throw error;
      return data || { ...payload, id: editId };
    } else {
      // Try insert without manual id so PostgreSQL identity generates it
      const { data, error } = await supabase.from(table).insert([payload]).select().maybeSingle();
      if (!error && data) {
        return data;
      }

      // Only fallback if the error is specifically due to a missing/null ID in non-auto-incrementing schemas
      if (error && error.message && (error.message.includes('null value in column "id"') || error.message.includes('violates not-null constraint'))) {
        const fallbackId = Date.now();
        const { data: fallbackData, error: fallbackError } = await supabase.from(table).insert([{ ...payload, id: fallbackId }]).select().maybeSingle();
        if (fallbackError) throw fallbackError;
        return fallbackData || { ...payload, id: fallbackId };
      }

      if (error) throw error;
      return data || payload;
    }
  };

  const submitCrudModal = async (e) => {
    e.preventDefault();
    if (!supabase) {
      triggerToast("Supabase client unavailable.", true);
      return;
    }

    setIsSubmitting(true);
    const isEdit = !!editingItem;
    const editId = isEdit ? editingItem.id : null;

    try {
      if (modalType === 'project') {
        const parsedTools = Array.isArray(formData.tools) 
          ? formData.tools 
          : (formData.tools || '').split(',').map(t => t.trim()).filter(Boolean);
        const payload = {
          title: (formData.title || '').trim(),
          category: (formData.category || '').trim(),
          status: formData.status || 'COMPLETED',
          summary: (formData.summary || '').trim(),
          github: (formData.github || '').trim(),
          proof_image_url: formData.proofImageUrl || '',
          tools: parsedTools
        };
        const saved = await saveRecord('projects', payload, isEdit, editId);
        const newStateObj = { ...saved, proofImageUrl: saved.proof_image_url || payload.proof_image_url, tools: parsedTools };
        setCaseStudies(prev => isEdit ? prev.map(i => i.id === editId ? { ...i, ...newStateObj } : i) : [...prev, newStateObj]);
        triggerToast(`Project ${isEdit ? 'Updated' : 'Added'}!`);
      }
      else if (modalType === 'skill') {
        const payload = {
          name: (formData.name || '').trim(),
          category: (formData.category || '').trim(),
          proficiency: formData.proficiency || 'Advanced',
          logo_url: formData.logoUrl || ''
        };
        const saved = await saveRecord('skills', payload, isEdit, editId);
        const newStateObj = { ...saved, logoUrl: saved.logo_url || payload.logo_url };
        setSkillsList(prev => isEdit ? prev.map(i => i.id === editId ? { ...i, ...newStateObj } : i) : [...prev, newStateObj]);
        triggerToast(`Tool/Skill ${isEdit ? 'Updated' : 'Added'}!`);
      }
      else if (modalType === 'education') {
        const parsedModules = Array.isArray(formData.modules) 
          ? formData.modules 
          : (formData.modules || '').split(',').map(t => t.trim()).filter(Boolean);
        const payload = {
          degree: (formData.degree || '').trim(),
          institution: (formData.institution || '').trim(),
          period: (formData.period || '').trim(),
          location: (formData.location || '').trim(),
          logo_url: formData.logoUrl || '',
          modules: parsedModules
        };
        const saved = await saveRecord('education', payload, isEdit, editId);
        const newStateObj = { ...saved, logoUrl: saved.logo_url || payload.logo_url, modules: parsedModules };
        setEducationList(prev => isEdit ? prev.map(i => i.id === editId ? { ...i, ...newStateObj } : i) : [...prev, newStateObj]);
        triggerToast(`Education ${isEdit ? 'Updated' : 'Added'}!`);
      }
      else if (modalType === 'cert') {
        const payload = {
          type: formData.type || 'badge',
          title: (formData.title || '').trim(),
          org: (formData.org || '').trim().toUpperCase(),
          date: (formData.date || '').trim(),
          credential_url: (formData.credentialUrl || '').trim(),
          badge_logo_url: formData.badgeLogoUrl || '',
          cert_image_url: formData.certImageUrl || ''
        };
        const saved = await saveRecord('certifications', payload, isEdit, editId);
        const newStateObj = {
          ...saved,
          credentialUrl: saved.credential_url ?? payload.credential_url,
          badgeLogoUrl: saved.badge_logo_url ?? payload.badge_logo_url,
          certImageUrl: saved.cert_image_url ?? payload.cert_image_url
        };
        setCertifications(prev => isEdit ? prev.map(i => i.id === editId ? { ...i, ...newStateObj } : i) : [...prev, newStateObj]);
        triggerToast(`Credential ${isEdit ? 'Updated' : 'Added'}!`);
      }
      else if (modalType === 'activity') {
        const payload = {
          type: (formData.type || 'Volunteering & Community').trim(),
          title: (formData.title || '').trim(),
          entity: (formData.entity || '').trim(),
          period: (formData.period || '').trim(),
          description: (formData.description || '').trim()
        };
        const saved = await saveRecord('activities', payload, isEdit, editId);
        setCommunityActivities(prev => isEdit ? prev.map(i => i.id === editId ? { ...i, ...saved } : i) : [...prev, saved]);
        triggerToast(`Activity ${isEdit ? 'Updated' : 'Added'}!`);
      }
      else if (modalType === 'testimonial') {
        const payload = {
          quote: (formData.quote || '').trim(),
          author: (formData.author || '').trim(),
          role: (formData.role || '').trim()
        };
        const saved = await saveRecord('testimonials', payload, isEdit, editId);
        setTestimonials(prev => isEdit ? prev.map(i => i.id === editId ? { ...i, ...saved } : i) : [...prev, saved]);
        triggerToast(`Endorsement ${isEdit ? 'Updated' : 'Added'}!`);
      }
      else if (modalType === 'cv_project') {
        const payload = {
          title: (formData.title || '').trim(),
          date: (formData.date || '').trim(),
          summary: (formData.summary || '').trim()
        };
        const saved = await saveRecord('cv_projects', payload, isEdit, editId);
        setCvProjects(prev => isEdit ? prev.map(i => i.id === editId ? { ...i, ...saved } : i) : [...prev, saved]);
        triggerToast('CV Project Saved!');
      }
      else if (modalType === 'cv_work') {
        const payload = {
          role: (formData.role || '').trim(),
          company: (formData.company || '').trim(),
          location: (formData.location || '').trim(),
          period: (formData.period || '').trim(),
          description: (formData.description || '').trim()
        };
        const saved = await saveRecord('cv_work', payload, isEdit, editId);
        setCvWork(prev => isEdit ? prev.map(i => i.id === editId ? { ...i, ...saved } : i) : [...prev, saved]);
        triggerToast('CV Experience Saved!');
      }
      else if (modalType === 'cv_education') {
        const payload = {
          degree: (formData.degree || '').trim(),
          institution: (formData.institution || '').trim(),
          location: (formData.location || '').trim(),
          period: (formData.period || '').trim(),
          key_points: (formData.keyPoints || '').trim()
        };
        const saved = await saveRecord('cv_education', payload, isEdit, editId);
        const newState = { ...saved, keyPoints: saved.key_points ?? payload.key_points };
        setCvEducation(prev => isEdit ? prev.map(i => i.id === editId ? { ...i, ...newState } : i) : [...prev, newState]);
        triggerToast('CV Education Saved!');
      }
      else if (modalType === 'cv_ref') {
        const payload = {
          name: (formData.name || '').trim(),
          designation: (formData.designation || '').trim(),
          institution: (formData.institution || '').trim(),
          contact: (formData.contact || '').trim()
        };
        const saved = await saveRecord('cv_references', payload, isEdit, editId);
        setCvRefs(prev => isEdit ? prev.map(i => i.id === editId ? { ...i, ...saved } : i) : [...prev, saved]);
        triggerToast('CV Reference Saved!');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      triggerToast(`Database Error: ${err.message}`, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (table, id, stateSetter) => {
    if (!supabase) {
      triggerToast("Supabase client unavailable.", true);
      return;
    }

    if (!window.confirm('Delete this record permanently from the database?')) return;

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) {
        stateSetter(prev => prev.filter(item => item.id !== id));
        triggerToast('Record deleted.');
      } else {
        triggerToast(`Failed to delete: ${error.message}`, true);
      }
    } catch (err) {
      triggerToast(`Error: ${err.message}`, true);
    }
  };

  // Helper for adding hard skills to CV
  const handleAddHardSkill = () => {
    const trimmed = newHardSkill.trim();
    if (!trimmed) return;
    if (atsCvData.hardSkills.includes(trimmed)) {
      triggerToast("Skill already added.", true);
      return;
    }
    setAtsCvData({ ...atsCvData, hardSkills: [...atsCvData.hardSkills, trimmed] });
    setNewHardSkill('');
  };

  // Helper for adding soft skills to CV
  const handleAddSoftSkill = () => {
    const trimmed = newSoftSkill.trim();
    if (!trimmed) return;
    if (atsCvData.softSkills.includes(trimmed)) {
      triggerToast("Skill already added.", true);
      return;
    }
    setAtsCvData({ ...atsCvData, softSkills: [...atsCvData.softSkills, trimmed] });
    setNewSoftSkill('');
  };

  // Render a loading screen while checking authentication
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-cyan-400 font-mono text-sm gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Verifying Security Credentials...</span>
      </div>
    );
  }

  // Render the login form if no session is present
  if (!session) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-100 font-sans px-4">
        {toastMsg && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-xs shadow-2xl animate-in fade-in ${
            isErrorToast ? 'bg-rose-950 border-rose-500/40 text-rose-300' : 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
          }`}>
            {isErrorToast ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
            <span>{toastMsg}</span>
          </div>
        )}
        <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold font-mono tracking-wide">ADMIN LOGIN</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-mono mb-1 block">Admin Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-mono mb-1 block">Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full py-3 mt-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl cursor-pointer transition-colors flex justify-center items-center gap-2"
            >
              {isLoggingIn ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render the main admin panel if authenticated
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans flex flex-col">
      {toastMsg && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-xs shadow-2xl animate-in fade-in ${
          isErrorToast ? 'bg-rose-950 border-rose-500/40 text-rose-300' : 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
        }`}>
          {isErrorToast ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide font-mono">Operational Panel</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30">CLOUD DB</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Admin: {session?.user?.email || 'Admin'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={fetchData}
            title="Refresh database records"
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => {
              const portfolioUrl = import.meta.env.VITE_PORTFOLIO_URL || 'http://localhost:5173';
              window.open(portfolioUrl, '_blank', 'noopener,noreferrer');
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] font-mono text-xs cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View Portfolio</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-rose-400 border border-slate-700 hover:border-rose-500/50 font-bold flex items-center gap-2 transition-all font-mono text-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-12">

        {/* LOADING INDICATOR BAR */}
        {isLoading && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-mono flex items-center justify-center gap-2 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Syncing database records with Supabase...</span>
          </div>
        )}

        {/* PORTFOLIO APP DATA ENGINE */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-cyan-400 border-b border-cyan-500/30 pb-2">🔅 Portfolio Data Engine</h2>
          
          {/* 1. HERO & CONTACT */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white">1. Hero Profile & Main Contact Info</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img src={profile.avatarUrl || 'https://via.placeholder.com/80'} className="w-16 h-16 rounded-full border border-cyan-400 object-cover bg-slate-950 shrink-0" alt="Avatar"/>
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => handleCloudImageUpload(e.target.files[0], (url) => setProfile({ ...profile, avatarUrl: url }))}
                      className="file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-slate-950 file:font-bold cursor-pointer text-slate-400"
                    />
                    {profile.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, avatarUrl: '' })}
                        className="px-2.5 py-1 text-rose-400 hover:bg-slate-900 rounded border border-slate-800"
                      >
                        Remove Avatar
                      </button>
                    )}
                  </div>
                  
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-slate-400 block mb-1">Full Name</label><input type="text" value={profile.name} onChange={e=>setProfile({...profile, name: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div><label className="text-slate-400 block mb-1">Availability Tagline</label><input type="text" value={profile.tagline} onChange={e=>setProfile({...profile, tagline: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div className="sm:col-span-2"><label className="text-slate-400 block mb-1">Headline</label><input type="text" value={profile.headline} onChange={e=>setProfile({...profile, headline: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div className="sm:col-span-2"><label className="text-slate-400 block mb-1">Bio</label><textarea rows="3" value={profile.bio} onChange={e=>setProfile({...profile, bio: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white resize-none" /></div>
                <div><label className="text-slate-400 block mb-1">Phone</label><input type="text" value={profile.phone} onChange={e=>setProfile({...profile, phone: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div><label className="text-slate-400 block mb-1">Email</label><input type="email" value={profile.email} onChange={e=>setProfile({...profile, email: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div><label className="text-slate-400 block mb-1">LinkedIn URL</label><input type="text" value={profile.linkedin} onChange={e=>setProfile({...profile, linkedin: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div><label className="text-slate-400 block mb-1">GitHub URL</label><input type="text" value={profile.github} onChange={e=>setProfile({...profile, github: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div className="sm:col-span-2"><label className="text-slate-400 block mb-1">Current Location</label><input type="text" value={profile.location} onChange={e=>setProfile({...profile, location: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl cursor-pointer transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Profile to Cloud'}
              </button>
            </form>
          </div>

          {/* 2. PROJECTS */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">2. Projects ({caseStudies.length})</h3> 
              <button onClick={()=>openCrudModal('project')} className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5"/> Add Project
              </button>
            </div>
            {caseStudies.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-mono">No projects found. Click "Add Project" to create one.</p>
            ) : (
              caseStudies.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <div className="flex items-center gap-3">
                    {p.proofImageUrl ? (
                      <img src={p.proofImageUrl} alt="" className="w-10 h-10 rounded object-cover border border-slate-800 bg-slate-900" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 font-mono text-[10px]">No Pic</div>
                    )}
                    <div>
                      <div className="text-white font-bold">{p.title}</div>
                      <div className="text-slate-400">{p.category} • <span className="text-cyan-400">{p.status}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>openCrudModal('project', p)} className="p-1.5 text-cyan-400 hover:bg-slate-900 rounded" title="Edit"><Edit3 className="w-4 h-4"/></button>
                    <button onClick={()=>handleDeleteItem('projects', p.id, setCaseStudies)} className="p-1.5 text-rose-400 hover:bg-slate-900 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. TOOLS & SKILLS */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">3. Tools & Skills ({skillsList.length})</h3> 
              <button onClick={()=>openCrudModal('skill')} className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5"/> Add Tool
              </button>
            </div>
            {skillsList.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-mono">No skills found. Click "Add Tool" to create one.</p>
            ) : (
              skillsList.map(s => (
                <div key={s.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <div className="flex items-center gap-3">
                    {s.logoUrl && <div className="w-8 h-8 rounded bg-white p-1 flex items-center justify-center shrink-0"><img src={s.logoUrl} alt="" className="w-full h-full object-contain" /></div>}
                    <div><div className="text-white font-bold">{s.name}</div><div className="text-slate-400">{s.category} • {s.proficiency}</div></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>openCrudModal('skill', s)} className="p-1.5 text-cyan-400 hover:bg-slate-900 rounded" title="Edit"><Edit3 className="w-4 h-4"/></button>
                    <button onClick={()=>handleDeleteItem('skills', s.id, setSkillsList)} className="p-1.5 text-rose-400 hover:bg-slate-900 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 4. EDUCATION */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">4. Education ({educationList.length})</h3> 
              <button onClick={()=>openCrudModal('education')} className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5"/> Add Education
              </button>
            </div>
            {educationList.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-mono">No education qualifications found.</p>
            ) : (
              educationList.map(e => (
                <div key={e.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <div className="flex items-center gap-3">
                    {e.logoUrl && <div className="w-8 h-8 rounded bg-white p-1 flex items-center justify-center shrink-0"><img src={e.logoUrl} alt="" className="w-full h-full object-contain" /></div>}
                    <div><div className="text-white font-bold">{e.degree}</div><div className="text-slate-400">{e.institution} ({e.period})</div></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>openCrudModal('education', e)} className="p-1.5 text-cyan-400 hover:bg-slate-900 rounded" title="Edit"><Edit3 className="w-4 h-4"/></button>
                    <button onClick={()=>handleDeleteItem('education', e.id, setEducationList)} className="p-1.5 text-rose-400 hover:bg-slate-900 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 5. CERTIFICATIONS & BADGES */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">5. Certifications & Badges ({certifications.length})</h3> 
              <button onClick={()=>openCrudModal('cert')} className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5"/> Add Credential
              </button>
            </div>
            {certifications.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-mono">No credentials found.</p>
            ) : (
              certifications.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <div className="flex items-center gap-3">
                    {(c.badgeLogoUrl || c.certImageUrl) && (
                      <div className="w-9 h-9 rounded bg-white p-1 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={c.type === 'badge' ? (c.badgeLogoUrl || c.certImageUrl) : (c.certImageUrl || c.badgeLogoUrl)} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <div className="text-white font-bold">{c.title} <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded ml-1 uppercase">{c.type}</span></div>
                      <div className="text-slate-400">{c.org} • {c.date}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>openCrudModal('cert', c)} className="p-1.5 text-cyan-400 hover:bg-slate-900 rounded" title="Edit"><Edit3 className="w-4 h-4"/></button>
                    <button onClick={()=>handleDeleteItem('certifications', c.id, setCertifications)} className="p-1.5 text-rose-400 hover:bg-slate-900 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 6. ACTIVITIES */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">6. Participating in Activities ({communityActivities.length})</h3> 
              <button onClick={()=>openCrudModal('activity')} className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5"/> Add Activity
              </button>
            </div>
            {communityActivities.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-mono">No activities found.</p>
            ) : (
              communityActivities.map(a => (
                <div key={a.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <div>
                    <div className="text-white font-bold">{a.title} {a.type && <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 text-cyan-400 rounded border border-slate-800 ml-1.5">{a.type}</span>}</div>
                    <div className="text-slate-400">{a.entity} • {a.period}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>openCrudModal('activity', a)} className="p-1.5 text-cyan-400 hover:bg-slate-900 rounded" title="Edit"><Edit3 className="w-4 h-4"/></button>
                    <button onClick={()=>handleDeleteItem('activities', a.id, setCommunityActivities)} className="p-1.5 text-rose-400 hover:bg-slate-900 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 7. TESTIMONIALS */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">7. Endorsements ({testimonials.length})</h3> 
              <button onClick={()=>openCrudModal('testimonial')} className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5"/> Add Endorsement
              </button>
            </div>
            {testimonials.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-mono">No endorsements found.</p>
            ) : (
              testimonials.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <div><div className="text-white font-bold">{t.author}</div><div className="text-slate-400">{t.role}</div></div>
                  <div className="flex gap-2">
                    <button onClick={()=>openCrudModal('testimonial', t)} className="p-1.5 text-cyan-400 hover:bg-slate-900 rounded" title="Edit"><Edit3 className="w-4 h-4"/></button>
                    <button onClick={()=>handleDeleteItem('testimonials', t.id, setTestimonials)} className="p-1.5 text-rose-400 hover:bg-slate-900 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CV DOCUMENT DATA ENGINE */}
        <div className="space-y-6 pt-8">
          <h2 className="text-xl font-bold text-emerald-400 border-b border-emerald-500/30 pb-2">📄Resume Document Data Engine</h2>
          
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white">1. CV Metadata, Summary & Core Skills</h3>
            <form onSubmit={handleSaveCvMeta} className="space-y-5 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className="text-slate-400 block mb-1">Full Legal Name</label><input type="text" value={atsCvData.fullName} onChange={e=>setAtsCvData({...atsCvData, fullName: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div className="sm:col-span-2"><label className="text-slate-400 block mb-1">Professional Title</label><input type="text" value={atsCvData.title} onChange={e=>setAtsCvData({...atsCvData, title: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div><label className="text-slate-400 block mb-1">Phone</label><input type="text" value={atsCvData.phone} onChange={e=>setAtsCvData({...atsCvData, phone: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div><label className="text-slate-400 block mb-1">Email</label><input type="email" value={atsCvData.email} onChange={e=>setAtsCvData({...atsCvData, email: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div><label className="text-slate-400 block mb-1">LinkedIn URL</label><input type="text" value={atsCvData.linkedin} onChange={e=>setAtsCvData({...atsCvData, linkedin: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div><label className="text-slate-400 block mb-1">Physical Address</label><input type="text" value={atsCvData.address} onChange={e=>setAtsCvData({...atsCvData, address: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white" /></div>
                <div className="sm:col-span-2"><label className="text-slate-400 block mb-1">Executive Summary</label><textarea rows="3" value={atsCvData.summary} onChange={e=>setAtsCvData({...atsCvData, summary: e.target.value})} className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white resize-none" /></div>
              </div>

              {/* HARD & SOFT SKILLS BUILDER FOR ATS CV */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                {/* Hard Skills */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="font-bold text-emerald-400 block">HARD TECHNICAL SKILLS (CV)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newHardSkill}
                      onChange={e => setNewHardSkill(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddHardSkill();
                        }
                      }}
                      placeholder="e.g. AWS Cloud & Terraform"
                      className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddHardSkill}
                      className="px-3 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {atsCvData.hardSkills.length === 0 ? (
                      <span className="text-[11px] text-slate-600 italic">No hard skills added yet.</span>
                    ) : (
                      atsCvData.hardSkills.map((hs, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                          <span>• {hs}</span>
                          <button
                            type="button"
                            onClick={() => setAtsCvData({ ...atsCvData, hardSkills: atsCvData.hardSkills.filter((_, idx) => idx !== i) })}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Soft Skills */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="font-bold text-emerald-400 block">SOFT & PROFESSIONAL SKILLS (CV)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSoftSkill}
                      onChange={e => setNewSoftSkill(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSoftSkill();
                        }
                      }}
                      placeholder="e.g. Analytical Problem Solving"
                      className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddSoftSkill}
                      className="px-3 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {atsCvData.softSkills.length === 0 ? (
                      <span className="text-[11px] text-slate-600 italic">No soft skills added yet.</span>
                    ) : (
                      atsCvData.softSkills.map((ss, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                          <span>• {ss}</span>
                          <button
                            type="button"
                            onClick={() => setAtsCvData({ ...atsCvData, softSkills: atsCvData.softSkills.filter((_, idx) => idx !== i) })}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl cursor-pointer transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save CV Metadata & Skills'}
              </button>
            </form>
          </div>

          {/* 2. CV EDUCATION */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">2. CV Education ({cvEducation.length})</h3> 
              <button onClick={()=>openCrudModal('cv_education')} className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5"/> Add
              </button>
            </div>
            {cvEducation.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-mono">No CV education entries found.</p>
            ) : (
              cvEducation.map(ce => (
                <div key={ce.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <div><div className="text-white font-bold">{ce.degree}</div><div className="text-slate-400">{ce.institution} ({ce.period})</div></div>
                  <div className="flex gap-2">
                    <button onClick={()=>openCrudModal('cv_education', ce)} className="p-1.5 text-cyan-400 hover:bg-slate-900 rounded" title="Edit"><Edit3 className="w-4 h-4"/></button>
                    <button onClick={()=>handleDeleteItem('cv_education', ce.id, setCvEducation)} className="p-1.5 text-rose-400 hover:bg-slate-900 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. CV EXPERIENCE */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">3. CV Experience ({cvWork.length})</h3> 
              <button onClick={()=>openCrudModal('cv_work')} className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5"/> Add
              </button>
            </div>
            {cvWork.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-mono">No CV work experience entries found.</p>
            ) : (
              cvWork.map(w => (
                <div key={w.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <div><div className="text-white font-bold">{w.role}</div><div className="text-slate-400">{w.company} ({w.period})</div></div>
                  <div className="flex gap-2">
                    <button onClick={()=>openCrudModal('cv_work', w)} className="p-1.5 text-cyan-400 hover:bg-slate-900 rounded" title="Edit"><Edit3 className="w-4 h-4"/></button>
                    <button onClick={()=>handleDeleteItem('cv_work', w.id, setCvWork)} className="p-1.5 text-rose-400 hover:bg-slate-900 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 4. CV PROJECTS */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">4. CV Projects ({cvProjects.length})</h3> 
              <button onClick={()=>openCrudModal('cv_project')} className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5"/> Add
              </button>
            </div>
            {cvProjects.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-mono">No CV projects entries found.</p>
            ) : (
              cvProjects.map(cp => (
                <div key={cp.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <div><div className="text-white font-bold">{cp.title}</div><div className="text-slate-400">{cp.date}</div></div>
                  <div className="flex gap-2">
                    <button onClick={()=>openCrudModal('cv_project', cp)} className="p-1.5 text-cyan-400 hover:bg-slate-900 rounded" title="Edit"><Edit3 className="w-4 h-4"/></button>
                    <button onClick={()=>handleDeleteItem('cv_projects', cp.id, setCvProjects)} className="p-1.5 text-rose-400 hover:bg-slate-900 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 5. CV REFERENCES */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">5. CV References ({cvRefs.length})</h3> 
              <button onClick={()=>openCrudModal('cv_ref')} className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5"/> Add
              </button>
            </div>
            {cvRefs.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-mono">No CV references entries found.</p>
            ) : (
              cvRefs.map(cr => (
                <div key={cr.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <div>
                    <div className="text-white font-bold">{cr.name}</div>
                    <div className="text-slate-400">{cr.designation} • {cr.institution}</div>
                    {cr.contact && <div className="text-cyan-400 font-mono text-[11px] mt-0.5">{cr.contact}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>openCrudModal('cv_ref', cr)} className="p-1.5 text-cyan-400 hover:bg-slate-900 rounded" title="Edit"><Edit3 className="w-4 h-4"/></button>
                    <button onClick={()=>handleDeleteItem('cv_references', cr.id, setCvRefs)} className="p-1.5 text-rose-400 hover:bg-slate-900 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECRUITER MESSAGES INBOX */}
        <div className="space-y-6 pt-8">
          <h2 className="text-xl font-bold text-amber-400 border-b border-amber-500/30 pb-2 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <span>Recruiter & Visitor Messages ({messagesList.length})</span>
          </h2>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono text-xs">
            {messagesList.length === 0 ? (
              <p className="text-slate-500 italic">No messages received yet.</p>
            ) : (
              messagesList.map(m => (
                <div key={m.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex justify-between items-start">
                  <div className="space-y-1 flex-1 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white">{m.sender_name || 'Anonymous Sender'}</span>
                      {m.sender_email && (
                        <a 
                          href={`mailto:${m.sender_email}`} 
                          className="text-cyan-400 hover:underline"
                        >
                          &lt;{m.sender_email}&gt;
                        </a>
                      )}
                      {m.created_at && (
                        <span className="text-[10px] text-slate-500 ml-auto">
                          {new Date(m.created_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line mt-1">{m.message}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem('messages', m.id, setMessagesList)}
                    className="p-1.5 text-rose-400 hover:bg-slate-900 rounded shrink-0 cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* GLOBAL CRUD MODAL */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="w-full max-w-xl rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-4 shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                {editingItem ? 'Edit Database Record' : 'Create New Record'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitCrudModal} className="space-y-4">
              
              {/* PROJECT FORM */}
              {modalType === 'project' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Project Title</label>
                    <input type="text" required value={formData.title||''} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Category</label>
                      <input type="text" required value={formData.category||''} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Status</label>
                      <select value={formData.status||'COMPLETED'} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
                        <option>COMPLETED</option>
                        <option>IN PROGRESS</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Summary</label>
                    <textarea rows="3" required value={formData.summary||''} onChange={e=>setFormData({...formData, summary: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Tools (Comma Separated)</label>
                    <input type="text" value={formData.tools||''} onChange={e=>setFormData({...formData, tools: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="Python, Wireshark, Docker" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">GitHub Repo URL</label>
                    <input type="text" value={formData.github||''} onChange={e=>setFormData({...formData, github: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Project Proof Image</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {formData.proofImageUrl && <img src={formData.proofImageUrl} alt="" className="w-12 h-8 object-cover rounded border border-slate-700 bg-slate-900" />}
                        <input type="file" accept="image/*" disabled={isUploading} onChange={e=>handleCloudImageUpload(e.target.files[0], url=>setFormData({...formData, proofImageUrl: url}))} className="text-slate-400 file:bg-cyan-500 file:text-slate-950 file:font-bold file:border-0 file:rounded file:px-2.5 file:py-1 cursor-pointer" />
                        {formData.proofImageUrl && (
                          <button type="button" onClick={()=>setFormData({...formData, proofImageUrl: ''})} className="text-rose-400 hover:text-rose-300 text-[11px]">Clear</button>
                        )}
                      </div>
                      <input type="text" value={formData.proofImageUrl||''} onChange={e=>setFormData({...formData, proofImageUrl: e.target.value})} placeholder="Or paste direct image URL..." className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]" />
                    </div>
                  </div>
                </>
              )}

              {/* SKILL FORM */}
              {modalType === 'skill' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Tool Name</label>
                    <input type="text" required value={formData.name||''} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="e.g. Wireshark" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Skill Category</label>
                      <input type="text" required value={formData.category||''} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="e.g. Networking & Cyber" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Proficiency</label>
                      <select value={formData.proficiency||'Advanced'} onChange={e=>setFormData({...formData, proficiency: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
                        <option>Advanced</option>
                        <option>Intermediate</option>
                        <option>Beginner</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Tool Icon / Logo</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {formData.logoUrl && <div className="w-8 h-8 rounded bg-white p-1"><img src={formData.logoUrl} alt="" className="w-full h-full object-contain" /></div>}
                        <input type="file" accept="image/*" disabled={isUploading} onChange={e=>handleCloudImageUpload(e.target.files[0], url=>setFormData({...formData, logoUrl: url}))} className="text-slate-400 file:bg-cyan-500 file:text-slate-950 file:font-bold file:border-0 file:rounded file:px-2.5 file:py-1 cursor-pointer" />
                        {formData.logoUrl && (
                          <button type="button" onClick={()=>setFormData({...formData, logoUrl: ''})} className="text-rose-400 hover:text-rose-300 text-[11px]">Clear</button>
                        )}
                      </div>
                      <input type="text" value={formData.logoUrl||''} onChange={e=>setFormData({...formData, logoUrl: e.target.value})} placeholder="Or paste direct logo URL..." className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]" />
                    </div>
                  </div>
                </>
              )}

              {/* EDUCATION FORM */}
              {modalType === 'education' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Degree / Qualification</label>
                    <input type="text" required value={formData.degree||''} onChange={e=>setFormData({...formData, degree: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Institution</label>
                    <input type="text" required value={formData.institution||''} onChange={e=>setFormData({...formData, institution: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Period</label>
                      <input type="text" value={formData.period||''} onChange={e=>setFormData({...formData, period: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="2024 – Present" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Location</label>
                      <input type="text" value={formData.location||''} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Modules (Comma Separated)</label>
                    <input type="text" value={formData.modules||''} onChange={e=>setFormData({...formData, modules: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="Computer Security, Machine Learning" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Institution Logo</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {formData.logoUrl && <div className="w-8 h-8 rounded bg-white p-1"><img src={formData.logoUrl} alt="" className="w-full h-full object-contain" /></div>}
                        <input type="file" accept="image/*" disabled={isUploading} onChange={e=>handleCloudImageUpload(e.target.files[0], url=>setFormData({...formData, logoUrl: url}))} className="text-slate-400 file:bg-cyan-500 file:text-slate-950 file:font-bold file:border-0 file:rounded file:px-2.5 file:py-1 cursor-pointer" />
                        {formData.logoUrl && (
                          <button type="button" onClick={()=>setFormData({...formData, logoUrl: ''})} className="text-rose-400 hover:text-rose-300 text-[11px]">Clear</button>
                        )}
                      </div>
                      <input type="text" value={formData.logoUrl||''} onChange={e=>setFormData({...formData, logoUrl: e.target.value})} placeholder="Or paste direct logo URL..." className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]" />
                    </div>
                  </div>
                </>
              )}

              {/* CERTIFICATION & BADGE FORM */}
              {modalType === 'cert' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Type</label>
                      <select value={formData.type||'badge'} onChange={e=>setFormData({...formData, type: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
                        <option value="badge">Digital Badge</option>
                        <option value="certificate">Certificate</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Organization (e.g. AWS, CISCO)</label>
                      <input type="text" required value={formData.org||''} onChange={e=>setFormData({...formData, org: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white uppercase" />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Title</label>
                    <input type="text" required value={formData.title||''} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Issue Date</label>
                    <input type="text" value={formData.date||''} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="September 2026" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Credential Verification URL</label>
                    <input type="text" value={formData.credentialUrl||''} onChange={e=>setFormData({...formData, credentialUrl: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="https://www.credly.com/..." />
                  </div>
                  {formData.type === 'badge' ? (
                    <div>
                      <label className="text-slate-400 block mb-1">Badge Icon Image</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {formData.badgeLogoUrl && <div className="w-10 h-10 rounded bg-white p-1"><img src={formData.badgeLogoUrl} alt="" className="w-full h-full object-contain" /></div>}
                          <input type="file" accept="image/*" disabled={isUploading} onChange={e=>handleCloudImageUpload(e.target.files[0], url=>setFormData({...formData, badgeLogoUrl: url}))} className="text-slate-400 file:bg-cyan-500 file:text-slate-950 file:font-bold file:border-0 file:rounded file:px-2.5 file:py-1 cursor-pointer" />
                          {formData.badgeLogoUrl && (
                            <button type="button" onClick={()=>setFormData({...formData, badgeLogoUrl: ''})} className="text-rose-400 hover:text-rose-300 text-[11px]">Clear</button>
                          )}
                        </div>
                        <input type="text" value={formData.badgeLogoUrl||''} onChange={e=>setFormData({...formData, badgeLogoUrl: e.target.value})} placeholder="Or paste direct badge image URL..." className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-slate-400 block mb-1">Certificate Document Image</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {formData.certImageUrl && <img src={formData.certImageUrl} alt="" className="w-14 h-10 object-cover rounded border border-slate-700 bg-slate-900" />}
                          <input type="file" accept="image/*" disabled={isUploading} onChange={e=>handleCloudImageUpload(e.target.files[0], url=>setFormData({...formData, certImageUrl: url}))} className="text-slate-400 file:bg-cyan-500 file:text-slate-950 file:font-bold file:border-0 file:rounded file:px-2.5 file:py-1 cursor-pointer" />
                          {formData.certImageUrl && (
                            <button type="button" onClick={()=>setFormData({...formData, certImageUrl: ''})} className="text-rose-400 hover:text-rose-300 text-[11px]">Clear</button>
                          )}
                        </div>
                        <input type="text" value={formData.certImageUrl||''} onChange={e=>setFormData({...formData, certImageUrl: e.target.value})} placeholder="Or paste direct certificate image URL..." className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]" />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ACTIVITY FORM */}
              {modalType === 'activity' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Activity Category</label>
                      <input type="text" value={formData.type||''} onChange={e=>setFormData({...formData, type: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="e.g. Volunteering & Community" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Date / Period</label>
                      <input type="text" value={formData.period||''} onChange={e=>setFormData({...formData, period: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="2026" />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Role / Project Name</label>
                    <input type="text" required value={formData.title||''} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Organization / Society</label>
                    <input type="text" value={formData.entity||''} onChange={e=>setFormData({...formData, entity: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="e.g. Computer Science Association (CSA)" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Brief Description</label>
                    <textarea rows="3" required value={formData.description||''} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white resize-none" />
                  </div>
                </>
              )}

              {/* TESTIMONIAL FORM */}
              {modalType === 'testimonial' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Author Name</label>
                    <input type="text" required value={formData.author||''} onChange={e=>setFormData({...formData, author: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Role / Organization</label>
                    <input type="text" required value={formData.role||''} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Endorsement Quote</label>
                    <textarea rows="3" required value={formData.quote||''} onChange={e=>setFormData({...formData, quote: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white resize-none" />
                  </div>
                </>
              )}

              {/* CV EDUCATION FORM */}
              {modalType === 'cv_education' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Degree</label>
                    <input type="text" required value={formData.degree||''} onChange={e=>setFormData({...formData, degree: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Institution</label>
                    <input type="text" required value={formData.institution||''} onChange={e=>setFormData({...formData, institution: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Period</label>
                      <input type="text" value={formData.period||''} onChange={e=>setFormData({...formData, period: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Location</label>
                      <input type="text" value={formData.location||''} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Key Summary / Modules</label>
                    <textarea rows="3" value={formData.keyPoints||''} onChange={e=>setFormData({...formData, keyPoints: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white resize-none" />
                  </div>
                </>
              )}

              {/* CV WORK FORM */}
              {modalType === 'cv_work' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Role</label>
                    <input type="text" required value={formData.role||''} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Company</label>
                    <input type="text" required value={formData.company||''} onChange={e=>setFormData({...formData, company: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Period</label>
                      <input type="text" value={formData.period||''} onChange={e=>setFormData({...formData, period: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Location</label>
                      <input type="text" value={formData.location||''} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Description / Duties</label>
                    <textarea rows="3" value={formData.description||''} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white resize-none" />
                  </div>
                </>
              )}

              {/* CV PROJECT FORM */}
              {modalType === 'cv_project' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Project Title</label>
                    <input type="text" required value={formData.title||''} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Date</label>
                    <input type="text" value={formData.date||''} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="2026" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Summary</label>
                    <textarea rows="3" value={formData.summary||''} onChange={e=>setFormData({...formData, summary: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white resize-none" />
                  </div>
                </>
              )}

              {/* CV REFERENCE FORM */}
              {modalType === 'cv_ref' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Referee Name</label>
                    <input type="text" required value={formData.name||''} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Designation</label>
                    <input type="text" required value={formData.designation||''} onChange={e=>setFormData({...formData, designation: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Institution</label>
                    <input type="text" required value={formData.institution||''} onChange={e=>setFormData({...formData, institution: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Contact Info</label>
                    <input type="text" required value={formData.contact||''} onChange={e=>setFormData({...formData, contact: e.target.value})} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="email@example.com or phone" />
                  </div>
                </>
              )}

              {/* FORM ACTION BUTTONS */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || isUploading}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}