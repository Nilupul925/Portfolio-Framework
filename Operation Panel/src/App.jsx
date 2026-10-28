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
}