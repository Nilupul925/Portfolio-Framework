import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './lib/supabaseClient.js';

// Utility function to create SVG icons
const createIcon = (paths) => ({ className = "w-4 h-4", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {paths}
  </svg>
);

const Award = createIcon(<><circle cx="12" cy="8" r="6" /><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /></>);
const FileText = createIcon(<><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></>);
const Bot = createIcon(<><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></>);
const Send = createIcon(<><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>);
const Check = createIcon(<polyline points="20 6 9 17 4 12" />);
const ExternalLink = createIcon(<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>);
const Github = createIcon(<><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></>);
const Linkedin = createIcon(<><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></>);
const Mail = createIcon(<><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>);
const ChevronDown = createIcon(<polyline points="6 9 12 15 18 9" />);
const Printer = createIcon(<><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>);
const X = createIcon(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);
const MessageSquare = createIcon(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>);
const Phone = createIcon(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />);
const MapPin = createIcon(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>);
const AlertCircle = createIcon(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>);
const GraduationCap = createIcon(<><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>);
const ShieldCheck = createIcon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></>);

const CURRENT_YEAR = new Date().getFullYear();

const cleanUrlDisplay = (url) => {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/^https?:\/\//, '');
};

const ensureExternalUrl = (url) => {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (!trimmed) return '#';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

// PortfolioApp component
export default function PortfolioApp() {

  const [isLoading, setIsLoading] = useState(!!supabase);
  const [toastMsg, setToastMsg] = useState('');
  const [isErrorToast, setIsErrorToast] = useState(false);

  // Portfolio State
  const [profile, setProfile] = useState({
    name: '', headline: '', tagline: '', bio: '', email: '', phone: '', location: '', github: '', linkedin: '', avatarUrl: ''
  });
  const [caseStudies, setCaseStudies] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [communityActivities, setCommunityActivities] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  // ATS CV State
  const [atsCvData, setAtsCvData] = useState({
    fullName: '', title: '', phone: '', address: '', email: '', linkedin: '', summary: '', hardSkills: [], softSkills: []
  });
  const [cvProjects, setCvProjects] = useState([]);
  const [cvWork, setCvWork] = useState([]);
  const [cvEducation, setCvEducation] = useState([]);
  const [cvRefs, setCvRefs] = useState([]);

  // Navigation & Filtering
  const [activeNav, setActiveNav] = useState('HOME');
  const [projectCategory, setProjectCategory] = useState('All');
  const [certOrgFilter, setCertOrgFilter] = useState('All');
  const [showCvDropdown, setShowCvDropdown] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // Chatbot State
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botMessages, setBotMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your Portfolio AI Assistant. Ask me about projects, technical skills, work experience, education, digital badges, certificates, or ATS resume details!'
    }
  ]);
  const [botInput, setBotInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const botScrollRef = useRef(null);

  const triggerToast = (msg, isError = false) => {
    setIsErrorToast(isError);
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Fetch data from Supabase on component mount
  useEffect(() => {
    const fetchCloudData = async () => {
      if (!supabase) return;
      try {
        const { data: profData } = await supabase.from('profile').select('*').eq('id', 1).maybeSingle();
        if (profData) {
          setProfile({
            name: profData.name || '',
            headline: profData.headline || '',
            tagline: profData.tagline || '',
            bio: profData.bio || '',
            email: profData.email || '',
            phone: profData.phone || '',
            location: profData.location || '',
            github: profData.github || '',
            linkedin: profData.linkedin || '',
            avatarUrl: profData.avatar_url || ''
          });
        }

        const { data: projData } = await supabase.from('projects').select('*').order('id', { ascending: true });
        if (projData) {
          setCaseStudies(projData.map(p => ({
            id: p.id,
            title: p.title || 'Not yet included',
            category: p.category || 'General',
            status: p.status || 'COMPLETED',
            summary: p.summary || '',
            tools: Array.isArray(p.tools) ? p.tools : [],
            github: p.github || '',
            proofImageUrl: p.proof_image_url || ''
          })));
        }

        const { data: skillData } = await supabase.from('skills').select('*').order('id', { ascending: true });
        if (skillData) {
          setSkillsList(skillData.map(s => ({
            id: s.id,
            name: s.name || '',
            category: s.category || 'General',
            proficiency: s.proficiency || '',
            logoUrl: s.logo_url || ''
          })));
        }

        const { data: eduData } = await supabase.from('education').select('*').order('id', { ascending: true });
        if (eduData) {
          setEducationList(eduData.map(e => ({
            id: e.id,
            degree: e.degree || '',
            institution: e.institution || '',
            period: e.period || '',
            location: e.location || '',
            modules: Array.isArray(e.modules) ? e.modules : [],
            logoUrl: e.logo_url || ''
          })));
        }

        const { data: certData } = await supabase.from('certifications').select('*').order('id', { ascending: true });
        if (certData) {
          setCertifications(certData.map(c => ({
            id: c.id,
            type: c.type || 'badge',
            title: c.title || '',
            org: c.org || 'ISSUER',
            date: c.date || '',
            credentialUrl: c.credential_url || '',
            badgeLogoUrl: c.badge_logo_url || '',
            certImageUrl: c.cert_image_url || ''
          })));
        }

        const { data: actData } = await supabase.from('activities').select('*').order('id', { ascending: true });
        if (actData) setCommunityActivities(actData);

        const { data: testData } = await supabase.from('testimonials').select('*').order('id', { ascending: true });
        if (testData) setTestimonials(testData);

        const { data: cvMeta } = await supabase.from('cv_metadata').select('*').eq('id', 1).maybeSingle();
        if (cvMeta) {
          setAtsCvData({
            fullName: cvMeta.full_name || '',
            title: cvMeta.title || '',
            phone: cvMeta.phone || '',
            address: cvMeta.address || '',
            email: cvMeta.email || '',
            linkedin: cvMeta.linkedin || '',
            summary: cvMeta.summary || '',
            hardSkills: Array.isArray(cvMeta.hard_skills) ? cvMeta.hard_skills : [],
            softSkills: Array.isArray(cvMeta.soft_skills) ? cvMeta.soft_skills : []
          });
        }

        const { data: pData } = await supabase.from('cv_projects').select('*').order('id', { ascending: true });
        if (pData) setCvProjects(pData);

        const { data: wData } = await supabase.from('cv_work').select('*').order('id', { ascending: true });
        if (wData) setCvWork(wData);

        const { data: eData } = await supabase.from('cv_education').select('*').order('id', { ascending: true });
        if (eData) setCvEducation(eData);

        const { data: rData } = await supabase.from('cv_references').select('*').order('id', { ascending: true });
        if (rData) setCvRefs(rData);

        const ownerName = profData?.name || 'Portfolio';
        setBotMessages([
          {
            sender: 'bot',
            text: `Hello! I am ${ownerName}'s Portfolio AI Assistant. Ask me about projects, technical skills, education, digital badges, certificates, or ATS resume details!`
          }
        ]);
      } catch (err) {
        console.error("Error fetching from Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCloudData();
  }, []);

  // Scroll to the bottom of the bot messages when new messages are added or when the bot is typing
  useEffect(() => {
    botScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [botMessages, isBotTyping]);

  const handleBotSubmit = (e) => {
    e.preventDefault();
    if (!botInput.trim()) return;
    const query = botInput.trim();
    setBotMessages(prev => [...prev, { sender: 'user', text: query }]);
    setBotInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      const q = query.toLowerCase();
      let reply = '';
      const candidateName = profile.name || 'The candidate';

      if (q.includes('who is') || q.includes('who are you') || q.includes('about')) {
        reply = profile.bio
          ? `${candidateName} — ${profile.headline || 'Specialist'}.\n\n${profile.bio}`
          : `${candidateName}'s profile bio is not yet included.`;
      } else if (q.includes('cv') || q.includes('resume') || q.includes('ats')) {
        reply = `${candidateName}'s ATS Resume is available right here. Click 'View My Resume' in the top section to inspect or download the PDF.`;
      } else if (q.includes('work') || q.includes('experience') || q.includes('job') || q.includes('career') || q.includes('employment') || q.includes('role')) {
        reply = cvWork.length > 0
          ? `Work Experience:\n${cvWork.map(w => `• ${w.role} at ${w.company} (${w.period})${w.location ? ` - ${w.location}` : ''}${w.description ? `\n  ${w.description}` : ''}`).join('\n\n')}`
          : "Work experience details are not yet included in the CV database.";
      } else if (q.includes('education') || q.includes('degree') || q.includes('university') || q.includes('school')) {
        const edu = educationList[0] || cvEducation[0];
        if (edu && (edu.degree || edu.institution)) {
          const modText = edu.modules && edu.modules.length > 0
            ? `\n• Modules: ${edu.modules.join(', ')}`
            : (edu.key_points || edu.keyPoints ? `\n• Highlights: ${edu.key_points || edu.keyPoints}` : '');
          reply = `Education:\n• ${edu.degree || 'Not yet included'} at ${edu.institution || 'Not yet included'} (${edu.period || 'N/A'})${modText}`;
        } else {
          reply = "Education details are not yet included in the database.";
        }
      } else if (q.includes('skill') || q.includes('tech') || q.includes('tool')) {
        reply = skillsList.length > 0
          ? `Technical Toolkit:\n${skillsList.map(s => `• ${s.name} (${s.category})`).join('\n')}`
          : "Skills and tools are not yet included in the database.";
      } else if (q.includes('project') || q.includes('case study') || q.includes('github')) {
        reply = caseStudies.length > 0
          ? `Featured Case Studies:\n${caseStudies.map((p, i) => `${i + 1}. ${p.title} [${p.category}]${p.github ? `\n   Repo: ${p.github}` : ''}`).join('\n')}`
          : "Project case studies are not yet included.";
      } else if (q.includes('cert') || q.includes('badge') || q.includes('aws') || q.includes('cisco')) {
        reply = certifications.length > 0
          ? `Credentials:\n${certifications.map(c => `• ${c.title} (${c.org}) [${(c.type || 'badge').toUpperCase()}]`).join('\n')}`
          : "Certifications and badges are not yet included.";
      } else if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('location')) {
        reply = `Contact Channels:\n• Phone: ${profile.phone || 'Not yet included'}\n• Email: ${profile.email || 'Not yet included'}\n• LinkedIn: ${profile.linkedin || 'Not yet included'}\n• Location: ${profile.location || 'Not yet included'}`;
      } else {
        reply = `I am connected to ${candidateName}'s live Supabase portfolio. Try asking about "projects", "skills", "experience", "education", "badges", "CV", or "contact"!`;
      }

      setBotMessages(prev => [...prev, { sender: 'bot', text: reply }]);
      setIsBotTyping(false);
    }, 400);
  };

  // Handle sending a message from the contact form
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) return;

    if (!supabase) {
      triggerToast('Database client unavailable. Please contact directly via email.', true);
      return;
    }

    setIsSendingMsg(true);
    try {
      const messagePayload = {
        sender_name: contactForm.name.trim(),
        sender_email: contactForm.email.trim(),
        message: contactForm.message.trim()
      };
      
      let { error } = await supabase.from('messages').insert([messagePayload]);
      if (error && error.message && error.message.includes('null value in column "id"')) {
        const fallbackRes = await supabase.from('messages').insert([{ ...messagePayload, id: Date.now() }]);
        error = fallbackRes.error;
      }

      if (error) throw error;
      triggerToast('Message sent directly to Admin Inbox!');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Error sending message:', err);
      triggerToast(`Failed to send message: ${err.message || 'Please reach out via email.'}`, true);
    } finally {
      setIsSendingMsg(false);
    }
  };

  // Update active navigation based on scroll position
  useEffect(() => {
    const sections = ['home', 'projects', 'skills', 'education', 'certificates', 'community', 'testimonials', 'contact'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220;
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const el = document.getElementById(sectionId);
        if (el && scrollPosition >= el.offsetTop) {
          setActiveNav(sectionId.toUpperCase());
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter lists based on selected categories
  const dynamicProjectCategories = ['All', ...Array.from(new Set(caseStudies.map(p => p.category).filter(Boolean)))];
  const filteredProjects = projectCategory === 'All' ? caseStudies : caseStudies.filter(p => p.category === projectCategory);

  const dynamicCertOrgs = ['All', ...Array.from(new Set(certifications.map(c => c.org?.toUpperCase()).filter(Boolean)))];
  const filteredCerts = certOrgFilter === 'All' ? certifications : certifications.filter(c => c.org?.toUpperCase() === certOrgFilter);

  const filteredBadges = filteredCerts.filter(c => c.type === 'badge');
  const filteredCertificates = filteredCerts.filter(c => c.type === 'certificate');

  const dynamicSkillCategories = Array.from(new Set(skillsList.map(s => s.category).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-cyan-400 font-mono space-y-4">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm tracking-wider animate-pulse">Loading Portfolio from Supabase...</span>
      </div>
    );
  }

  // Main render of the PortfolioApp
  return (
    <div id="app-root-container" className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-x-hidden">
      
      {/* RELIABLE PRINT ENGINE CSS FOR RESUME */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 14mm 10mm 14mm;
          }
          *, *::before, *::after {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          html, body, #root, #app-root-container {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #111827 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: 0 !important;
            height: auto !important;
            overflow: visible !important;
            position: static !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print,
          #ats-print-wrapper,
          #ats-print-sheet,
          header,
          nav,
          main,
          footer {
            display: none !important;
          }
          #interview-cv-print {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #111827 !important;
            overflow: visible !important;
            box-sizing: border-box !important;
          }
          #interview-cv-print a {
            color: #111827 !important;
            text-decoration: underline !important;
            pointer-events: auto !important;
            cursor: pointer !important;
          }
          #interview-cv-print .cv-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-xs shadow-2xl animate-in fade-in no-print ${
          isErrorToast ? 'bg-rose-950 border-rose-500/40 text-rose-300' : 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
        }`}>
          {isErrorToast ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden no-print">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[24px_24px] opacity-20" />
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse duration-1000" />
        <div className="absolute top-3/4 -right-48 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse duration-700" />
      </div>

      {/* FLOATING NAVBAR */}
      <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-40 px-3 sm:px-4 max-w-full w-full sm:w-auto flex justify-center pointer-events-none no-print">
        <nav className="flex overflow-x-auto whitespace-nowrap pointer-events-auto items-center bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 rounded-full px-4 sm:px-7 py-2 sm:py-2.5 gap-3.5 sm:gap-6 text-xs font-medium text-slate-300 shadow-[0_10px_35px_rgba(0,0,0,0.6)] scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-w-[calc(100vw-1.5rem)] sm:max-w-none">
          {['HOME', 'PROJECTS', 'SKILLS', 'EDUCATION', 'CERTIFICATES', 'COMMUNITY', 'TESTIMONIALS', 'CONTACT'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              onClick={() => setActiveNav(item)}
              className={`transition-colors py-1 whitespace-nowrap ${activeNav.toUpperCase() === item ? 'text-cyan-400 font-semibold' : 'hover:text-cyan-300'}`}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      {/* DEDICATED PROFESSIONAL RESUME (DOWNLOADABLE PDF / PRINT ONLY) */}
      <div id="resume-print" className="hidden font-sans">
        {/* HEADER */}
        <div className="text-center pb-2.5 mb-2.5 border-b-2 border-slate-900 cv-section">
          <h1 className="text-2xl font-black tracking-wider text-slate-950 uppercase font-sans">
            {atsCvData.fullName || profile.name || 'Candidate Name'}
          </h1>
          {(atsCvData.title || profile.headline) && (
            <p className="text-[10pt] font-semibold text-slate-700 mt-0.5 tracking-wide">
              {atsCvData.title || profile.headline}
            </p>
          )}
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 text-[8.5pt] text-slate-700 mt-1 font-sans">
            {(atsCvData.address || profile.location) && (
              <span>{atsCvData.address || profile.location}</span>
            )}
            {(atsCvData.phone || profile.phone) && (
              <>
                <span className="text-slate-400 font-bold">•</span>
                <span>{atsCvData.phone || profile.phone}</span>
              </>
            )}
            {(atsCvData.email || profile.email) && (
              <>
                <span className="text-slate-400 font-bold">•</span>
                <a
                  href={`mailto:${atsCvData.email || profile.email}`}
                  className="text-slate-900 underline font-medium cursor-pointer"
                >
                  {atsCvData.email || profile.email}
                </a>
              </>
            )}
            {(atsCvData.linkedin || profile.linkedin) && (
              <>
                <span className="text-slate-400 font-bold">•</span>
                <a
                  href={ensureExternalUrl(atsCvData.linkedin || profile.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 underline font-medium cursor-pointer"
                >
                  {cleanUrlDisplay(atsCvData.linkedin || profile.linkedin)}
                </a>
              </>
            )}
            {profile.github && (
              <>
                <span className="text-slate-400 font-bold">•</span>
                <a
                  href={ensureExternalUrl(profile.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 underline font-medium cursor-pointer"
                >
                  {cleanUrlDisplay(profile.github)}
                </a>
              </>
            )}
          </div>
        </div>

        {/* 1. PROFESSIONAL SUMMARY */}
        {(atsCvData.summary || profile.bio) && (
          <div className="mb-2.5 cv-section">
            <h2 className="text-[9.5pt] font-bold text-slate-950 uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-1">
              Professional Summary
            </h2>
            <p className="text-[8.5pt] text-slate-800 leading-relaxed text-justify">
              {atsCvData.summary || profile.bio}
            </p>
          </div>
        )}

        {/* 2. EDUCATION QUALIFICATIONS */}
        {(cvEducation.length > 0 || educationList.length > 0) && (
          <div className="mb-2.5 cv-section">
            <h2 className="text-[9.5pt] font-bold text-slate-950 uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-1">
              Education Qualifications
            </h2>
            <div className="space-y-1.5">
              {(cvEducation.length > 0 ? cvEducation : educationList).map((ed, idx) => (
                <div key={ed.id || idx} className="text-[8.5pt]">
                  <div className="flex justify-between items-baseline font-bold text-slate-950">
                    <span className="text-[9pt]">{ed.institution}</span>
                    <span className="text-[8pt] text-slate-700 font-medium">{ed.period}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-800 italic">
                    <span>{ed.degree}</span>
                    {ed.location && <span className="text-[8pt] not-italic text-slate-600">{ed.location}</span>}
                  </div>
                  {(ed.key_points || ed.keyPoints) && (
                    <p className="text-slate-700 text-[8pt] mt-0.5 leading-snug">
                      • {ed.key_points || ed.keyPoints}
                    </p>
                  )}
                  {ed.modules && ed.modules.length > 0 && !ed.key_points && (
                    <p className="text-slate-700 text-[8pt] mt-0.5 leading-snug">
                      • Modules: {ed.modules.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. WORK EXPERIENCE */}
        {cvWork.length > 0 && (
          <div className="mb-2.5 cv-section">
            <h2 className="text-[9.5pt] font-bold text-slate-950 uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-1">
              Work Experience
            </h2>
            <div className="space-y-2">
              {cvWork.map((w) => (
                <div key={w.id} className="text-[8.5pt]">
                  <div className="flex justify-between items-baseline font-bold text-slate-950">
                    <span className="text-[9pt]">{w.role} <span className="font-semibold text-slate-700">| {w.company}</span></span>
                    <span className="text-[8pt] text-slate-700 font-medium">{w.period}</span>
                  </div>
                  {w.location && (
                    <div className="text-[8pt] text-slate-600 italic -mt-0.5 mb-0.5">
                      {w.location}
                    </div>
                  )}
                  {w.description && (
                    <div className="text-slate-800 leading-snug mt-0.5 space-y-0.5">
                      {w.description.split('\n').filter(Boolean).map((line, idx) => (
                        <p key={idx} className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-slate-600">
                          {line.replace(/^[•\s*-]+/, '')}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CASE STUDY PROJECTS */}
        {(cvProjects.length > 0 || caseStudies.length > 0) && (
          <div className="mb-2.5 cv-section">
            <h2 className="text-[9.5pt] font-bold text-slate-950 uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-1">
              Case Study Projects
            </h2>
            <div className="space-y-1.5">
              {(cvProjects.length > 0 ? cvProjects : caseStudies).map((p, idx) => (
                <div key={p.id || idx} className="text-[8.5pt]">
                  <div className="flex justify-between items-baseline font-bold text-slate-950">
                    <span className="text-[9pt]">{p.title}</span>
                    <span className="text-[8pt] text-slate-700 font-medium">{p.date || p.status || ''}</span>
                  </div>
                  {(p.summary || p.description) && (
                    <p className="text-slate-800 leading-snug pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-slate-600 mt-0.5">
                      {(p.summary || p.description).replace(/^[•\s*-]+/, '')}
                    </p>
                  )}
                  {p.tools && p.tools.length > 0 && (
                    <p className="text-slate-600 text-[8pt] pl-3 mt-0.5">
                      <span className="font-semibold text-slate-800">Technologies:</span> {p.tools.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. TECHNICAL & SOFT SKILLS */}
        {((atsCvData.hardSkills && atsCvData.hardSkills.length > 0) || (atsCvData.softSkills && atsCvData.softSkills.length > 0) || skillsList.length > 0) && (
          <div className="mb-2.5 cv-section">
            <h2 className="text-[9.5pt] font-bold text-slate-950 uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-1">
              Skills & Toolkit
            </h2>
            <div className="grid grid-cols-2 gap-4 text-[8.5pt]">
              <div>
                <div className="font-bold text-[8.5pt] text-slate-950 uppercase tracking-wide mb-0.5">
                  Technical Skills
                </div>
                <ul className="space-y-0.5 text-slate-800">
                  {(atsCvData.hardSkills && atsCvData.hardSkills.length > 0
                    ? atsCvData.hardSkills
                    : skillsList.map(s => s.name)
                  ).map((hs, idx) => (
                    <li key={idx} className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-slate-600">
                      {hs}
                    </li>
                  ))}
                </ul>
              </div>
              {atsCvData.softSkills && atsCvData.softSkills.length > 0 && (
                <div>
                  <div className="font-bold text-[8.5pt] text-slate-950 uppercase tracking-wide mb-0.5">
                    Soft Skills
                  </div>
                  <ul className="space-y-0.5 text-slate-800">
                    {atsCvData.softSkills.map((ss, idx) => (
                      <li key={idx} className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-slate-600">
                        {ss}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. REFERENCES */}
        {cvRefs.length > 0 && (
          <div className="mb-1 cv-section">
            <h2 className="text-[9.5pt] font-bold text-slate-950 uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-1">
              References
            </h2>
            <div className="grid grid-cols-2 gap-4 text-[8.5pt]">
              {cvRefs.map((r) => (
                <div key={r.id} className="text-slate-800">
                  <div className="font-bold text-slate-950 text-[9pt]">{r.name}</div>
                  <div className="text-slate-700 italic text-[8.5pt]">{r.designation}</div>
                  <div className="text-slate-600 text-[8pt]">{r.institution}</div>
                  {r.contact && (
                    <div className="text-slate-700 font-mono text-[7.5pt] mt-0.5">
                      {r.contact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 space-y-20 sm:space-y-28 relative z-10">

        {/* 1. HERO SECTION */}
        <section id="home" className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center no-print">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{profile.tagline || 'Not yet included'}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                {profile.name || <span className="text-slate-600 italic">Not yet included</span>}
              </h1>
              <h2 className="text-base sm:text-xl font-medium text-cyan-400">
                {profile.headline || <span className="text-slate-500 italic">Not yet included</span>}
              </h2>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              {profile.bio || <span className="text-slate-500 italic">Bio not yet included.</span>}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-2">
              <a
                href="#projects"
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] text-center"
              >
                View Case Studies ({caseStudies.length})
              </a>

              <button
                onClick={() => setShowCvDropdown(!showCvDropdown)}
                className="px-5 py-3 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-medium text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>View My Resume</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCvDropdown ? 'rotate-180' : ''}`} />
              </button>

              <a
                href="#contact"
                className="px-5 py-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-all text-center"
              >
                Contact Info
              </a>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400 pt-2">
              {profile.github ? (
                <a href={ensureExternalUrl(profile.github)} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <Github className="w-4 h-4 text-cyan-400" />
                  <span>GitHub</span>
                </a>
              ) : (
                <span className="text-slate-600 flex items-center gap-1.5"><Github className="w-4 h-4" /> GitHub: Not yet included</span>
              )}
              <span>•</span>
              {profile.linkedin ? (
                <a href={ensureExternalUrl(profile.linkedin)} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-cyan-400" />
                  <span>LinkedIn</span>
                </a>
              ) : (
                <span className="text-slate-600 flex items-center gap-1.5"><Linkedin className="w-4 h-4" /> LinkedIn: Not yet included</span>
              )}
              <span>•</span>
              {profile.email ? (
                <a href={`mailto:${profile.email}`} className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>Email</span>
                </a>
              ) : (
                <span className="text-slate-600 flex items-center gap-1.5"><Mail className="w-4 h-4" /> Email: Not yet included</span>
              )}
            </div>
          </div>

          {/* Profile Photo */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 rounded-full bg-linear-to-tr from-cyan-500/30 via-indigo-500/20 to-emerald-500/30 blur-2xl group-hover:blur-3xl transition-all duration-700 animate-pulse" />
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-cyan-400/40 p-1.5 bg-slate-950/80 shadow-[0_0_50px_rgba(6,182,212,0.25)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center relative">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name || 'Profile'}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <span className="text-xs font-mono text-slate-500 italic">Photo not yet included</span>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. DEDICATED ATS RESUME VIEW (Always ready for Print) */}
        <div id="ats-print-wrapper" className={`no-print ${showCvDropdown ? 'block' : 'hidden'}`}>
          <section className="rounded-3xl bg-slate-950 border-2 border-cyan-500/40 p-4 sm:p-8 md:p-10 shadow-2xl relative space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 no-print">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">• ATS-VERIFIED DOCUMENT</span>
                <h3 className="text-xl font-bold text-white mt-1">Professional Resume</h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setShowCvDropdown(false)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ATS Printable Sheet */}
            <div id="ats-print-sheet" className="bg-slate-900/90 border border-slate-800 p-4 sm:p-8 md:p-12 rounded-2xl font-sans text-slate-200 space-y-6 sm:space-y-8 max-w-4xl mx-auto shadow-inner">
              
              <div className="text-center border-b border-slate-800 pb-6 space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide uppercase">
                  {atsCvData.fullName || profile.name || 'Not yet included'}
                </h1>
                <p className="text-xs sm:text-sm text-cyan-400 font-mono">
                  {atsCvData.title || profile.headline || 'Not yet included'}
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-slate-300 pt-1">
                  <span>{atsCvData.address || profile.location || 'Not yet included'}</span>
                  <span>•</span>
                  <span>{atsCvData.phone || profile.phone || 'Not yet included'}</span>
                  <span>•</span>
                  <span>{atsCvData.email || profile.email || 'Not yet included'}</span>
                  {(atsCvData.linkedin || profile.linkedin) && (
                    <>
                      <span>•</span>
                      <a href={ensureExternalUrl(atsCvData.linkedin || profile.linkedin)} target="_blank" rel="noreferrer" className="text-cyan-300 underline">
                        {cleanUrlDisplay(atsCvData.linkedin || profile.linkedin)}
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  Professional Summary
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {atsCvData.summary || profile.bio || 'Not yet included'}
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  Education Qualifications
                </h2>
                {cvEducation.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Not yet included</p>
                ) : (
                  cvEducation.map((ed) => (
                    <div key={ed.id} className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm font-semibold text-white gap-0.5">
                        <span>{ed.institution}</span>
                        <span className="font-mono text-xs text-slate-400">{ed.period}</span>
                      </div>
                      <div className="text-xs text-cyan-300">{ed.degree} • {ed.location}</div>
                      <p className="text-xs text-slate-400 leading-relaxed">{ed.key_points || ed.keyPoints}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  Work Experience
                </h2>
                {cvWork.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Not yet included</p>
                ) : (
                  cvWork.map((w) => (
                    <div key={w.id} className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm font-semibold text-white gap-0.5">
                        <span>{w.role} — <span className="text-cyan-300">{w.company}</span></span>
                        <span className="font-mono text-xs text-slate-400">{w.period}</span>
                      </div>
                      <div className="text-xs text-slate-400">{w.location}</div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mt-1">
                        • {w.description}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  Case Study Projects
                </h2>
                {cvProjects.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Not yet included</p>
                ) : (
                  <div className="space-y-2.5">
                    {cvProjects.map((p) => (
                      <div key={p.id} className="space-y-0.5">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm font-semibold text-white gap-0.5">
                          <span>{p.title}</span>
                          <span className="font-mono text-xs text-slate-400">{p.date}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          • {p.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                    Technical Skills
                  </h2>
                  {atsCvData.hardSkills?.length > 0 ? (
                    <ul className="text-xs space-y-1 text-slate-300">
                      {atsCvData.hardSkills.map((hs, idx) => (
                        <li key={idx}>• {hs}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Not yet included</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                    Soft Skills
                  </h2>
                  {atsCvData.softSkills?.length > 0 ? (
                    <ul className="text-xs space-y-1 text-slate-300">
                      {atsCvData.softSkills.map((ss, idx) => (
                        <li key={idx}>• {ss}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Not yet included</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  References
                </h2>
                {cvRefs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Not yet included</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cvRefs.map((r) => (
                      <div key={r.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5 text-xs">
                        <div className="font-bold text-white">{r.name}</div>
                        <div className="text-cyan-400">{r.designation}</div>
                        <div className="text-slate-400">{r.institution}</div>
                        <div className="text-slate-300 pt-1 font-mono text-[11px]">{r.contact}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </section>
        </div>

        {/* 3. CASE STUDIES */}
        <section id="projects" className="space-y-8 no-print">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">• FEATURED WORK</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Project Case Studies</h2>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {dynamicProjectCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setProjectCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    projectCategory === cat
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/30 border border-dashed border-slate-800 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-cyan-400 mx-auto" />
              <p className="text-white font-bold">Not yet included</p>
              <p className="text-xs text-slate-400">Project case studies have not been added to the database yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {p.proofImageUrl ? (
                    <div className="w-full h-48 sm:h-56 bg-slate-950 overflow-hidden relative border-b border-slate-800">
                      <img
                        src={p.proofImageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent" />
                    </div>
                  ) : null}

                  <div className="p-7 space-y-4 flex-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-400 text-[11px] uppercase tracking-wider font-bold">{p.category}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
                        {p.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white leading-snug">
                      {p.title}
                    </h3>

                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
                      <p className="text-xs text-slate-300 leading-relaxed">{p.summary || 'Not yet included'}</p>
                    </div>

                    {p.tools?.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">TOOLS & TECHNOLOGIES:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.tools.map((tag, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-950 border border-slate-800 text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-7 pb-6 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-[10px] text-slate-500">Source Code</span>
                    {p.github ? (
                      <a
                        href={ensureExternalUrl(p.github)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-2 text-xs font-bold transition-all shadow-sm"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>GitHub Repository</span>
                      </a>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Not yet included</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. TOOLS & SKILLS */}
        <section id="skills" className="space-y-8 no-print">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">• CORE EXPERTISE</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Skills & Technical Toolkit</h2>
          </div>

          {skillsList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-center text-xs text-slate-400">
              Not yet included
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dynamicSkillCategories.map((cat, idx) => {
                const catSkills = skillsList.filter(s => s.category === cat);
                return (
                  <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-sm text-cyan-400 font-mono uppercase tracking-wider">{cat}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{catSkills.length} tools</span>
                    </div>

                    <div className="space-y-2 text-xs font-mono text-slate-300">
                      {catSkills.map((s) => (
                        <div key={s.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {s.logoUrl ? (
                              <div className="w-7 h-7 rounded-lg bg-white/95 p-1 flex items-center justify-center shrink-0 shadow-sm">
                                <img src={s.logoUrl} alt={s.name} className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <span className="w-7 h-7 rounded-lg bg-slate-800 text-[10px] flex items-center justify-center font-bold text-cyan-400">
                                {s.name.charAt(0)}
                              </span>
                            )}
                            <span className="font-medium text-white">{s.name}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400">{s.proficiency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. EDUCATION */}
        <section id="education" className="space-y-8 no-print">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">• ACADEMIC TIMELINE</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Education Backgrounds</h2>
          </div>

          {educationList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-center text-xs text-slate-400">
              Not yet included
            </div>
          ) : (
            <div className="space-y-6">
              {educationList.map((ed) => (
                <div key={ed.id} className="p-7 sm:p-9 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/95 border border-cyan-500/30 p-1.5 flex items-center justify-center text-slate-900 overflow-hidden shrink-0 shadow-md">
                        {ed.logoUrl ? (
                          <img src={ed.logoUrl} alt={ed.institution} className="w-full h-full object-contain" />
                        ) : (
                          <GraduationCap className="w-7 h-7 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white">{ed.degree}</h3>
                        <p className="text-xs text-slate-400">{ed.institution} {ed.location ? `• ${ed.location}` : ''}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-cyan-400">
                      {ed.period || 'Not yet included'}
                    </span>
                  </div>

                  {ed.modules?.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">REGISTERED MODULES:</div>
                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        {ed.modules.map((mod, idx) => (
                          <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                            • {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. CERTIFICATES & DIGITAL BADGES (SEPARATED & HIGH-CONTRAST FORMATS) */}
        <section id="certificates" className="space-y-10 no-print">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">• CREDENTIALS</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Certificates & Badges</h2>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {dynamicCertOrgs.map(org => (
                <button
                  key={org}
                  onClick={() => setCertOrgFilter(org)}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    certOrgFilter === org
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {org}
                </button>
              ))}
            </div>
          </div>

          {filteredCerts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-center text-xs text-slate-400">
              Not yet included
            </div>
          ) : (
            <div className="space-y-12">
              
              {/* FORMAT 1: DIGITAL BADGES SHOWCASE (High-Contrast Frosted Plate so dark/transparent SVGs are 100% clear) */}
              {filteredBadges.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Digital Badges ({filteredBadges.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBadges.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 p-6 flex flex-col items-center text-center justify-between transition-all group shadow-lg"
                      >
                        <div className="w-full flex items-center justify-between text-[10px] font-mono mb-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                            {b.org} BADGE
                          </span>
                          <span className="text-slate-400">{b.date}</span>
                        </div>

                        {/* High-Visibility Frosted Badge Plate */}
                        <div className="w-28 h-28 rounded-2xl bg-linear-to-br from-white via-slate-100 to-slate-200 border-2 border-cyan-400/40 p-3.5 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)] my-2 group-hover:scale-105 transition-transform duration-300">
                          {b.badgeLogoUrl ? (
                            <img
                              src={b.badgeLogoUrl}
                              alt={b.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Award className="w-12 h-12 text-slate-800" />
                          )}
                        </div>

                        <div className="space-y-1 mt-3 w-full">
                          <h4 className="text-sm font-bold text-white leading-snug">{b.title}</h4>
                          <p className="text-xs text-cyan-400 font-mono font-bold">{b.org}</p>
                        </div>

                        <div className="w-full pt-4 mt-4 border-t border-slate-800">
                          {b.credentialUrl ? (
                            <a
                              href={ensureExternalUrl(b.credentialUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <span>Verify Credential Badge</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-500">Verified Achievement</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FORMAT 2: OFFICIAL CERTIFICATES (Wide Document Frame) */}
              {filteredCertificates.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider font-bold">
                    <Award className="w-4 h-4" />
                    <span>Official Certificates ({filteredCertificates.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCertificates.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between overflow-hidden group"
                      >
                        <div className="w-full h-56 bg-slate-950 overflow-hidden relative border-b border-slate-800 p-2">
                          {c.certImageUrl ? (
                            <img
                              src={c.certImageUrl}
                              alt={c.title}
                              className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 font-mono text-xs gap-1">
                              <Award className="w-10 h-10 text-amber-500/40" />
                              <span>Certificate Image Not Included</span>
                            </div>
                          )}
                          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg text-[10px] font-mono bg-amber-950/90 text-amber-300 border border-amber-500/40 font-bold shadow-md">
                            {c.org} CERTIFICATE
                          </div>
                        </div>

                        <div className="p-6 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-400">{c.date}</span>
                            <h4 className="text-base font-bold text-white leading-snug">{c.title}</h4>
                            <p className="text-xs text-amber-400 font-mono font-bold">{c.org}</p>
                          </div>
                          {c.certImageUrl && (
                            <a
                              href={ensureExternalUrl(c.certImageUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono flex items-center gap-1.5 shrink-0"
                            >
                              <span>View Full</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </section>

        {/* 7. VOLUNTEERING & COMMUNITY */}
        <section id="community" className="space-y-8 no-print">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">• ENGAGEMENT</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Participating, Volunteering & Activities</h2>
          </div>

          {communityActivities.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-center text-xs text-slate-400">
              Not yet included
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityActivities.map((act) => (
                <div key={act.id} className="p-7 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 text-[11px] font-bold uppercase">{act.type}</span>
                    <span className="text-slate-400 text-[11px]">{act.period}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{act.title}</h3>
                  {act.entity && <div className="text-xs text-slate-400 font-mono">{act.entity}</div>}
                  <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 8. TESTIMONIALS */}
        <section id="testimonials" className="space-y-8 no-print">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">• ENDORSEMENTS</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Recommendations</h2>
          </div>

          {testimonials.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-center text-xs text-slate-400">
              Not yet included
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="p-7 rounded-3xl bg-slate-900/30 border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <MessageSquare className="w-6 h-6 text-cyan-400" />
                    <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-800/80">
                    <h4 className="text-xs font-bold text-white font-mono">{t.author}</h4>
                    <p className="text-[11px] text-cyan-400 font-mono mt-0.5">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 9. CONTACT SECTION */}
        <section id="contact" className="space-y-8 no-print">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">• REACH OUT</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Let's Connect & Collaborate</h2>
            <p className="text-xs text-slate-400 mt-1">Available for Networking, cybersecurity and software engineering opportunities.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4 font-mono text-xs">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-slate-400 text-[10px]">PHONE NUMBER</div>
                  <div className="text-white font-bold mt-0.5 truncate">{profile.phone || <span className="text-slate-500 italic">Not yet included</span>}</div>
                </div>
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="text-cyan-400 hover:text-cyan-300 shrink-0 p-1">
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-slate-400 text-[10px]">EMAIL ADDRESS</div>
                  <div className="text-white font-bold mt-0.5 truncate">{profile.email || <span className="text-slate-500 italic">Not yet included</span>}</div>
                </div>
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="text-cyan-400 hover:text-cyan-300 shrink-0 p-1">
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-slate-400 text-[10px]">PROFESSIONAL NETWORK</div>
                  <div className="text-white font-bold mt-0.5 truncate">
                    {profile.linkedin ? cleanUrlDisplay(profile.linkedin) : <span className="text-slate-500 italic">Not yet included</span>}
                  </div>
                </div>
                {profile.linkedin && (
                  <a href={ensureExternalUrl(profile.linkedin)} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 shrink-0 p-1">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-slate-400 text-[10px]">CURRENT LOCATION</div>
                  <div className="text-white font-bold mt-0.5 truncate">{profile.location || <span className="text-slate-500 italic">Not yet included</span>}</div>
                </div>
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              </div>
            </div>

            {/* Direct Message Form */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSendMessage}
                className="p-5 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4 font-mono"
              >
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Jhon Doe"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 uppercase">Your Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="example@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 uppercase">Message Inquiry</label>
                  <textarea
                    rows="3"
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Message put here..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingMsg}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  <span>{isSendingMsg ? 'Sending...' : 'Send The Message'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-[#04060a] py-8 text-center text-xs font-mono text-slate-500 space-y-1 relative z-10 no-print px-4">
        <p>© {CURRENT_YEAR} {profile.name || 'Portfolio'} — Powered by Supabase Cloud BaaS</p>
      </footer>

      {/* FLOATING PORTFOLIO ASSISTANT BOT */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 no-print">
        {!isBotOpen ? (
          <button
            onClick={() => setIsBotOpen(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-slate-900 border border-cyan-500/40 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:border-cyan-400 transition-all font-mono text-xs cursor-pointer"
          >
            <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="font-semibold text-slate-200">Portfolio AI Assistant</span>
          </button>
        ) : (
          <div className="w-[calc(100vw-2rem)] sm:w-95 max-w-95 h-[75vh] max-h-130 sm:h-120 rounded-3xl bg-slate-950/95 border border-slate-800 shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl font-mono text-xs">
            <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-xs">{profile.name || 'Portfolio'}'s Assistant</span>
              </div>
              <button onClick={() => setIsBotOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {botMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line text-[11px] ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500 text-slate-950 font-bold rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isBotTyping && (
                <div className="text-[10px] text-slate-500 animate-pulse">Checking cloud database...</div>
              )}
              <div ref={botScrollRef} />
            </div>

            <form onSubmit={handleBotSubmit} className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={botInput}
                onChange={(e) => setBotInput(e.target.value)}
                placeholder="Ask about projects, CV, skills..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}