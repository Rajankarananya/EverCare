const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend/public directory
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));
app.use('/videos', express.static(path.join(__dirname, '../frontend/public/videos')));
app.use('/pdf', express.static(path.join(__dirname, '../frontend/public/pdf')));

// Create database pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert pool to use promises
const promisePool = pool.promise();

// Test database connection
async function testConnection() {
    try {
        const connection = await promisePool.getConnection();
        console.log('Successfully connected to MySQL database');
        connection.release();
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1);
    }
}

// Test the connection when server starts
testConnection();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes
// Register endpoint
app.post('/api/register', async (req, res) => {
  console.log('Registration request received:', req.body); // Log the request body
  
  const { first_name, last_name, email, password, role } = req.body;
  
  if (!first_name || !last_name || !email || !password || !role) {
    console.log('Missing required fields:', { first_name, last_name, email, password: '***', role });
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Check if user already exists
    const [existingUsers] = await promisePool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      console.log('Email already exists:', email);
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    const query = 'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)';
    console.log('Executing query with values:', { first_name, last_name, email, role });
    
    const [result] = await promisePool.execute(query, [first_name, last_name, email, hashedPassword, role]);
    console.log('User registered successfully:', result);
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Detailed registration error:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      stack: error.stack
    });
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: 'Error registering user', details: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [users] = await promisePool.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Handle all other routes by serving the appropriate HTML file
app.get('/:page', (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, '../frontend/public', page);
  
  // Check if the file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).sendFile(path.join(__dirname, '../frontend/public/index.html'));
  }
});

