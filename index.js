const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const { initializeDatabase } = require('./database');
require('dotenv').config();

const app = express();
app.use(express.static('public'));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-123';
const upload = multer({ dest: 'uploads/' });

// We will hold our db instance here
let db;

// Auth Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
}

const SYSTEM_PROMPT = `You are a career assistant inside JobSkillMatcher, a platform for students and early-career developers in India and globally.

You help users with:
- Interview questions and processes at specific companies (Google, Amazon, Microsoft, Infosys, TCS, Wipro, Flipkart, Swiggy, Zomato, Razorpay, etc.)
- Skill roadmaps to reach a specific job role or get into a specific company
- What skills and technologies a particular company looks for
- How to transition from one role or skill set to another
- DSA, system design, and HR interview preparation
- Resume and portfolio advice for tech jobs

Your tone is direct, practical, and encouraging — like a senior developer friend giving honest career advice.

When answering:
- Be specific. Give real examples, real topics, real timelines.
- Use bullet points and **bold text** for key points to make answers easy to scan.
- If asked about a company's interview process, cover: number of rounds, topics covered, difficulty level, and practical tips.
- If asked for a roadmap, give a clear step-by-step plan with estimated time per step.
- Keep answers focused and useful — not too long, not too vague.
- If you are unsure about something specific, give the best general guidance and be honest about it.

Only answer questions related to careers, jobs, skills, interviews, and professional growth. For anything unrelated, politely say you can only help with career topics.`;

// AI Career Chat route
app.post('/chat', authenticateToken, async (req, res) => {
    const { messages, interviewMode, targetRole, targetLang } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ reply: "No messages provided." });
    }

    const INTERVIEW_PROMPT = `You are a strict, professional hiring manager for a top-tier tech company. 
The user is a candidate interviewing for the ${targetRole || "Software Engineer"} position.
Your task is to conduct a highly realistic, interactive Mock Technical Interview.
RULES:
1. If this is the start, welcome them and ask ONE hard technical or architectural interview question right now.
2. If they are answering an existing question: GRADE their response critically. Point out what they missed, efficiency flaws (O(n) etc), and how to improve it. 
3. After grading, ask the NEXT question.
4. NEVER ask more than ONE question at a time. Do not write their code for them initially.`;

    let activeSystemPrompt = interviewMode ? INTERVIEW_PROMPT : SYSTEM_PROMPT;

    if (targetLang && targetLang !== 'en-US') {
        activeSystemPrompt += `\n\nCRITICAL SYSTEM INSTRUCTION: You MUST format your response and speak entirely in the language corresponding to locale '${targetLang}'. Do NOT speak in English unless that is the locale.`;
    }

    try {
        const geminiMessages = messages.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: activeSystemPrompt }] },
                contents: geminiMessages
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API error:", data.error);
            return res.status(500).json({ reply: "API error: " + data.error.message });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not generate a response. Please try again.";
        res.json({ reply });

    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ reply: "Server error. Please check your API key in .env and try again." });
    }
});

// --- PHASE 4 COMPILER ROUTES ---

app.post('/api/generate-challenge', authenticateToken, async (req, res) => {
    const { skill } = req.body;
    try {
        const prompt = `Generate a single, short, practical coding or conceptual challenge for the skill: "${skill}". Keep it under 3 sentences. Do not provide the answer, just the question/challenge prompt.`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        const challengeText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Write a small snippet demonstrating your knowledge of " + skill + ".";
        res.json({ challenge: challengeText.trim() });
    } catch (e) { res.status(500).json({ error: "Failed to generate challenge" }); }
});

