const express = require('express');

const app = express();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mySQL2026',
    database: 'atendance'
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.message);
        return;
    }
    console.log('Connected to DB');
});

app.get('/', (req, res) => {
    res.send('welcome to my app');
});

app.get('/students', (req, res) => {
    connection.query('SELECT * FROM students', (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).json({ error: 'Failed to fetch students' });
        }

        res.json(results || []);
    });
});

app.get('/students/:id', (req, res) => {
    const studentId = req.params.id;
    connection.query('SELECT * FROM students WHERE id = ?', [studentId], (err, results) => {
        if (err) {
            console.error('Error fetching student:', err);
            return res.status(500).json({ error: 'Failed to fetch student' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(results[0]);
    });
});

app.post('/students', express.json(), (req, res) => {
    const { name, gender, course_id } = req.body;
    const normalizedGender = String(gender || '').trim().toLowerCase();
    const safeGender = normalizedGender === 'female' || normalizedGender === 'f' ? 'f'
        : normalizedGender === 'male' || normalizedGender === 'm' ? 'm'
        : normalizedGender;

    if (!name || !safeGender || course_id === undefined) {
        return res.status(400).json({ error: 'name, gender, and course_id are required' });
    }

    connection.query(
        'INSERT INTO students (name, gender, course_id) VALUES (?, ?, ?)',
        [name, safeGender, course_id],
        (err, results) => {
            if (err) {
                console.error('Error inserting student:', err);
                return res.status(500).json({ error: 'Failed to insert student', detail: err.message });
            }

            res.status(201).json({ id: results.insertId, name, gender: safeGender, course_id });
        }
    );
});

app.put('/students/:id', express.json(), (req, res) => {
    const studentId = req.params.id;
    const { name, gender, course_id } = req.body;
    const normalizedGender = String(gender || '').trim().toLowerCase();
    const safeGender = normalizedGender === 'female' || normalizedGender === 'f' ? 'f'
        : normalizedGender === 'male' || normalizedGender === 'm' ? 'm'
        : normalizedGender;

    if (!name || !safeGender || course_id === undefined) {
        return res.status(400).json({ error: 'name, gender, and course_id are required' });
    }

    connection.query(
        'UPDATE students SET name = ?, gender = ?, course_id = ? WHERE id = ?',
        [name, safeGender, course_id, studentId],
        (err, results) => {
            if (err) {
                console.error('Error updating student:', err);
                return res.status(500).json({ error: 'Failed to update student', detail: err.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Student not found' });
            }

            res.json({ id: studentId, name, gender: safeGender, course_id });
        }
    );
});

app.patch('/students/:id', express.json(), (req, res) => {
    const studentId = req.params.id;
    const { course_id } = req.body;

    if (course_id === undefined) {
        return res.status(400).json({ error: 'course_id is required' });
    }

    connection.query(
        'UPDATE students SET course_id = ? WHERE id = ?',
        [course_id, studentId],
        (err, results) => {
            if (err) {
                console.error('Error updating student course:', err);
                return res.status(500).json({ error: 'Failed to update student course', detail: err.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Student not found' });
            }

            res.json({ id: studentId, course_id });
        }
    );
});



app.delete('/students/:id', (req, res) => {
    const studentId = req.params.id;

    connection.query(
        'DELETE FROM students WHERE id = ?',
        [studentId],
        (err, results) => {
            if (err) {
                console.error('Error deleting student:', err);
                return res.status(500).json({ error: 'Failed to delete student', detail: err.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Student not found' });
            }

            res.json({ id: studentId, message: 'Student deleted successfully' });
        }
    );
});
console.log('Starting server...');

app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});