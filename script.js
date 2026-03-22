const NotesManager = {
    markAsLearnt(event, topic, points) {
        if (typeof GameState === 'undefined') {
            console.error("Error: app.js is not loaded!");
            return;
        }

        const stats = GameState.stats;

        if (!stats.completedTopics.includes(topic)) {
            GameState.addScore(points, topic);

            const card = event.target.closest('.card');
            card.style.borderColor = "#28a745";
            
            const statusText = document.createElement('p');
            statusText.style.color = "#28a745";
            statusText.style.fontWeight = "bold";
            statusText.innerText = `Mastered: ${topic}`;
            card.appendChild(statusText);

            event.target.disabled = true;
            event.target.innerText = "Learned";
            event.target.style.background = "#333";
            event.target.style.color = "#666";
        } else {
            alert("You already earned points for this topic!");
        }
    }
};


const MemoryGame = {
    questions: [
        { q: "What is the output?", code: "let x = 5; console.log(x++);", a: "5" },
        { q: "Which symbol is missing?", code: "const fn = () _ console.log('Hi');", a: "=>" },
        { q: "What type is this?", code: "let data = [1, 2, 3];", a: "object" },
        { q: "How to select ID 'app'?", code: "document._______('app')", a: "getElementById" }
    ],
    currentIndex: 0,
    errors: 0,
    correct: 0,

    start() {
        this.currentIndex = 0;
        this.errors = 0;
        this.correct = 0;
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('answer-area').style.display = 'block';
        document.getElementById('result-stats').style.display = 'block';
        this.render();
    },

    render() {
        if (this.currentIndex < this.questions.length) {
            const current = this.questions[this.currentIndex];
            document.getElementById('question-text').innerText = current.q;
            document.getElementById('code-snippet').innerText = current.code;
            document.getElementById('user-answer').value = "";
        } else {
            this.finish();
        }
    },

    submitAnswer() {
        const userAns = document.getElementById('user-answer').value.trim();
        const correctAns = this.questions[this.currentIndex].a;

        if (userAns === correctAns) {
            this.correct++;
            document.getElementById('correct-count').innerText = this.correct;
        } else {
            this.errors++;
            document.getElementById('error-count').innerText = this.errors;
        }

        this.currentIndex++;
        this.render();
    },

    finish() {
        document.getElementById('quiz-container').innerHTML = `
            <h2>Game Over!</h2>
            <p>Correct Answers: ${this.correct}</p>
            <p>Errors Made: ${this.errors}</p>
            <button onclick="location.reload()">Try Again</button>
        `;

        const finalScore = (this.correct * 20) - (this.errors * 5);
        if (finalScore > 0) {
            GameState.addScore(finalScore, "Memory Challenge");
        }
    }
};

const TaskManager = {
    checkAll() {
        if (typeof GameState === 'undefined') return;

        let totalCorrect = 0;
        const results = {
            1: document.getElementById('ans-1').value.replace(/\s/g, '') === "constyear=2026;",
            2: document.getElementById('ans-2').value === "3",
            3: document.getElementById('ans-3').value.replace(/\s/g, '') === "(a)=>a*2",
            4: document.getElementById('ans-4').value.toLowerCase().trim() === "fetch"
        };

        for (let id in results) {
            const box = document.getElementById(`task-${id}`);
            if (results[id]) {
                box.classList.add('correct');
                box.classList.remove('wrong');
                totalCorrect++;
            } else {
                box.classList.add('wrong');
                box.classList.remove('correct');
            }
        }

        if (totalCorrect === 4) {
            GameState.addScore(80, "Tasks Mastery");
            alert("Perfect! 80 XP added to your score.");
        } else {
            alert(`You got ${totalCorrect}/4 correct. Try again!`);
        }
    }
};

window.addEventListener('load', () => {
    if (window.location.pathname.includes('tasks.html')) {
        console.log("Tasks Page Loaded");
    }
});