app.post('/api/grade-challenge', authenticateToken, async (req, res) => {
    const { skill, challenge, code } = req.body;
    try {
        const prompt = `You are a strict code compiler and grading engine. A user was given this challenge for the skill "${skill}":
Challenge: "${challenge}"
User's submitted code/answer:
"${code}"

Analyze their submission. If it fundamentally solves the challenge and looks reasonably correct, mark it as passed.
Return ONLY a pure JSON object using this exact schema, with no markdown formatting or backticks:
{
  "passed": true|false,
  "feedback": "A short 1-2 sentence feedback explaining why they passed or exactly what error they made."
}`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: "You only output raw JSON. Do not include markdown like ```json." }] },
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();
        let rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        console.log("Gemini Grade Output:", rawJson);
        
        if (!rawJson) return res.status(500).json({ error: "Grading failed." });
        rawJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            const parsedData = JSON.parse(rawJson);
            
            // Give 100 XP if passed!
            if (parsedData.passed) {
                await db.run('UPDATE users SET xp = xp + 100 WHERE id = ?', [req.user.id]);
                parsedData.xp_awarded = 100;
            }

            res.json(parsedData);
        } catch(parseErr) {
            console.error("JSON Parse Error:", parseErr, rawJson);
            res.status(500).json({ error: "Failed to parse grade output" });
        }
    } catch (e) {
        console.error("Grade Challenge Error:", e);
        res.status(500).json({ error: "Failed to grade code" });
    }
});

app.post('/api/generate-resume', authenticateToken, async (req, res) => {
    const { skills, target_role, name, email } = req.body;
    try {
        const prompt = `You are an elite Silicon Valley Tech Recruiter. The user is applying for the role of "${target_role}".
They possess the following skills: ${skills.join(', ')}.
Their name is ${name} and email is ${email}.

Generate a structured JSON object containing a highly professional, ATS-optimized resume based strictly on their skills. Use actionable verbs and impressive phrasing.
Return ONLY a pure JSON object using this exact schema, with no markdown formatting or backticks:
{
  "summary": "A powerful 2-3 sentence professional summary incorporating their core skills.",
  "experience": [
    { "title": "Software Engineer", "company": "Tech Corp", "duration": "2023 - Present", "bullets": ["Quantifiable, technical bullet point using their skills", "Another bullet"] }
  ],
  "projects": [
    { "title": "Core application", "tech_stack": "Node, React...", "bullets": ["Architectural description", "Performance metric mentioned"] }
  ]
}`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: "You only output raw JSON. Do not include markdown like ```json." }] },
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();
        let rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!rawJson) return res.status(500).json({ error: "Resume generation failed." });
        rawJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            res.json(JSON.parse(rawJson));
        } catch(parseErr) {
            console.error("JSON parse error:", rawJson);
            res.status(500).json({ error: "Failed to parse resume output" });
        }
    } catch (e) {
        console.error("Generate Resume Error:", e);
        res.status(500).json({ error: "Failed to generate resume." });
    }
});

