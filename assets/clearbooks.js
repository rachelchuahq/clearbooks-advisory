/**
 * ClearBooks Advisory Shared Client-Side Interactivity
 * - Conditional Popover API polyfill
 * - Native <dialog> light-dismiss fallback (closedby="any")
 * - Site-wide Quick Search modal
 * - Form validation (on blur + submit, clear on input)
 * - Real downloadable compliance artifacts (.ics, .csv, .txt)
 */
(function () {
  'use strict';

  // 1. Conditionally load Popover polyfill only when native support is missing
  if (!Object.hasOwn(HTMLElement.prototype, 'popover')) {
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js';
    document.head.appendChild(s);
  }

  // 2. Fallback for dialog[closedby="any"] in browsers lacking closedBy (e.g. Safari)
  function initDialogLightDismiss() {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, dialog)) dialog.close();
      });
    }
  }

  // 3. Toast helper (accessible live region)
  function showToast(message) {
    let existing = document.getElementById('cb-toast-region');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'cb-toast-region';
    toast.className = 'cb-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;color:#b7c4ff" aria-hidden="true">check_circle</span><span></span>`;
    toast.querySelector('span:last-child').textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4500);
  }
  window.cbShowToast = showToast;

  // 4. Real file download helpers
  function triggerDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`Downloaded ${filename}`);
  }

  window.cbDownloadBirCalendar = function () {
    const text = [
      'CLEARBOOKS CO. — 2025 PHILIPPINE BIR STATUTORY TAX CALENDAR',
      'Accredited Philippine Accounting & Tax Compliance (PRC / BIR / SEC)',
      '==================================================================',
      '',
      'MONTHLY DEADLINES (eFPS / eBIRForms):',
      '- 10th of Month: BIR Form 1601-C (Withholding Tax on Compensation), 0619-E / 0619-F',
      '- 15th of Month: SSS, PhilHealth, Pag-IBIG Mandatory Employer Remittances',
      '- 20th of Month: BIR Form 2550M (Monthly VAT - if applicable)',
      '- 25th of Following Month after Quarter: BIR Form 2550Q (Quarterly VAT) / 2551Q (Percentage Tax)',
      '',
      'QUARTERLY INCOME TAX:',
      '- Q1: May 15 (1701Q Individual / 1702Q Corporate)',
      '- Q2: August 15 (1701Q / 1702Q)',
      '- Q3: November 15 (1701Q / 1702Q)',
      '',
      'ANNUAL STATUTORY FILINGS:',
      '- Jan 31: BIR Form 1604-C, 1604-F, Alphalist & Form 2316 Distribution',
      '- Apr 15: Annual Income Tax Return (1701 / 1701A / 1702-RT / 1702-EX) & eAFS Submission',
      '- Apr 30 - May 30: SEC Audited Financial Statements (AFS) & General Information Sheet (GIS)',
      '',
      'Need automated deadline tracking? Visit https://clearbooks.ph or book at contact.html'
    ].join('\n');
    triggerDownload('2025-BIR-Statutory-Calendar-Wallchart.txt', text, 'text/plain;charset=utf-8');
  };

  window.cbDownloadIcsCalendar = function () {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ClearBooks Advisory//BIR Compliance Calendar//EN',
      'BEGIN:VEVENT',
      'UID:inquiry@clearbooksadvisory.online',
      'DTSTAMP:20250101T000000Z',
      'DTSTART;VALUE=DATE:20250110',
      'RRULE:FREQ=MONTHLY;BYMONTHDAY=10',
      'SUMMARY:BIR Form 1601-C & 0619-E Deadline (ClearBooks Advisory)',
      'DESCRIPTION:Monthly Withholding Tax on Compensation & Expanded Withholding Tax remittance.',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:inquiry@clearbooksadvisory.online',
      'DTSTAMP:20250101T000000Z',
      'DTSTART;VALUE=DATE:20250425',
      'RRULE:FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=25',
      'SUMMARY:BIR Form 2550Q / 2551Q Quarterly Filing (ClearBooks Advisory)',
      'DESCRIPTION:Quarterly VAT or Percentage Tax filing deadline.',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:inquiry@clearbooksadvisory.online',
      'DTSTAMP:20250101T000000Z',
      'DTSTART;VALUE=DATE:20250415',
      'SUMMARY:Annual Income Tax Return (1701/1702) Deadline (ClearBooks Advisory)',
      'DESCRIPTION:Annual ITR filing and eAFS attachment deadline.',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    triggerDownload('ClearBooks-BIR-Deadlines-Sync.ics', ics, 'text/calendar;charset=utf-8');
  };

  window.cbDownloadAuditChecklist = function () {
    const csv = [
      'Category,Requirement,BIR/SEC Form,Frequency,Standard Penalty Risk',
      'Income Tax,Annual Income Tax Return,1701 / 1701A / 1702-RT,Annual (Apr 15),25% Surcharge + 12% Interest p.a.',
      'Income Tax,Quarterly Income Tax Return,1701Q / 1702Q,Quarterly,25% Surcharge + Compromise',
      'VAT / Percentage,Quarterly VAT or Percentage Tax,2550Q / 2551Q,Quarterly (25th),25% Surcharge + 12% Interest',
      'Withholding,Compensation Withholding Tax,1601-C,Monthly (10th),25% Surcharge per late month',
      'Withholding,Expanded Withholding Tax,0619-E / 1601-EQ,Monthly / Quarterly,Disallowance of Expenses',
      'Withholding,Certificate of Creditable Tax Withheld,2307,Quarterly / Per Payment,Loss of Tax Credits',
      'Corporate SEC,General Information Sheet,GIS via eFAST,Annual (30 days post-ASM),PHP 5000 - 20000+ late fine',
      'Corporate SEC,Audited Financial Statements,AFS via eFAST,Annual (per SEC schedule),PHP 10000+ & Revocation risk'
    ].join('\n');
    triggerDownload('2025-Corporate-Tax-Audit-Checklist.csv', csv, 'text/csv;charset=utf-8');
  };

  window.cbDownloadSlaProtocol = function () {
    const text = [
      'CLEARBOOKS CO. — 14-DAY CLIENT ONBOARDING SLA PROTOCOL',
      '=======================================================',
      '',
      'Step 01 (Day 1): Initial Diagnostic & Entity Discovery',
      '  - Review BIR COR (Form 2303), SEC Articles/GIS, and prior 12-month returns.',
      '  - Identify open cases, unfiled returns, or missing Books of Accounts.',
      '',
      'Step 02 (Days 2-3): Encrypted Vault & Ledger Architecture',
      '  - Provision RA 10173-compliant document vault & digital receipt pipeline.',
      '  - Map Chart of Accounts to Philippine Financial Reporting Standards (PFRS).',
      '',
      'Step 03 (Days 4-5): Historical Cleanup & Tax Reconciliation',
      '  - Reconcile Form 2307 tax credits, SLSP/SAWT schedules, and bank statements.',
      '  - Configure eFPS / eBIRForms automated filing calendar.',
      '',
      'Step 04 (Days 6-14): Live Parallel Run & Dedicated CPA Handover',
      '  - First monthly/quarterly statutory filings verified by Senior CPA Reviewer.',
      '  - 48-Hour SLA active for all tax inquiries and regulatory correspondence.'
    ].join('\n');
    triggerDownload('ClearBooks-Onboarding-SLA-Protocol.txt', text, 'text/plain;charset=utf-8');
  };

  // 5. Accessible form validation helper
  function initFormValidation() {
    document.querySelectorAll('form[data-cb-validate]').forEach((form) => {
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach((field) => {
        field.addEventListener('blur', () => {
          if (field.value.trim() !== '' || field.dataset.touched === 'true') {
            field.setAttribute('aria-invalid', String(!field.checkValidity()));
          }
        });
        field.addEventListener('input', () => {
          field.dataset.touched = 'true';
          field.setCustomValidity('');
          if (field.checkValidity()) {
            field.removeAttribute('aria-invalid');
          }
        });
      });
    });
  }

  // 6. Site-wide Quick Search Modal
  const SEARCH_INDEX = [
    { title: 'Home — Packages & Consultation', url: 'index.html', desc: 'Freelancer, SMB, and Corporate bookkeeping packages starting at ₱2,500/mo.' },
    { title: 'BIR Compliance Guide 2025', url: 'bir-compliance-guide.html', desc: 'Statutory tax calendar, Form 1701Q, 2551Q, 2550Q, 1601-C, 2307 & Audit Shield.' },
    { title: 'Corporate & SME Compliance', url: 'corporate-compliance.html', desc: 'Dedicated CPA controllers, eFPS management, LOA defense & compliance checklist.' },
    { title: 'How We Do Business (14-Day Methodology)', url: 'how-we-do-business.html', desc: '4-step client onboarding, SLA protocol, and interactive methodology.' },
    { title: 'SEC Statutory Disclosures (GIS & AFS)', url: 'sec-disclosures.html', desc: 'SEC eFAST, General Information Sheet, Audited Financial Statements & MC 28-2020.' },
    { title: 'eFPS Step-by-Step Portal Guide', url: 'efps-portal-guide.html', desc: 'Electronic Filing and Payment System enrollment, AAB banking & eAFS.' },
    { title: 'CPA Accreditation Credentials', url: 'cpa-credentials.html', desc: 'PRC Board of Accountancy, BIR Accreditation & SEC External Auditor standards.' },
    { title: 'Contact Support & Book Consultation', url: 'contact.html', desc: 'Schedule a free 20-min diagnostic or message our remote Philippine CPA team.' },
    { title: 'Privacy Policy & RA 10173 Compliance', url: 'privacy-policy.html', desc: 'Data Privacy Act of 2012 safeguards, encryption & DPO contact.' },
    { title: 'Terms of Service', url: 'terms-of-service.html', desc: 'ClearBooks Advisory engagement terms, 48-hour SLA & accuracy guarantee.' },
    { title: 'Security & Ledger Integrity', url: 'security.html', desc: 'AES-256 encryption, role-based access & audit trail architecture.' }
  ];

  function ensureSearchDialog() {
    let dialog = document.getElementById('cb-search-dialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'cb-search-dialog';
    dialog.setAttribute('closedby', 'any');
    dialog.setAttribute('aria-labelledby', 'cb-search-title');
    dialog.className = 'w-full max-w-xl rounded-xl border border-outline-variant bg-white p-0 shadow-2xl text-on-surface';
    dialog.innerHTML = `
      <div class="p-4 border-b border-outline-variant/40 flex items-center justify-between gap-3 bg-surface-container-low">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary" aria-hidden="true">search</span>
          <h2 id="cb-search-title" class="font-bold text-primary text-base">Search ClearBooks Advisory</h2>
        </div>
        <button type="button" id="cb-search-close" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant" aria-label="Close search">
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>
      <div class="p-4 space-y-3">
        <label for="cb-search-input" class="sr-only">Search pages, BIR forms, or compliance topics</label>
        <input id="cb-search-input" type="search" autofocus placeholder="Search BIR forms (1701Q, 2307), SEC, eFPS, packages..." class="w-full rounded-lg border border-outline-variant px-3.5 py-2.5 text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20">
        <ul id="cb-search-results" class="divide-y divide-outline-variant/30 max-h-80 overflow-y-auto"></ul>
      </div>
    `;
    document.body.appendChild(dialog);

    const input = dialog.querySelector('#cb-search-input');
    const results = dialog.querySelector('#cb-search-results');
    const closeBtn = dialog.querySelector('#cb-search-close');

    function render(query) {
      const q = (query || '').trim().toLowerCase();
      const matches = q
        ? SEARCH_INDEX.filter((item) => item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q))
        : SEARCH_INDEX.slice(0, 6);
      if (matches.length === 0) {
        results.innerHTML = `<li class="py-6 text-center text-sm text-on-surface-variant">No matching guides found. Try <a href="contact.html" class="text-secondary font-semibold underline">contacting a CPA</a>.</li>`;
        return;
      }
      results.innerHTML = matches
        .map(
          (m) => `
          <li>
            <a href="${m.url}" class="block py-3 px-2 rounded-lg hover:bg-surface-container-low transition-colors">
              <div class="font-semibold text-sm text-primary">${m.title}</div>
              <div class="text-xs text-on-surface-variant mt-0.5">${m.desc}</div>
            </a>
          </li>`
        )
        .join('');
    }

    input.addEventListener('input', () => render(input.value));
    closeBtn.addEventListener('click', () => dialog.close());
    render('');
    return dialog;
  }

  function initSearchTriggers() {
    document.querySelectorAll('[data-open-search]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = ensureSearchDialog();
        d.showModal();
        d.querySelector('#cb-search-input')?.focus();
      });
    });
  }

  // 6b. Lead Generation Email Capture Modal for Compliance Guide
  // Paste your deployed Google Apps Script Web App URL below to log leads into your Google Sheet:
  const CB_SHEETS_WEBHOOK_URL = window.CB_SHEETS_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbyV98pZ4Ym1RXaafNjiKPIObbtb9Yj_pdpclUljJikHCxPw9AJP6mi9o-zn0DPGK6aLLA/exec';

  window.cbSubmitLeadToSheet = async function ({ firstName, lastName, email, sourcePage }) {
    const payload = {
      sheetTab: 'Email Capture',
      timestamp: new Date().toISOString(),
      firstName: (firstName || '').trim(),
      lastName: (lastName || '').trim(),
      email: (email || '').trim(),
      sourcePage: sourcePage || window.location.pathname.split('/').pop() || 'index.html'
    };
    if (!CB_SHEETS_WEBHOOK_URL) {
      console.info('ClearBooks Lead Captured (configure CB_SHEETS_WEBHOOK_URL to sync to Google Sheets):', payload);
      return;
    }
    try {
      await fetch(CB_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Could not send lead to Google Sheet:', err);
    }
  };

  window.cbSubmitConsultationToSheet = async function ({ formType, fullName, contact, businessStructure, notes, sourcePage }) {
    const payload = {
      sheetTab: 'Consultations',
      timestamp: new Date().toISOString(),
      formType: (formType || 'Consultation').trim(),
      fullName: (fullName || '').trim(),
      contact: (contact || '').trim(),
      businessStructure: (businessStructure || '').trim(),
      notes: (notes || '').trim(),
      sourcePage: sourcePage || window.location.pathname.split('/').pop() || 'index.html'
    };
    if (!CB_SHEETS_WEBHOOK_URL) return;
    try {
      await fetch(CB_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Could not send consultation to Google Sheet:', err);
    }
  };

  function ensureLeadGuideDialog() {
    let dialog = document.getElementById('cb-lead-guide-dialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'cb-lead-guide-dialog';
    dialog.setAttribute('closedby', 'any');
    dialog.setAttribute('aria-labelledby', 'cb-lead-guide-title');
    dialog.className = 'w-full max-w-2xl rounded-2xl border border-outline-variant bg-white p-0 shadow-2xl text-on-surface';
    dialog.innerHTML = `
      <div class="relative p-6 sm:p-8">
        <button type="button" id="cb-lead-guide-close" aria-label="Close modal" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors">
          <span class="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
        </button>
        <div id="cb-lead-form-view">
          <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">
              <span class="material-symbols-outlined text-[14px] text-secondary" aria-hidden="true">calendar_month</span>
              Official Resource
            </span>
            <span class="text-xs font-mono font-semibold text-secondary">Updated for FY2026</span>
          </div>
          <h2 id="cb-lead-guide-title" class="text-2xl font-bold text-primary tracking-tight mb-2">Get the Philippine BIR &amp; Statutory Tax Calendar Guide</h2>
          <p class="text-sm text-on-surface-variant mb-6">Enter your name and email address and our accredited CPAs will send the complete compliance roadmap, statutory deadlines, and surcharge matrix straight to your inbox.</p>
          <form id="cb-lead-guide-form" class="space-y-4" data-cb-validate>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="cb-lead-first-name" class="block text-sm font-semibold text-primary mb-1.5">First Name <span class="text-error">*</span></label>
                <input id="cb-lead-first-name" name="firstName" type="text" required autofocus autocomplete="given-name" placeholder="Maria" class="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none">
              </div>
              <div>
                <label for="cb-lead-last-name" class="block text-sm font-semibold text-primary mb-1.5">Last Name <span class="text-error">*</span></label>
                <input id="cb-lead-last-name" name="lastName" type="text" required autocomplete="family-name" placeholder="Santos" class="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none">
              </div>
            </div>
            <div>
              <label for="cb-lead-email" class="block text-sm font-semibold text-primary mb-1.5">Email Address <span class="text-error">*</span></label>
              <input id="cb-lead-email" name="email" type="email" required autocomplete="email" placeholder="maria@company.ph" class="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none">
            </div>
            <button type="submit" class="w-full bg-secondary text-white font-bold text-sm py-3.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[20px]" aria-hidden="true">mail</span>
              <span>Send Me the Compliance Guide</span>
            </button>
            <p class="text-xs text-center text-on-surface-variant flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-emerald-600" aria-hidden="true">verified_user</span>
              <span>Free resource prepared by ClearBooks Advisory accredited CPAs. 100% spam-free.</span>
            </p>
          </form>
        </div>
        <div id="cb-lead-success-view" class="hidden text-center py-6 space-y-4">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined text-[28px]" aria-hidden="true">mark_email_read</span>
          </div>
          <h3 class="text-xl font-bold text-primary">Check Your Inbox!</h3>
          <p class="text-sm text-on-surface-variant max-w-md mx-auto">Thank you, <strong id="cb-lead-sent-name" class="text-primary"></strong>! We've sent the Philippine BIR &amp; Statutory Tax Calendar Guide to <strong id="cb-lead-sent-email" class="text-primary font-mono"></strong>.</p>
          <button type="button" id="cb-lead-done-btn" class="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-container">Done</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    const formView = dialog.querySelector('#cb-lead-form-view');
    const successView = dialog.querySelector('#cb-lead-success-view');
    const form = dialog.querySelector('#cb-lead-guide-form');
    const firstInput = dialog.querySelector('#cb-lead-first-name');
    const lastInput = dialog.querySelector('#cb-lead-last-name');
    const emailInput = dialog.querySelector('#cb-lead-email');
    const sentName = dialog.querySelector('#cb-lead-sent-name');
    const sentEmail = dialog.querySelector('#cb-lead-sent-email');

    dialog.querySelector('#cb-lead-guide-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('#cb-lead-done-btn').addEventListener('click', () => dialog.close());

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = firstInput.value.trim();
      const lastName = lastInput.value.trim();
      const email = emailInput.value.trim();
      await window.cbSubmitLeadToSheet({ firstName, lastName, email });
      sentName.textContent = `${firstName} ${lastName}`.trim();
      sentEmail.textContent = email;
      formView.classList.add('hidden');
      successView.classList.remove('hidden');
      form.reset();
    });
    return dialog;
  }

  window.cbOpenLeadGuideModal = function () {
    const d = ensureLeadGuideDialog();
    d.querySelector('#cb-lead-form-view').classList.remove('hidden');
    d.querySelector('#cb-lead-success-view').classList.add('hidden');
    d.showModal();
    d.querySelector('#cb-lead-first-name')?.focus();
  };

  // 6c. Global "Ready for stress-free books?" Schedule a Consultation Modal
  window.cbOpenScheduleCallModal = function (defaultStructure) {
    const existing = document.getElementById('schedule-call-dialog');
    if (existing) {
      const sel = document.getElementById('modalBusinessStructure');
      if (sel && defaultStructure) sel.value = defaultStructure;
      existing.showModal();
      return;
    }

    let dialog = document.getElementById('cb-global-schedule-dialog');
    let confirmDialog = document.getElementById('cb-global-schedule-confirm');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'cb-global-schedule-dialog';
      dialog.setAttribute('closedby', 'any');
      dialog.setAttribute('aria-labelledby', 'cb-global-schedule-title');
      dialog.className = 'w-full max-w-5xl rounded-2xl border border-outline/30 bg-[#001428] p-0 shadow-2xl text-white';
      dialog.innerHTML = `
        <div class="p-6 sm:p-8 lg:p-12 relative overflow-hidden">
          <div class="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#1d4ed8] opacity-20 blur-3xl pointer-events-none"></div>
          <button type="button" id="cb-global-sched-close" aria-label="Close modal" class="absolute top-4 right-4 z-20 p-2 rounded-lg bg-[#0f2942] text-[#dce1ff] hover:bg-[#1d4ed8] hover:text-white transition-colors">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
            <div class="lg:col-span-6 flex flex-col justify-center text-white">
              <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0f2942] text-[#dce1ff] text-xs font-semibold w-fit mb-4 border border-white/15">
                <span class="material-symbols-outlined text-[16px]" aria-hidden="true">calendar_today</span>
                <span>Direct CPA Access</span>
              </div>
              <h2 id="cb-global-schedule-title" class="text-3xl font-extrabold tracking-tight mb-4 text-white">Ready for stress-free books?</h2>
              <p class="text-base text-[#dce1ff] mb-6 leading-relaxed">Book a free 20-minute books review with our accredited CPAs. We'll identify upcoming statutory deadlines, discover tax savings, and optimize your filing cadence without any obligation.</p>
              <div class="space-y-3 mb-6 text-sm text-[#dce1ff]">
                <div class="flex items-center gap-3"><span class="material-symbols-outlined text-[#4069f2] text-[20px]" aria-hidden="true">check_circle</span><span>Confidential assessment of current BIR tax status</span></div>
                <div class="flex items-center gap-3"><span class="material-symbols-outlined text-[#4069f2] text-[20px]" aria-hidden="true">check_circle</span><span>Custom package recommendations tailored to gross revenue</span></div>
                <div class="flex items-center gap-3"><span class="material-symbols-outlined text-[#4069f2] text-[20px]" aria-hidden="true">check_circle</span><span>Direct consultation with licensed Philippine tax practitioners</span></div>
              </div>
              <div class="flex items-start gap-2.5 pt-4 border-t border-[#0f2942] text-[#b0c9e8] text-xs">
                <span class="material-symbols-outlined text-[16px] shrink-0 mt-0.5" aria-hidden="true">privacy_tip</span>
                <span>ClearBooks Advisory adheres strictly to the Philippine Data Privacy Act of 2012 (RA 10173). Your accounting records remain private and encrypted.</span>
              </div>
            </div>
            <div class="lg:col-span-6">
              <div class="bg-white rounded-xl p-6 sm:p-8 shadow-lg text-[#0d1c2f]">
                <h3 class="text-xl font-bold text-[#001428] mb-1">Request Free 20-Min Review</h3>
                <p class="text-sm text-[#74777e] mb-6">Fill in your basic details and our compliance team will reach out within 2 business hours.</p>
                <form id="cb-global-sched-form" class="space-y-4" data-cb-validate>
                  <div>
                    <label class="block text-xs font-semibold text-[#001428] mb-1.5" for="cbGlobalFullName">Full Name</label>
                    <input class="w-full px-3.5 py-2.5 rounded-lg border border-[#c3c6ce] bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20 text-sm text-[#0d1c2f]" id="cbGlobalFullName" name="fullName" placeholder="e.g. Maria Santos, CPA" required type="text" autofocus>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[#001428] mb-1.5" for="cbGlobalContactInfo">Email or Phone Number</label>
                    <input class="w-full px-3.5 py-2.5 rounded-lg border border-[#c3c6ce] bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20 text-sm text-[#0d1c2f]" id="cbGlobalContactInfo" name="contactInfo" placeholder="maria@example.com or +63 917 123 4567" required type="text">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[#001428] mb-1.5" for="cbGlobalBusinessStructure">Business Structure</label>
                    <select class="w-full px-3.5 py-2.5 rounded-lg border border-[#c3c6ce] bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20 text-sm text-[#0d1c2f]" id="cbGlobalBusinessStructure" name="businessStructure">
                      <option value="solo">Solo Freelancer / Individual Professional</option>
                      <option value="opc">One Person Corporation (OPC)</option>
                      <option value="partnership">General or Limited Partnership</option>
                      <option value="corporation">Domestic Corporation / SME</option>
                      <option value="foreign">Foreign Corporation Branch / Representative Office</option>
                    </select>
                  </div>
                  <button class="w-full bg-[#1d4ed8] text-white hover:bg-[#0039b5] py-3.5 rounded-lg font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2" type="submit">
                    <span class="material-symbols-outlined text-[20px]" aria-hidden="true">send</span>
                    <span>Request Free 20-Min Review</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);

      confirmDialog = document.createElement('dialog');
      confirmDialog.id = 'cb-global-schedule-confirm';
      confirmDialog.setAttribute('closedby', 'any');
      confirmDialog.setAttribute('aria-labelledby', 'cb-global-confirm-title');
      confirmDialog.className = 'w-full max-w-md rounded-xl border border-[#c3c6ce] bg-white p-6 shadow-2xl text-[#0d1c2f]';
      confirmDialog.innerHTML = `
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
            </div>
            <div>
              <h2 id="cb-global-confirm-title" class="font-bold text-[#001428] text-lg">You’re on the calendar!</h2>
              <p class="text-xs text-[#43474d]">48-Hour CPA Advisory SLA</p>
            </div>
          </div>
          <button type="button" id="cb-global-confirm-close" class="p-1 rounded-lg hover:bg-[#eff4ff]" aria-label="Close">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <p class="text-sm text-[#43474d] leading-relaxed mb-5">We’ll send you a confirmation email with your meeting link. If you have recent BIR filings or financial questions you’d like us to look at beforehand, simply reply to that email—our team will review them ahead of our call.</p>
        <button type="button" id="cb-global-confirm-done" class="w-full px-4 py-2.5 rounded-lg bg-[#1d4ed8] text-white text-sm font-semibold hover:bg-[#0039b5]">Done</button>
      `;
      document.body.appendChild(confirmDialog);

      dialog.querySelector('#cb-global-sched-close').addEventListener('click', () => dialog.close());
      confirmDialog.querySelector('#cb-global-confirm-close').addEventListener('click', () => confirmDialog.close());
      confirmDialog.querySelector('#cb-global-confirm-done').addEventListener('click', () => confirmDialog.close());
      dialog.querySelector('#cb-global-sched-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        await window.cbSubmitConsultationToSheet({
          formType: 'Footer — Schedule a Consultation',
          fullName: form.querySelector('#cbGlobalFullName').value,
          contact: form.querySelector('#cbGlobalContactInfo').value,
          businessStructure: form.querySelector('#cbGlobalBusinessStructure').value,
          notes: '',
          sourcePage: window.location.pathname.split('/').pop() || 'index.html'
        });
        dialog.close();
        confirmDialog.showModal();
        form.reset();
      });
    }
    const sel = dialog.querySelector('#cbGlobalBusinessStructure');
    if (sel && defaultStructure) sel.value = defaultStructure;
    dialog.showModal();
  };

  // 7. Highlight current page in nav
  function markCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('header nav a[href], #mobile-nav-menu a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureSearchDialog();
    initDialogLightDismiss();
    initFormValidation();
    initSearchTriggers();
    markCurrentPage();
  });
})();
