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
  
}