// ============================================================
//  CTS TRANSPORTATION — APPLICATION BINDER EMAIL SERVICE
//  Paste this ENTIRE file into Google Apps Script (script.google.com)
//  Then Deploy → New Deployment → Web App → Anyone → Deploy
// ============================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var recipientEmail = "johan.rojas@nctechsolutionsllc.com";
    var senderName     = "CTS Transportation Portal";
    var applicantName  = data.w9?.legal_name || data.driver_file?.driver_name || "Unknown Applicant";
    var subject        = "📋 New Driver Application: " + applicantName + " — " + new Date().toLocaleDateString();

    // Build the HTML content for the PDF
    var htmlBody = buildApplicationHTML(data, applicantName);

    // Create PDF from HTML
    var blob = HtmlService.createHtmlOutput(htmlBody)
                          .getContent();
    var pdfBlob = Utilities.newBlob(blob, MimeType.HTML)
                           .getAs(MimeType.PDF)
                           .setName("CTS_Application_" + applicantName.replace(/\s+/g, "_") + ".pdf");

    // Send the email with PDF attached
    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      htmlBody: buildEmailNotification(applicantName, data),
      attachments: [pdfBlob],
      name: senderName
    });

    // Return success
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Application sent to " + recipientEmail
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Quick GET test endpoint
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "CTS Email Service is running."
  })).setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