// Start backend (Init DB then listen)
initializeDatabase().then((database) => {
    db = database; // assign global db connection

    // --- LEADERBOARD ENDPOINT ---
    app.get('/api/leaderboard', async (req, res) => {
        try {
            const topUsers = await db.all('SELECT username, xp FROM users ORDER BY xp DESC LIMIT 10');
            res.json({ leaderboard: topUsers });
        } catch(err) {
            console.error("Leaderboard error:", err);
            res.status(500).json({ error: "Failed to load leaderboard" });
        }
    });

    // --- NEW ENDPOINTS FOR PHASE 1 ---
    
    // Register
    app.post('/api/register', async (req, res) => {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: "All fields are required" });

        try {
            const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
            if (existingUser) return res.status(400).json({ error: "Email already registered" });

            const hashedPassword = await bcrypt.hash(password, 10);
            await db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email.toLowerCase(), hashedPassword]);

            res.status(200).json({ success: true, message: "User registered successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
    });

    // Login
    app.post('/api/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "All fields are required" });

        try {
            const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
            if (!user) return res.status(400).json({ error: "Invalid email or password" });

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return res.status(400).json({ error: "Invalid email or password" });

            // Using simple Token (can be enhanced with JWT)
            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

            res.status(200).json({
                success: true,
                token,
                user: { id: user.id, username: user.username, email: user.email }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
    });

    // --- PHASE 2 RESUME PARSING ---
    
    // POST /api/generate-roadmap
    app.post('/api/generate-roadmap', authenticateToken, async (req, res) => {
        const { targetRole, skills } = req.body;
        if (!skills) return res.status(400).json({ error: "No skills provided." });
        const finalRole = targetRole || "Software Engineer";

        try {
            const prompt = `You are a strict JSON parser. I am providing a list of skills a student currently has, and the target role they want.
Target Role: ${finalRole}
Current Skills:
${skills}

Analyze their current skills against the target role. Return ONLY a pure JSON object using this exact schema, with no markdown formatting, no backticks, and no extra text:
{
  "skills_acquired": ["skill1", "skill2"],
  "skills_missing": ["missingskill1", "missingskill2"]
}
`;
            
            // Fetch from Gemini
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: "You only output raw JSON. Do not include markdown like ```json." }] },
                    contents: [{ role: "user", parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            let rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawJson) return res.status(500).json({ error: "Failed to generate roadmap from AI." });
            
            // Clean markdown backticks if any
            rawJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
            const roadmapData = JSON.parse(rawJson);

            // Format for DB
            const acquired = JSON.stringify(roadmapData.skills_acquired || []);
            const missing = JSON.stringify((roadmapData.skills_missing || []).map(s => ({ skill: s, completed: false })));

            // Upsert into roadmaps table
            const existing = await db.get('SELECT id FROM roadmaps WHERE user_id = ?', [req.user.id]);
            if (existing) {
                await db.run('UPDATE roadmaps SET target_role=?, skills_acquired=?, skills_missing=? WHERE id=?', [finalRole, acquired, missing, existing.id]);
            } else {
                await db.run('INSERT INTO roadmaps (user_id, target_role, skills_acquired, skills_missing) VALUES (?, ?, ?, ?)', [req.user.id, finalRole, acquired, missing]);
            }

            // Return gamified shape directly
            res.json({ success: true, roadmap: {
                target_role: finalRole,
                skills_acquired: roadmapData.skills_acquired || [],
                skills_missing: JSON.parse(missing)
            }});

        } catch (err) {
            console.error("Roadmap generation error:", err);
            res.status(500).json({ error: "Failed to process skills." });
        }
    });

    // GET /api/roadmap
    app.get('/api/roadmap', authenticateToken, async (req, res) => {
        try {
            const row = await db.get('SELECT * FROM roadmaps WHERE user_id = ?', [req.user.id]);
            if (!row) return res.json({ roadmap: null });
            res.json({ roadmap: {
                target_role: row.target_role,
                skills_acquired: JSON.parse(row.skills_acquired),
                skills_missing: JSON.parse(row.skills_missing)
            }});
        } catch (err) {
            res.status(500).json({ error: "Error fetching roadmap" });
        }
    });

    // POST /api/roadmap/update
    app.post('/api/roadmap/update', authenticateToken, async (req, res) => {
        const { skills_missing } = req.body;
        if (!skills_missing) return res.status(400).json({ error: "Invalid data" });
        try {
            await db.run('UPDATE roadmaps SET skills_missing = ? WHERE user_id = ?', [JSON.stringify(skills_missing), req.user.id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: "Failed to update progress" });
        }
    });

    // --- NEW: PHASE 1 TRACKER INTEGRATIONS ---
    
    // GET /api/tracker
    app.get('/api/tracker', authenticateToken, async (req, res) => {
        try {
            const jobs = await db.all('SELECT * FROM job_applications WHERE user_id = ?', [req.user.id]);
            res.json({ jobs });
        } catch (err) {
             res.status(500).json({ error: "Failed to fetch tracker jobs" });
        }
    });

    // POST /api/tracker/add
    app.post('/api/tracker/add', authenticateToken, async (req, res) => {
        const { company, role, type } = req.body;
        try {
            const result = await db.run(
                'INSERT INTO job_applications (user_id, company, role, type) VALUES (?, ?, ?, ?)',
                [req.user.id, company, role, type]
            );
            res.json({ success: true, id: result.lastID });
        } catch (err) {
            res.status(500).json({ error: "Failed to add job" });
        }
    });

    // POST /api/tracker/update
    app.post('/api/tracker/update', authenticateToken, async (req, res) => {
        const { id, pipeline_stage } = req.body;
        try {
            await db.run(
                'UPDATE job_applications SET pipeline_stage = ? WHERE id = ? AND user_id = ?',
                [pipeline_stage, id, req.user.id]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: "Failed to update job stage" });
        }
    });

    // DELETE /api/tracker/delete
    app.delete('/api/tracker/delete/:id', authenticateToken, async (req, res) => {
        try {
            await db.run('DELETE FROM job_applications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: "Failed to delete job" });
        }
    });

    // --- NEW: PHASE 2 MENTOR MATCHING ---

    // GET /api/mentors
    app.get('/api/mentors', authenticateToken, async (req, res) => {
        try {
            const mentors = await db.all('SELECT * FROM mentors');
            res.json({ mentors });
        } catch (err) {
            res.status(500).json({ error: "Failed to fetch mentors" });
        }
    });

    // POST /api/mentors/register
    app.post('/api/mentors/register', async (req, res) => {
        const { name, email, role, company, tags, scheduling_link } = req.body;
        
        try {
            // Auto-generate avatar initials
            const parts = name.split(' ');
            const avatar = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
            
            // Auto-generate random brand color
            const colors = ["bg-cyan", "bg-yellow", "bg-pink", "bg-green"];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const result = await db.run(
                'INSERT INTO mentors (name, email, role, company, tags, scheduling_link, color, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [name, email, role, company, tags, scheduling_link, color, avatar]
            );
            res.json({ success: true, id: result.lastID });
        } catch (err) {
            res.status(500).json({ error: "Failed to register mentor" });
        }
    });

    // POST /api/mentors/book
    app.post('/api/mentors/book', authenticateToken, async (req, res) => {
        const { mentor_id, time_slot } = req.body;
        try {
            await db.run(
                'INSERT INTO mentor_bookings (user_id, mentor_id, time_slot) VALUES (?, ?, ?)',
                [req.user.id, mentor_id, time_slot]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: "Failed to book mentor" });
        }
    });

    // --- PHASE 3 LIVE INTEGRATIONS ---
    
    // GET /api/jobs - Connects to real public Jobs API (Remotive)
    app.get('/api/jobs', authenticateToken, async (req, res) => {
        try {
            // Use native HTTPS to avoid dependency issues across Node versions
            const https = require('https');
            const data = await new Promise((resolve, reject) => {
                https.get('https://remotive.com/api/remote-jobs?category=software-dev&limit=20', (r) => {
                    let body = '';
                    r.on('data', chunk => body += chunk);
                    r.on('end', () => {
                        try { resolve(JSON.parse(body)); } 
                        catch(e) { reject(e); }
                    });
                }).on('error', reject);
            });
            
            if (!data.jobs || data.jobs.length === 0) {
                 return res.json({ jobs: [] });
            }

            // Map real API data to our platform's UI schema
            const liveJobs = data.jobs.slice(0, 15).map((j, i) => ({
                id: j.id || i,
                company: j.company_name,
                role: j.title || "Software Engineer",
                location: j.candidate_required_location || "Remote",
                salary: j.salary || "Competitive",
                matchScore: Math.floor(Math.random() * (99 - 75 + 1) + 75) + "%", // AI Match simulated
                keySkills: j.tags ? j.tags.slice(0, 3).join(", ") : "Software",
                url: j.url
            }));

            res.json({ jobs: liveJobs });
        } catch (error) {
            console.error("Live Job API Error:", error);
            res.status(500).json({ error: "Failed to fetch live job listings" });
        }
    });

    app.listen(3000, () => {
        console.log('Server running at http://localhost:3000');
    });
}).catch(err => {
    console.error("Failed to initialize database", err);
});
