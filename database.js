const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function initializeDatabase() {
    // Open a database connection (creates db.sqlite in the project root)
    const db = await open({
        filename: './db.sqlite',
        driver: sqlite3.Database
    });

    console.log("Connected to SQLite database.");

    // Create the users table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            xp INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Safely add xp column if it doesn't exist (for existing DBs)
    try {
        await db.exec('ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0');
    } catch (e) {
        // Column likely exists
    }

    // Create roadmaps table for Phase 2: Resume parsing gamification
    await db.exec(`
        CREATE TABLE IF NOT EXISTS roadmaps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            target_role TEXT NOT NULL,
            skills_acquired TEXT NOT NULL,  -- Stored as JSON string array
            skills_missing TEXT NOT NULL,   -- Stored as JSON string array (e.g. [{ skill: "Docker", completed: false }])
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    `);

    // Create job_applications table for Tracker
    await db.exec(`
        CREATE TABLE IF NOT EXISTS job_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            company TEXT NOT NULL,
            role TEXT NOT NULL,
            type TEXT NOT NULL,
            pipeline_stage TEXT NOT NULL DEFAULT 'col-wish',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    `);

    // Create mentors table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS mentors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            company TEXT NOT NULL,
            tags TEXT NOT NULL,
            color TEXT NOT NULL,
            avatar TEXT NOT NULL
        )
    `);

    // Safely add email and scheduling_link for v2 Schema
    try {
        await db.exec('ALTER TABLE mentors ADD COLUMN email TEXT');
        await db.exec('ALTER TABLE mentors ADD COLUMN scheduling_link TEXT');
    } catch (e) {
        // SQLite throws if columns exist, ignore if they already do!
    }

    // Create mentor_bookings table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS mentor_bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            mentor_id INTEGER NOT NULL,
            time_slot TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (mentor_id) REFERENCES mentors (id) ON DELETE CASCADE
        )
    `);

    // Seed mentors if empty
    const mentorCount = await db.get('SELECT COUNT(*) as count FROM mentors');
    if (mentorCount.count === 0) {
        const seedMentors = [
            ["Sarah Jenkins", "Staff Software Engineer", "Stripe", "Fast-Paced,FinTech,System Design", "bg-cyan", "SJ"],
            ["Rahul Sharma", "Engineering Manager", "Google", "WLB Focused,Big Tech,Mentorship", "bg-yellow", "RS"],
            ["Emily Chen", "Senior Frontend Dev", "Vercel", "Remote-Only,Open Source,UI/UX", "bg-pink", "EC"],
            ["David O. Silva", "Backend Architect", "Uber", "High-Scale,Microservices,Chaos Eng", "bg-green", "DS"],
            ["Priya Patel", "Founding Engineer", "Y-Combinator Startup", "Wear Multiple Hats,0-to-1,Fast Equity", "bg-yellow", "PP"],
            ["Marcus Johnson", "Data Scientist", "Netflix", "Machine Learning,A/B Testing,Algorithms", "bg-cyan", "MJ"]
        ];
        
        for (const m of seedMentors) {
            await db.run('INSERT INTO mentors (name, role, company, tags, color, avatar) VALUES (?, ?, ?, ?, ?, ?)', m);
        }
    }

    return db;
}

module.exports = { initializeDatabase };
