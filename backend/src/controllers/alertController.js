import { EmergencyAlert } from '../models/EmergencyAlert.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { Resend } from 'resend';

/* =========================
   SAFE RESEND INITIALIZER
   ========================= */
const getResendClient = () => {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    throw new Error("❌ RESEND_API_KEY is missing in .env file");
  }

  return new Resend(key);
};

/* =========================
   MAIN CONTROLLER
   ========================= */
export const triggerEmergency = async (req, res, next) => {
  try {
    const { triggeredByScore } = req.body;

    const user = await User.findById(req.user.id);
    const emergencyContact = user.emergencyContact || {};

    if (!emergencyContact.name) {
      return res.status(400).json({
        success: false,
        error: 'No emergency contact registered. Please configure it in Profile settings.'
      });
    }

    const score = triggeredByScore || 90;

    const emailSubject = `🚨 MindGuard EMERGENCY ALERT: ${user.fullName}`;

    const messageContent = `
Emergency Alert,

Employee: ${user.fullName}
Employee ID: ${user.employeeId || 'N/A'}
Stress Level: ${score}/100
Phone: ${user.phone || 'N/A'}
Department: ${user.department || 'N/A'}

Emergency Contact: ${emergencyContact.name}

Please reach out immediately.
`;

    let emailSent = false;
    let smsSent = false;
    let errorLog = [];

    /* =========================
       EMAIL (RESEND SAFE)
       ========================= */
    if (emergencyContact.email && process.env.RESEND_API_KEY) {
      try {
        const resend = getResendClient();

        const response = await resend.emails.send({
          from: "MindGuard <alerts@resend.dev>",
          to: emergencyContact.email,
          subject: emailSubject,
          text: messageContent,
        });

        emailSent = true;
        console.log("✅ EMAIL SENT:", response.id);

      } catch (err) {
        console.log("❌ EMAIL FAILED:", err.message);
        errorLog.push(`Email: ${err.message}`);
      }
    } else {
      console.log("⚠️ Email skipped (missing config or recipient)");
    }

    /* =========================
       SMS DISABLED
       ========================= */
    console.log("ℹ️ SMS skipped (not configured)");

    /* =========================
       LOG OUTPUT
       ========================= */
    console.log("\n🚨 MINDGUARD EMERGENCY ALERT 🚨");
    console.log(`EMPLOYEE: ${user.fullName}`);
    console.log(`CONTACT: ${emergencyContact.name}`);
    console.log(`SCORE: ${score}`);
    console.log(`EMAIL SENT: ${emailSent}`);
    console.log("ERRORS:", errorLog);
    console.log("====================================\n");

    /* =========================
       SAVE ALERT
       ========================= */
    const alert = await EmergencyAlert.create({
      user: user._id,
      contactName: emergencyContact.name,
      contactPhone: emergencyContact.phone || null,
      contactEmail: emergencyContact.email || null,
      triggeredByScore: score,
      status: emailSent ? 'sent' : 'failed',
      details: errorLog.length ? errorLog.join(" | ") : "Processed"
    });

    /* =========================
       ADMIN NOTIFICATIONS
       ========================= */
    const admins = await User.find({ role: { $in: ['Admin', 'Super Admin'] } });

    await Promise.all(
      admins.map(admin =>
        Notification.create({
          user: admin._id,
          title: `🚨 Emergency: ${user.fullName}`,
          message: `Critical stress alert triggered. Score: ${score}`,
          type: 'stress_alert'
        })
      )
    );

    /* =========================
       AUDIT LOG
       ========================= */
    await AuditLog.create({
      actor: user._id,
      actorEmail: user.email,
      action: 'EMERGENCY_TRIGGER',
      details: `Score ${score}, Contact ${emergencyContact.name}`
    });

    /* =========================
       RESPONSE
       ========================= */
    res.status(201).json({
      success: true,
      alert,
      emailSent,
      smsSent: false,
      simulated: !emailSent,
      message: "Emergency protocol executed"
    });

  } catch (error) {
    next(error);
  }
};

/* =========================
   HISTORY API
   ========================= */
export const getAlertHistory = async (req, res, next) => {
  try {
    const alerts = await EmergencyAlert.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts
    });

  } catch (error) {
    next(error);
  }
};