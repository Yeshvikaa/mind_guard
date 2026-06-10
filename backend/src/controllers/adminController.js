import { User } from '../models/User.js';
import { Chat } from '../models/Chat.js';
import { StressScore } from '../models/StressScore.js';
import { EmergencyAlert } from '../models/EmergencyAlert.js';
import { AuditLog } from '../models/AuditLog.js';
import PDFDocument from 'pdfkit';

// @desc    Get admin statistics and dashboard overview
// @route   GET /api/admin/overview
// @access  Private (Admin/Super Admin)
export const getAdminOverview = async (req, res, next) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'Employee' });
    const activeChatsCount = await Chat.countDocuments();
    const activeAlertsCount = await EmergencyAlert.countDocuments();

    // Group users by department
    const departmentDistribution = await User.aggregate([
      { $match: { role: 'Employee' } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    // Group stress scores by category (Low, Medium, High, Critical)
    const latestScores = await StressScore.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$user',
          score: { $first: '$score' },
          category: { $first: '$category' }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stress distribution
    const stressDistribution = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    };
    latestScores.forEach(item => {
      if (item._id && stressDistribution[item._id] !== undefined) {
        stressDistribution[item._id] = item.count;
      }
    });

    // Recent emergency alerts
    const recentAlerts = await EmergencyAlert.find()
      .populate('user', 'fullName email department phone profilePhoto')
      .sort({ createdAt: -1 })
      .limit(5);

    // AI organization insights simulation
    const insights = [
      "Department alignment: Tech Support department shows 12% higher stress indicators this week. Recommend team breathing breaks.",
      "Time trend: Peak tension is noted between 2 PM and 4 PM on Tuesdays. Encouraging Pomodoro interval focus blocks.",
      "Engagement: Wellness score index has risen by 5% overall since the launch of meditation playlists."
    ];

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeChatsCount,
        activeAlertsCount,
        departmentDistribution,
        stressDistribution,
        recentAlerts,
        insights
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of employees (with search, pagination, filters)
// @route   GET /api/admin/employees
// @access  Private (Admin/Super Admin)
export const getEmployees = async (req, res, next) => {
  try {
    const { search, department, company, page = 1, limit = 10 } = req.query;

    const query = { role: 'Employee' };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query.department = department;
    }

    if (company) {
      query.company = company;
    }

    const skipIndex = (page - 1) * limit;

    const employees = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skipIndex);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: employees.length,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
      employees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new employee
// @route   POST /api/admin/employees
// @access  Private (Admin/Super Admin)
export const addEmployee = async (req, res, next) => {
  try {
    const { fullName, email, password, department, company, employeeId, age, gender, phone } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    const employee = await User.create({
      fullName,
      email,
      password,
      department,
      company,
      employeeId,
      age: age ? Number(age) : undefined,
      gender,
      phone,
      profilePhoto: '/uploads/default-avatar.png',
      streak: 0
    });

    await AuditLog.create({
      actor: req.user.id,
      actorEmail: req.user.email,
      action: 'ADMIN_CREATE_USER',
      details: `Admin created user: ${employee.fullName} (${employee.email})`
    });

    res.status(201).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit an employee's details
// @route   PUT /api/admin/employees/:id
// @access  Private (Admin/Super Admin)
export const editEmployee = async (req, res, next) => {
  try {
    const { fullName, email, department, company, employeeId, age, gender, phone, role } = req.body;

    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    if (fullName) employee.fullName = fullName;
    if (email) employee.email = email;
    if (department) employee.department = department;
    if (company) employee.company = company;
    if (employeeId) employee.employeeId = employeeId;
    if (age) employee.age = Number(age);
    if (gender) employee.gender = gender;
    if (phone) employee.phone = phone;
    if (role) employee.role = role;

    await employee.save();

    await AuditLog.create({
      actor: req.user.id,
      actorEmail: req.user.email,
      action: 'ADMIN_UPDATE_USER',
      details: `Admin updated employee details: ${employee.fullName}`
    });

    res.status(200).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an employee
// @route   DELETE /api/admin/employees/:id
// @access  Private (Admin/Super Admin)
export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    await User.deleteOne({ _id: employee._id });

    await AuditLog.create({
      actor: req.user.id,
      actorEmail: req.user.email,
      action: 'ADMIN_DELETE_USER',
      details: `Admin deleted user: ${employee.fullName} (${employee.email})`
    });

    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get completed chats transcript logs
// @route   GET /api/admin/transcripts
// @access  Private (Admin/Super Admin)
export const getChatTranscripts = async (req, res, next) => {
  try {
    const transcripts = await Chat.find()
      .populate('user', 'fullName email department profilePhoto')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: transcripts.length, transcripts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific transcript detail by ID
// @route   GET /api/admin/transcripts/:id
// @access  Private (Admin/Super Admin)
export const getChatTranscriptById = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('user', 'fullName email department age gender profilePhoto');

    if (!chat) {
      return res.status(404).json({ success: false, error: 'Transcript record not found' });
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Report PDF/CSV
// @route   GET /api/admin/reports/download
// @access  Private (Admin/Super Admin)
export const downloadReport = async (req, res, next) => {
  try {
    const { format } = req.query; // 'pdf' or 'csv'

    const employees = await User.find({ role: 'Employee' });

    // Retrieve recent scores
    const scores = await StressScore.find()
      .populate('user', 'fullName department')
      .sort({ createdAt: -1 })
      .limit(20);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=mindguard_wellness_report.csv');

      let csvContent = 'Full Name,Email,Employee ID,Department,Company,Streak,Registered Date\n';
      employees.forEach(emp => {
        csvContent += `"${emp.fullName}","${emp.email}","${emp.employeeId || ''}","${emp.department || ''}","${emp.company || ''}",${emp.streak || 0},"${emp.createdAt.toISOString()}"\n`;
      });

      return res.status(200).send(csvContent);
    } 

    // Generate PDF report
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=mindguard_wellness_report.pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(22).fillColor('#4F46E5').text('MindGuard Platform Report', { align: 'center' });
    doc.fontSize(12).fillColor('#4B5563').text('Corporate Mental Wellness Auditing Systems', { align: 'center' });
    doc.moveDown();
    doc.lineWidth(1).strokeColor('#E5E7EB').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(2);

    // Section 1: Org Statistics
    doc.fontSize(16).fillColor('#1F2937').text('Organization Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(11).fillColor('#374151').text(`Total Monitored Employees: ${employees.length}`);
    doc.text(`Active Alert Triggers (All-Time): ${await EmergencyAlert.countDocuments()}`);
    doc.text(`Total Counseling Chats Opened: ${await Chat.countDocuments()}`);
    doc.moveDown(2);

    // Section 2: Recent Stress Scorings Table
    doc.fontSize(16).fillColor('#1F2937').text('Recent Stress Score Samples', { underline: true });
    doc.moveDown();
    
    // Draw table header
    const initialY = doc.y;
    doc.fontSize(10).fillColor('#1F2937').text('Employee', 50, initialY);
    doc.text('Department', 200, initialY);
    doc.text('Score', 350, initialY);
    doc.text('Intensity', 420, initialY);
    doc.text('Date', 490, initialY);
    doc.moveDown();
    doc.lineWidth(1).strokeColor('#F3F4F6').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    scores.forEach(score => {
      const name = score.user ? score.user.fullName : 'Deleted User';
      const dept = score.user ? score.user.department : 'N/A';
      
      // Draw rows
      const currentY = doc.y;
      doc.fontSize(9).fillColor('#4B5563').text(name, 50, currentY);
      doc.text(dept, 200, currentY);
      doc.text(score.score.toString(), 350, currentY);
      doc.text(score.category, 420, currentY);
      doc.text(new Date(score.createdAt).toLocaleDateString(), 490, currentY);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};