const JournalManager = {
    saveEntry() {
        const input = document.getElementById('journal-input');
        const text = input.value.trim();

        if (text.length < 20) {
            alert("Write a bit more (min 20 chars) to earn points!");
            return;
        }

        const entry = {
            date: new Date().toLocaleDateString(),
            content: text
        };

        let history = JSON.parse(localStorage.getItem('js_journal_logs')) || [];
        history.unshift(entry);
        localStorage.setItem('js_journal_logs', JSON.stringify(history));

        GameState.addScore(30, "Journal Entry");
        
        input.value = "";
        this.renderHistory();
    },

    renderHistory() {
        const container = document.getElementById('entries-container');
        if (!container) return;

        const history = JSON.parse(localStorage.getItem('js_journal_logs')) || [];
        container.innerHTML = history.map(item => `
            <div class="card" style="border-left: 4px solid var(--accent); margin-bottom: 10px;">
                <small style="color: var(--accent)">${item.date}</small>
                <p style="margin: 5px 0 0 0;">${item.content}</p>
            </div>
        `).join('');
    }
};

window.addEventListener('load', () => {
    if (window.location.pathname.includes('jurnal.html')) {
        JournalManager.renderHistory();
    }
});

const RoadmapManager = {
    update() {
        const stats = GameState.stats;
        const score = stats.score;
        const progressEl = document.getElementById('main-progress-bar');
        const levelEl = document.getElementById('user-level');
        const xpEl = document.getElementById('xp-remaining');

        if (!progressEl) return;

        let percentage = (score / 1000) * 100;
        if (percentage > 100) percentage = 100;

        progressEl.style.width = percentage + "%";

        if (score < 200) {
            levelEl.innerText = "Beginner";
            xpEl.innerText = `${200 - score} XP to Junior`;
        } else if (score < 500) {
            levelEl.innerText = "Junior";
            xpEl.innerText = `${500 - score} XP to Mid-Level`;
        } else if (score < 1000) {
            levelEl.innerText = "Mid-Level";
            xpEl.innerText = `${1000 - score} XP to Master`;
        } else {
            levelEl.innerText = "JS Master";
            xpEl.innerText = "Maximum Level Reached!";
        }

        this.checkSteps(stats.completedTopics);
    },

    checkSteps(completed) {
        if (completed.includes("Notes Mastery")) {
            document.getElementById('step-notes').classList.add('completed-step');
            document.getElementById('step-notes').querySelector('.status-tag').innerText = "Completed";
        }
        if (completed.includes("Tasks Mastery")) {
            document.getElementById('step-tasks').classList.add('completed-step');
            document.getElementById('step-tasks').querySelector('.status-tag').innerText = "Completed";
        }
        if (completed.includes("Memory Challenge")) {
            document.getElementById('step-memory').classList.add('completed-step');
            document.getElementById('step-memory').querySelector('.status-tag').innerText = "Completed";
        }
    }
};

window.addEventListener('load', () => {
    if (window.location.pathname.includes('roadmap.html')) {
        RoadmapManager.update();
    }
});

const ScoreManager = {
    init() {
        const stats = GameState.stats;
        this.animateScore(stats.score);
        this.renderTopics(stats.completedTopics);
    },

    animateScore(target) {
        const scoreEl = document.getElementById('big-score');
        if (!scoreEl) return;

        let current = 0;
        const speed = 20; 
        const increment = Math.ceil(target / 50);

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                scoreEl.innerText = target;
                clearInterval(timer);
            } else {
                scoreEl.innerText = current;
            }
        }, speed);
    },

    renderTopics(topics) {
        const list = document.getElementById('topics-list');
        if (!list) return;

        if (topics.length === 0) {
            list.innerHTML = "<li>No topics mastered yet. Start learning!</li>";
            return;
        }

        list.innerHTML = topics.map(t => `
            <li style="padding: 10px; border-bottom: 1px solid #333; display: flex; justify-content: space-between;">
                <span>${t}</span>
                <span style="color: var(--success)">● Completed</span>
            </li>
        `).join('');
    },

    resetGame() {
        if (confirm("Are you sure? This will delete all your scores and progress!")) {
            localStorage.clear();
            location.reload();
        }
    }
};

window.addEventListener('load', () => {
    if (window.location.pathname.includes('score.html')) {
        ScoreManager.init();
    }
});