const GameState = {
    stats: JSON.parse(localStorage.getItem('js_study_data')) || {
        score: 0,
        completedTopics: []
    },

    addScore(points, topic) {
        this.stats.score += points;
        if (topic && !this.stats.completedTopics.includes(topic)) {
            this.stats.completedTopics.push(topic);
        }
        this.save();
        this.updateUI();
    },

    save() {
        localStorage.setItem('js_study_data', JSON.stringify(this.stats));
    },

    updateUI() {
        const scoreEl = document.getElementById('total-score-val');
        if (scoreEl) scoreEl.innerText = this.stats.score;
    }
};

window.addEventListener('load', () => GameState.updateUI());