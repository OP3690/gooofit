const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const emailService = require('../services/emailService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/cv';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Apply for job
router.post('/apply', upload.single('cv'), async (req, res) => {
  try {
    console.log('📝 Processing job application...');
    console.log('📋 Request body:', req.body);
    console.log('📎 File:', req.file);

    const {
      firstName,
      lastName,
      email,
      country,
      countryCode,
      mobile,
      message,
      jobTitle
    } = req.body;

    const cvFile = req.file;

    if (!cvFile) {
      console.log('❌ No CV file uploaded');
      return res.status(400).json({ error: 'CV file is required' });
    }

    console.log('📧 Sending email to:', 'omprakashutaha@gmail.com');
    console.log('📧 From:', 'onboarding.gooofit@gmail.com');
    console.log('📧 Subject:', `New Job Application: ${jobTitle} - ${firstName} ${lastName}`);

    // Create beautiful email template
    const emailTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Job Application - ${jobTitle}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ff6b35;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #7f8c8d;
            font-size: 16px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ecf0f1;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          .info-item {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ff6b35;
          }
          .info-label {
            font-weight: bold;
            color: #2c3e50;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .info-value {
            color: #34495e;
            font-size: 16px;
          }
          .message-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
          }
          .message-label {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .message-content {
            color: #34495e;
            font-style: italic;
            line-height: 1.8;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #7f8c8d;
            font-size: 14px;
          }
          .cta-button {
            display: inline-block;
            background-color: #ff6b35;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin-top: 15px;
          }
          .attachment-info {
            background-color: #e8f5e8;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            border-left: 4px solid #27ae60;
          }
          @media (max-width: 600px) {
            .info-grid {
              grid-template-columns: 1fr;
            }
            body {
              padding: 10px;
            }
            .container {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏃‍♂️ GoooFit</div>
            <div class="title">New Job Application</div>
            <div class="subtitle">${jobTitle}</div>
          </div>

          <div class="section">
            <div class="section-title">👤 Applicant Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${firstName} ${lastName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email Address</div>
                <div class="info-value">${email}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Country</div>
                <div class="info-value">${country}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone Number</div>
                <div class="info-value">${countryCode} ${mobile}</div>
              </div>
            </div>
          </div>

          ${message ? `
          <div class="section">
            <div class="section-title">💬 Message from Applicant</div>
            <div class="message-section">
              <div class="message-content">${message}</div>
            </div>
          </div>
          ` : ''}

          <div class="attachment-info">
            <div class="info-label">📎 CV Attachment</div>
            <div class="info-value">${cvFile.originalname} (${(cvFile.size / 1024 / 1024).toFixed(2)} MB)</div>
          </div>

          <div class="footer">
            <p>This application was submitted through the GoooFit careers portal.</p>
            <p>Please review the attached CV and contact the applicant if interested.</p>
            <a href="mailto:${email}" class="cta-button">Reply to Applicant</a>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await emailService.sendEmail({
      to: 'omprakashutaha@gmail.com',
      subject: `New Job Application: ${jobTitle} - ${firstName} ${lastName}`,
      html: emailTemplate,
      attachments: [
        {
          filename: cvFile.originalname,
          path: cvFile.path
        }
      ]
    });

    // Clean up uploaded file after sending email
    fs.unlink(cvFile.path, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    res.status(200).json({ 
      message: 'Application submitted successfully',
      applicationId: Date.now().toString()
    });

  } catch (error) {
    console.error('❌ Error processing job application:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
      stack: error.stack
    });
    
    // Clean up uploaded file if email fails
    if (req.file) {
      console.log('🧹 Cleaning up uploaded file:', req.file.path);
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('❌ Error deleting uploaded file:', err);
        else console.log('✅ Uploaded file cleaned up successfully');
      });
    }

    res.status(500).json({ 
      error: 'Failed to submit application. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all job listings (for potential future API)
router.get('/jobs', (req, res) => {
  const jobListings = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'Remote / Bangalore',
      type: 'Full-time',
      experience: '3-5 years'
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Hybrid / Mumbai',
      type: 'Full-time',
      experience: '2-4 years'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      experience: '2-3 years'
    },
    {
      id: 4,
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Hybrid / Delhi',
      type: 'Full-time',
      experience: '1-3 years'
    },
    {
      id: 5,
      title: 'Data Analyst',
      department: 'Analytics',
      location: 'Remote',
      type: 'Full-time',
      experience: '1-2 years'
    }
  ];

  res.json({ jobs: jobListings });
});

module.exports = router; 