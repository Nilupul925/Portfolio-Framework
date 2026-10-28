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
}