// Personal Plans API Endpoints
app.post('/api/personal-plan', authenticateToken, async (req, res) => {
    try {
        const { full_name, age, gender, blood_type, address, profile_photo_url, primary_doctor, doctor_phone, hospital_name, hospital_phone, poison_control } = req.body;
        const user_id = req.user.id;
        
        const query = `INSERT INTO personal_plans (user_id, full_name, age, gender, blood_type, address, profile_photo_url, 
            primary_doctor, doctor_phone, hospital_name, hospital_phone, poison_control) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await promisePool.execute(query, [user_id, full_name, age, gender, blood_type, address, profile_photo_url,
            primary_doctor, doctor_phone, hospital_name, hospital_phone, poison_control]);
        
        res.json({ message: 'Personal plan created successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating personal plan' });
    }
});

app.get('/api/personal-plan', authenticateToken, async (req, res) => {
    try {
        const [rows] = await promisePool.execute('SELECT * FROM personal_plans WHERE user_id = ?', [req.user.id]);
        res.json(rows[0] || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching personal plan' });
    }
});

// Guardians API Endpoints
app.post('/api/guardians', authenticateToken, async (req, res) => {
    try {
        const { name, relation, phone, email, address } = req.body;
        const user_id = req.user.id;
        
        const query = 'INSERT INTO guardians (user_id, name, relation, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await promisePool.execute(query, [user_id, name, relation, phone, email, address]);
        
        res.json({ message: 'Guardian added successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding guardian' });
    }
});

app.get('/api/guardians', authenticateToken, async (req, res) => {
    try {
        const [rows] = await promisePool.execute('SELECT * FROM guardians WHERE user_id = ?', [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching guardians' });
    }
});

// Daily Care Plans API Endpoints
app.post('/api/daily-care', authenticateToken, async (req, res) => {
    try {
        const { task_name, task_time, task_period } = req.body;
        const user_id = req.user.id;
        
        const query = 'INSERT INTO daily_care_plans (user_id, task_name, task_time, task_period) VALUES (?, ?, ?, ?)';
        const [result] = await promisePool.execute(query, [user_id, task_name, task_time, task_period]);
        
        res.json({ message: 'Task added successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding task' });
    }
});

app.get('/api/daily-care', authenticateToken, async (req, res) => {
    try {
        const [rows] = await promisePool.execute('SELECT * FROM daily_care_plans WHERE user_id = ? ORDER BY task_time', [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});

// Voice Recording API Endpoints
app.post('/api/recordings', authenticateToken, async (req, res) => {
    console.log('Received recording request:', req.body);
    try {
        const { recording_url, title, duration } = req.body;
        const user_id = req.user.id;

        if (!recording_url) {
            return res.status(400).json({ error: 'Recording URL is required' });
        }

        const query = 'INSERT INTO voice_recordings (user_id, recording_url, title, duration) VALUES (?, ?, ?, ?)';
        const [result] = await promisePool.execute(query, [user_id, recording_url, title || null, duration || null]);

        res.status(201).json({ 
            message: 'Recording saved successfully',
            recordingId: result.insertId
        });
    } catch (error) {
        console.error('Error saving recording:', error);
        res.status(500).json({ error: 'Error saving recording' });
    }
});

app.get('/api/recordings', authenticateToken, async (req, res) => {
    try {
        const [recordings] = await promisePool.execute(
            'SELECT * FROM voice_recordings WHERE user_id = ? ORDER BY recorded_at DESC',
            [req.user.id]
        );
        res.json(recordings);
    } catch (error) {
        console.error('Error fetching recordings:', error);
        res.status(500).json({ error: 'Error fetching recordings' });
    }
});

app.delete('/api/recordings/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await promisePool.execute(
            'DELETE FROM voice_recordings WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recording not found or unauthorized' });
        }
        
        res.json({ message: 'Recording deleted successfully' });
    } catch (error) {
        console.error('Error deleting recording:', error);
        res.status(500).json({ error: 'Error deleting recording' });
    }
});

// Documents API Endpoints
app.post('/api/documents', authenticateToken, async (req, res) => {
    try {
        const { document_name, document_type, document_url } = req.body;
        const user_id = req.user.id;
        
        const query = 'INSERT INTO documents (user_id, document_name, document_type, document_url) VALUES (?, ?, ?, ?)';
        const [result] = await promisePool.execute(query, [user_id, document_name, document_type, document_url]);
        
        res.json({ message: 'Document saved successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error saving document' });
    }
});

app.get('/api/documents', authenticateToken, async (req, res) => {
    try {
        const [rows] = await promisePool.execute('SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC', [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

// Feedback API Endpoint
app.post('/api/feedback', authenticateToken, async (req, res) => {
    console.log('Feedback submission received:', req.body);
    
    try {
        const { tool_used, feedback_text } = req.body;
        const user_id = req.user.id;

        // Validate required fields
        if (!tool_used || !feedback_text) {
            console.log('Missing required fields:', { tool_used, feedback_text });
            return res.status(400).json({ error: 'Tool and feedback text are required' });
        }

        // Insert feedback into database
        const query = 'INSERT INTO feedback (user_id, tool_used, feedback_text) VALUES (?, ?, ?)';
        console.log('Executing query:', query);
        console.log('Query parameters:', { user_id, tool_used, feedback_text });

        const [result] = await promisePool.execute(query, [user_id, tool_used, feedback_text]);
        console.log('Feedback inserted successfully:', result);

        res.status(201).json({ 
            message: 'Feedback submitted successfully',
            feedbackId: result.insertId
        });
    } catch (error) {
        console.error('Error submitting feedback:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error submitting feedback', details: error.message });
    }
});

// Message Routes
app.post('/api/messages', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        console.log('Received message data:', { name, email, phone, subject, message });
        
        // Validate required fields
        if (!name || !email || !message) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'Name, email, and message are required fields' });
        }

        // Insert message into database
        const query = 'INSERT INTO messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)';
        console.log('Executing query:', query);
        const [result] = await promisePool.execute(query, [name, email, phone || null, subject || null, message]);
        console.log('Message inserted successfully:', result);

        res.status(201).json({
            message: 'Message sent successfully',
            messageId: result.insertId
        });
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});

// Get all messages (protected route - only for authorized users)
app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const query = 'SELECT * FROM messages ORDER BY created_at DESC';
        const [messages] = await promisePool.execute(query);
        
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get a specific message by ID (protected route)
app.get('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM messages WHERE id = ?';
        const [messages] = await promisePool.execute(query, [id]);
        
        if (messages.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json(messages[0]);
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ error: 'Failed to fetch message' });
    }
});

// Delete a message (protected route)
app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM messages WHERE id = ?';
        const [result] = await promisePool.execute(query, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 