//  EMAIL NOTIFICATION (short email body)
// ============================================================
function buildEmailNotification(name, data) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width:600px; margin:0 auto; padding:30px;">
    <div style="background:#002F6C; padding:24px 30px; border-radius:16px 16px 0 0;">
      <h1 style="color:white; margin:0; font-size:20px; letter-spacing:2px;">CTS TRANSPORTATION</h1>
      <p style="color:rgba(255,255,255,0.7); margin:4px 0 0; font-size:11px; letter-spacing:3px;">DRIVER RECRUITMENT PORTAL</p>
    </div>
    <div style="background:#f8fafc; padding:30px; border:1px solid #e2e8f0; border-top:none; border-radius:0 0 16px 16px;">
      <h2 style="color:#002F6C; margin:0 0 16px; font-size:18px;">New Application Received</h2>
      <table style="width:100%; font-size:13px; color:#475569;">
        <tr><td style="padding:6px 0; font-weight:700; width:140px;">Applicant:</td><td>${name}</td></tr>
        <tr><td style="padding:6px 0; font-weight:700;">Date:</td><td>${new Date().toLocaleString()}</td></tr>
        <tr><td style="padding:6px 0; font-weight:700;">Driver License:</td><td>${data.driver_file?.dl_number || 'N/A'}</td></tr>
        <tr><td style="padding:6px 0; font-weight:700;">Equipment Class:</td><td>${data.authorization?.equipment_class || 'N/A'}</td></tr>
        <tr><td style="padding:6px 0; font-weight:700;">Experience:</td><td>${data.authorization?.years_exp || 'N/A'} years</td></tr>
      </table>
      <div style="margin-top:24px; padding:16px; background:#f0fdf4; border-radius:12px; border:1px solid #bbf7d0;">
        <p style="margin:0; font-size:12px; color:#15803d; font-weight:700;">✅ Full application PDF is attached to this email.</p>
      </div>
      <p style="margin-top:20px; font-size:11px; color:#94a3b8;">This is an automated message from the CTS Transportation recruitment portal.</p>
    </div>
  </div>`;
}


// ============================================================
//  FULL APPLICATION BINDER (PDF content)
// ============================================================
function buildApplicationHTML(data, applicantName) {
  var w9     = data.w9 || {};
  var df     = data.driver_file || {};
  var auth   = data.authorization || {};
  var emp    = data.employment || {};
  var safety = data.safety || {};
  var fcra   = data.fcra || {};
  var cert   = data.certification || {};

  function v(val) { return val || '—'; }
  function chk(val) { return val === true ? '✅' : '○'; }
  function badge(val, label) {
    if (val === true) return '<span style="background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:800;">✅ ' + label + '</span>';
    return '<span style="background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:800;">✗ NOT ' + label + '</span>';
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; line-height:1.6; padding:40px; font-size:11px; }
  .header { border-bottom:4px solid #002F6C; padding-bottom:20px; margin-bottom:30px; }
  .header h1 { color:#002F6C; font-size:24px; letter-spacing:-0.5px; }
  .header p { color:#94a3b8; font-size:9px; letter-spacing:3px; text-transform:uppercase; }
  .section { margin-bottom:28px; page-break-inside:avoid; }
  .section-title { border-bottom:2px solid #002F6C; padding-bottom:4px; margin-bottom:12px; font-size:10px; font-weight:900; color:#002F6C; text-transform:uppercase; letter-spacing:1px; }
  .grid { display:flex; flex-wrap:wrap; gap:4px 20px; margin-bottom:10px; }
  .field { flex:1; min-width:140px; margin-bottom:8px; }
  .dl { font-size:8px; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; margin-bottom:1px; }
  .dv { font-size:11px; font-weight:700; color:#1e293b; }
  .checklist { background:#f8fafc; padding:12px; border-radius:8px; font-size:10px; line-height:2; }
  .qa-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f1f5f9; font-size:10px; }
  .seal { margin-top:40px; padding-top:20px; border-top:4px solid #f1f5f9; text-align:center; }
</style></head><body>

<div class="header">
  <h1>COMPREHENSIVE APPLICATION BINDER</h1>
  <p>CTS Transportation • Recruitment Division • Generated ${new Date().toLocaleString()}</p>
  <div style="margin-top:8px;font-size:10px;font-weight:700;">Applicant: <span style="color:#002F6C;">${applicantName}</span></div>
</div>

<!-- SECTION 1: W-9 -->
<div class="section">
  <div class="section-title">Section 01 — W-9 Compliance & Taxpayer Identification</div>
  <div class="grid">
    <div class="field"><div class="dl">Legal Name</div><div class="dv">${v(w9.legal_name)}</div></div>
    <div class="field"><div class="dl">Business Name</div><div class="dv">${v(w9.business_name)}</div></div>
    <div class="field"><div class="dl">Address</div><div class="dv">${v(w9.address)}</div></div>
    <div class="field"><div class="dl">City, State, ZIP</div><div class="dv">${v(w9.city_state_zip)}</div></div>
    <div class="field"><div class="dl">Payee Code</div><div class="dv">${v(w9.payee_code)}</div></div>
    <div class="field"><div class="dl">FATCA Code</div><div class="dv">${v(w9.fatca_code)}</div></div>
  </div>
</div>

<!-- SECTION 2: DRIVER FILE -->
<div class="section">
  <div class="section-title">Section 02 — Operator Credentials & Compliance Checklist</div>
  <div class="grid">
    <div class="field"><div class="dl">Driver Name</div><div class="dv">${v(df.driver_name)}</div></div>
    <div class="field"><div class="dl">SSN</div><div class="dv">${df.driver_ssn ? '•••-••-••••' : '—'}</div></div>
    <div class="field"><div class="dl">Date of Birth</div><div class="dv">${v(df.driver_dob)}</div></div>
    <div class="field"><div class="dl">License #</div><div class="dv">${v(df.dl_number)}</div></div>
    <div class="field"><div class="dl">State</div><div class="dv">${v(df.dl_state)}</div></div>
    <div class="field"><div class="dl">Class</div><div class="dv">${v(df.dl_class)}</div></div>
  </div>
  <div class="grid">${badge(df.cdl_endorsement, 'CDL ENDORSED')}</div>
  <div class="checklist">
    ${chk(df.chk_completed_app)} Completed App &nbsp; ${chk(df.chk_10yr_history)} 10yr History &nbsp; ${chk(df.chk_employment_verify)} Employment Verify<br>
    ${chk(df.chk_physical_exam)} Physical Exam (${v(df.physical_exp_date)}) &nbsp; ${chk(df.chk_valid_license)} Valid License (${v(df.license_exp_date)})<br>
    ${chk(df.chk_mvr)} MVR &nbsp; ${chk(df.chk_doctor_cert)} Doctor Cert &nbsp; ${chk(df.chk_eligibility)} Eligibility &nbsp; ${chk(df.chk_renewed)} Renewed<br>
    ${chk(df.chk_ss_card)} SS Card &nbsp; ${chk(df.chk_twic)} TWIC &nbsp; ${chk(df.chk_resident_card)} Resident Card<br>
    ${chk(df.chk_mvr_original)} MVR Original (${v(df.mvr_original_date)}) &nbsp; ${chk(df.chk_psp_report)} PSP Report<br>
    ${chk(df.chk_pre_employment)} Pre-Employment (${v(df.pre_employment_date)}) &nbsp; ${chk(df.chk_coc)} COC<br>
    ${chk(df.chk_i9)} I-9 &nbsp; ${chk(df.chk_dach)} DACH (${v(df.dach_query_exp)})<br>
    ${chk(df.chk_hazmat)} HazMat (${v(df.hazmat_exp_date)}) &nbsp; ${chk(df.chk_h2s)} H2S (${v(df.h2s_exp_date)})<br>
    ${chk(df.chk_road_test)} Road Test &nbsp; ${chk(df.chk_signed_ack)} Signed Ack
  </div>
</div>

<!-- SECTION 3: AUTHORIZATION -->
<div class="section">
  <div class="section-title">Section 03 — Authorization, Experience & Background</div>
  <div class="grid">${badge(auth.auth_terms_accepted, 'TERMS ACCEPTED')}</div>
  <div class="grid">
    <div class="field"><div class="dl">Equipment Class</div><div class="dv">${v(auth.equipment_class)}</div></div>
    <div class="field"><div class="dl">Years Experience</div><div class="dv">${v(auth.years_exp)}</div></div>
    <div class="field"><div class="dl">Total Miles</div><div class="dv">${v(auth.total_miles)}</div></div>
  </div>
  <div class="grid">
    <div class="field"><div class="dl">Accident Date</div><div class="dv">${v(auth.accident_date)}</div></div>
    <div class="field"><div class="dl">Nature</div><div class="dv">${v(auth.accident_nature)}</div></div>
    <div class="field"><div class="dl">Fatalities</div><div class="dv">${v(auth.fatalities)}</div></div>
    <div class="field"><div class="dl">Injuries</div><div class="dv">${v(auth.injuries)}</div></div>
  </div>
  <div class="qa-row"><span>Denied license/permit?</span><span style="font-weight:900">${auth.denied_yes === 'YES' ? 'YES' : 'NO'}</span></div>
  ${auth.denied_details ? '<div style="padding:4px 12px;font-size:10px;color:#64748b;font-style:italic;">' + auth.denied_details + '</div>' : ''}
  <div class="qa-row"><span>License suspended/revoked?</span><span style="font-weight:900">${auth.revoked_yes === 'YES' ? 'YES' : 'NO'}</span></div>
  ${auth.revoked_details ? '<div style="padding:4px 12px;font-size:10px;color:#64748b;font-style:italic;">' + auth.revoked_details + '</div>' : ''}
  <div style="margin-top:10px;"><b style="font-size:9px;color:#94a3b8;">EMERGENCY CONTACT</b></div>
  <div class="grid">
    <div class="field"><div class="dl">Name</div><div class="dv">${v(auth.emergency_name)}</div></div>
    <div class="field"><div class="dl">Phone</div><div class="dv">${v(auth.emergency_phone)}</div></div>
    <div class="field"><div class="dl">Relationship</div><div class="dv">${v(auth.emergency_relationship)}</div></div>
  </div>
</div>

<!-- SECTION 4: EMPLOYMENT HISTORY -->
<div class="section">
  <div class="section-title">Section 04 — Employment Record</div>
  <div class="grid">
    <div class="field"><div class="dl">Company</div><div class="dv">${v(emp.emp1_company)}</div></div>
    <div class="field"><div class="dl">Contact</div><div class="dv">${v(emp.emp1_contact)}</div></div>
    <div class="field"><div class="dl">Phone</div><div class="dv">${v(emp.emp1_phone)}</div></div>
  </div>
  <div class="grid">
    <div class="field"><div class="dl">City</div><div class="dv">${v(emp.emp1_city)}</div></div>
    <div class="field"><div class="dl">State</div><div class="dv">${v(emp.emp1_state)}</div></div>
    <div class="field"><div class="dl">ZIP</div><div class="dv">${v(emp.emp1_zip)}</div></div>
  </div>
  <div class="grid">
    <div class="field"><div class="dl">From</div><div class="dv">${v(emp.emp1_from)}</div></div>
    <div class="field"><div class="dl">To</div><div class="dv">${v(emp.emp1_to)}</div></div>
    <div class="field"><div class="dl">Position</div><div class="dv">${v(emp.emp1_position)}</div></div>
    <div class="field"><div class="dl">Trailer</div><div class="dv">${v(emp.emp1_trailer)}</div></div>
  </div>
  <div style="margin:6px 0;"><div class="dl">Reason for Leaving</div><div class="dv">${v(emp.emp1_reason)}</div></div>
  <div class="grid">${badge(emp.emp1_fmcsr, 'SUBJECT TO FMCSRs')} &nbsp; ${badge(emp.emp1_safety_sensitive, 'SAFETY-SENSITIVE')}</div>
</div>

<!-- SECTION 5: SAFETY PERFORMANCE -->
<div class="section">
  <div class="section-title">Section 05 — DOT Safety Performance History</div>
  <div class="grid">
    <div class="field"><div class="dl">Applicant</div><div class="dv">${v(safety.safety_applicant)}</div></div>
    <div class="field"><div class="dl">SSN</div><div class="dv">${safety.safety_ssn ? '•••-••-••••' : '—'}</div></div>
    <div class="field"><div class="dl">Employer</div><div class="dv">${v(safety.safety_employer)}</div></div>
  </div>
  <div class="qa-row"><span>1. Alcohol test ≥ 0.04?</span><span style="font-weight:900">${safety.q1_yes === 'YES' ? 'YES' : (safety.q1_no === 'NO' ? 'NO' : '—')}</span></div>
  <div class="qa-row"><span>2. Positive controlled substance?</span><span style="font-weight:900">${safety.q2_yes === 'YES' ? 'YES' : (safety.q2_no === 'NO' ? 'NO' : '—')}</span></div>
  <div class="qa-row"><span>3. Refused DOT test?</span><span style="font-weight:900">${safety.q3_yes === 'YES' ? 'YES' : (safety.q3_no === 'NO' ? 'NO' : '—')}</span></div>
  <div class="qa-row"><span>4. Other DOT violations?</span><span style="font-weight:900">${safety.q4_yes === 'YES' ? 'YES' : (safety.q4_no === 'NO' ? 'NO' : '—')}</span></div>
  <div class="grid" style="margin-top:10px;">
    <div class="field"><div class="dl">SAP Name</div><div class="dv">${v(safety.sap_name)}</div></div>
    <div class="field"><div class="dl">SAP Phone</div><div class="dv">${v(safety.sap_phone)}</div></div>
  </div>
  <div class="grid">
    <div class="field"><div class="dl">Completed By</div><div class="dv">${v(safety.affirmation_name)}</div></div>
    <div class="field"><div class="dl">Title</div><div class="dv">${v(safety.affirmation_title)}</div></div>
    <div class="field"><div class="dl">Company</div><div class="dv">${v(safety.affirmation_company)}</div></div>
    <div class="field"><div class="dl">Date</div><div class="dv">${v(safety.affirmation_date)}</div></div>
  </div>
</div>

<!-- SECTION 6: FCRA -->
<div class="section">
  <div class="section-title">Section 06 — FCRA Disclosure</div>
  <div class="grid">${badge(fcra.fcra_accepted, 'FCRA ACCEPTED')}</div>
  <div class="grid">
    <div class="field"><div class="dl">Full Name</div><div class="dv">${v(fcra.fcra_name)}</div></div>
    <div class="field"><div class="dl">SSN</div><div class="dv">${fcra.fcra_ssn ? '•••-••-••••' : '—'}</div></div>
    <div class="field"><div class="dl">Date</div><div class="dv">${v(fcra.fcra_date)}</div></div>
  </div>
</div>

<!-- SECTION 7: CERTIFICATION -->
<div class="section">
  <div class="section-title">Section 07 — Final Certification</div>
  <div class="grid">${badge(cert.cert_honesty, 'CERTIFIED WITH HONESTY')}</div>
  <div style="margin-top:16px; border-bottom:2px solid #002F6C; padding-bottom:4px;">
    <div class="dl">Applicant Signature</div>
    <div style="font-style:italic; font-size:18px; color:#002F6C;">${v(fcra.fcra_name || w9.legal_name || df.driver_name)}</div>
  </div>
  <div class="grid" style="margin-top:8px;">
    <div class="field"><div class="dl">Date Submitted</div><div class="dv">${new Date().toLocaleDateString()}</div></div>
    <div class="field"><div class="dl">Timestamp</div><div class="dv">${new Date().toLocaleTimeString()}</div></div>
  </div>
</div>

<div class="seal">
  <p style="font-size:10px;font-weight:900;color:#002F6C;">CTS OFFICIAL RECORD</p>
  <p style="font-size:8px;color:#94a3b8;letter-spacing:2px;">END OF DOCUMENTED APPLICATION FILE</p>
</div>

</body></html>`;
}
