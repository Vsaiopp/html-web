const app = {
    state: {
        players: JSON.parse(localStorage.getItem('cricTrack_players')) || [],
        currentPlayerId: null
    },

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderDashboard();
    },

    cacheDOM() {
        this.views = {
            dashboard: document.getElementById('dashboardView'),
            addPlayer: document.getElementById('addPlayerView'),
            details: document.getElementById('playerDetailsView'),
            addRecord: document.getElementById('addRecordView')
        };

        this.elements = {
            playersGrid: document.getElementById('playersGrid'),
            emptyState: document.getElementById('emptyState'),
            addPlayerBtn: document.getElementById('addPlayerBtn'),
            newPlayerForm: document.getElementById('newPlayerForm'),
            newRecordForm: document.getElementById('newRecordForm'),
            backToDetailsBtn: document.getElementById('backToDetailsBtn'),

            // Detail elements
            detailName: document.getElementById('detailName'),
            detailRole: document.getElementById('detailRole'),
            detailTeam: document.getElementById('detailTeam'),
            totalMatches: document.getElementById('totalMatches'),
            totalRuns: document.getElementById('totalRuns'),
            totalWickets: document.getElementById('totalWickets'),
            highestScore: document.getElementById('highestScore'),
            recordsList: document.getElementById('recordsList')
        };
    },

    bindEvents() {
        this.elements.addPlayerBtn.addEventListener('click', () => this.showView('addPlayer'));

        this.elements.newPlayerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddPlayer();
        });

        this.elements.newRecordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddRecord();
        });

        this.elements.backToDetailsBtn.addEventListener('click', () => {
            this.showPlayerDetails(this.state.currentPlayerId);
        });

        // Fetch Feature
        const fetchBtn = document.getElementById('fetchPlayerBtn');
        if (fetchBtn) {
            fetchBtn.addEventListener('click', () => this.handleFetchPlayer());
        }
    },

    async handleFetchPlayer() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();
        const feedback = document.getElementById('fetchFeedback');
        const icon = document.getElementById('fetchIcon');
        const spinner = document.getElementById('fetchSpinner');

        if (!name) {
            feedback.textContent = 'Please enter a name first.';
            feedback.className = 'fetch-feedback text-error';
            return;
        }

        // UI Loading State
        icon.style.display = 'none';
        spinner.style.display = 'block';
        feedback.textContent = 'Searching database...';
        feedback.className = 'fetch-feedback';

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const data = this.mockPlayerDatabase(name);

            if (data) {
                document.getElementById('playerRole').value = data.role;
                document.getElementById('playerCountry').value = data.country;
                feedback.innerHTML = '✓ Found! Details auto-filled.';
                feedback.className = 'fetch-feedback text-success';
            } else {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(name + ' cricketer stats')}`;
                feedback.innerHTML = `Player not found in local DB. <a href="${searchUrl}" target="_blank" class="text-link">Search on Google</a>`;
                feedback.className = 'fetch-feedback text-error';
            }
        } catch (error) {
            feedback.textContent = 'Error fetching data.';
            feedback.className = 'fetch-feedback text-error';
        } finally {
            icon.style.display = 'block';
            spinner.style.display = 'none';
        }
    },

    mockPlayerDatabase(name) {
        // Simple mock DB for demo purposes
        const db = {
            'virat kohli': { role: 'Batsman', country: 'India' },
            'rohit sharma': { role: 'Batsman', country: 'India' },
            'ms dhoni': { role: 'Wicketkeeper', country: 'India' },
            'steve smith': { role: 'Batsman', country: 'Australia' },
            'pat cummins': { role: 'Bowler', country: 'Australia' },
            'ben stokes': { role: 'All-Rounder', country: 'England' },
            'jasprit bumrah': { role: 'Bowler', country: 'India' },
            'kane williamson': { role: 'Batsman', country: 'New Zealand' },
            'babar azam': { role: 'Batsman', country: 'Pakistan' },
            'rashid khan': { role: 'Bowler', country: 'Afghanistan' }
        };
        return db[name.toLowerCase()];
    },

    saveState() {
        localStorage.setItem('cricTrack_players', JSON.stringify(this.state.players));
    },

    // Navigation
    showView(viewName) {
        Object.values(this.views).forEach(view => view.classList.remove('active'));
        this.views[viewName].classList.add('active');

        // Toggle header button visibility
        this.elements.addPlayerBtn.style.display = viewName === 'dashboard' ? 'block' : 'none';
    },

    showDashboard() {
        this.showView('dashboard');
        this.renderDashboard();
    },

    showPlayerDetails(playerId) {
        this.state.currentPlayerId = playerId;
        this.renderPlayerDetails(playerId);
        this.showView('details');
    },

    showAddRecordModal() {
        // Pre-fill date
        document.getElementById('matchDate').valueAsDate = new Date();
        this.showView('addRecord');
    },

    // Logic
    handleAddPlayer() {
        const name = document.getElementById('playerName').value;
        const role = document.getElementById('playerRole').value;
        const country = document.getElementById('playerCountry').value;

        const newPlayer = {
            id: Date.now().toString(),
            name,
            role,
            country,
            records: []
        };

        this.state.players.push(newPlayer);
        this.saveState();
        this.elements.newPlayerForm.reset();
        this.showDashboard();
    },

    handleAddRecord() {
        const player = this.state.players.find(p => p.id === this.state.currentPlayerId);
        if (!player) return;

        const record = {
            id: Date.now().toString(),
            opponent: document.getElementById('opponent').value,
            runs: parseInt(document.getElementById('runs').value) || 0,
            balls: parseInt(document.getElementById('balls').value) || 0,
            wickets: parseInt(document.getElementById('wickets').value) || 0,
            overs: parseFloat(document.getElementById('overs').value) || 0,
            date: document.getElementById('matchDate').value
        };

        player.records.unshift(record); // Add new record to top
        this.saveState();
        this.elements.newRecordForm.reset();
        this.showPlayerDetails(this.state.currentPlayerId);
    },

    // Rendering
    renderDashboard() {
        this.elements.playersGrid.innerHTML = '';

        if (this.state.players.length === 0) {
            this.elements.emptyState.style.display = 'block';
            return;
        }

        this.elements.emptyState.style.display = 'none';

        this.state.players.forEach(player => {
            const totalRuns = player.records.reduce((sum, r) => sum + r.runs, 0);
            const totalWickets = player.records.reduce((sum, r) => sum + r.wickets, 0);
            const matches = player.records.length;

            const card = document.createElement('div');
            card.className = 'glass-card player-card';
            card.innerHTML = `
                <div class="player-header">
                    <div>
                        <div class="player-name">${player.name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">${player.country}</div>
                    </div>
                    <span class="player-role">${player.role}</span>
                </div>
                <div>
                    <div class="stat-row">
                        <span class="stat-label">Matches</span>
                        <span class="stat-value">${matches}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Runs</span>
                        <span class="stat-value">${totalRuns}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Wickets</span>
                        <span class="stat-value">${totalWickets}</span>
                    </div>
                </div>
                <button class="btn btn-secondary" style="width: 100%; margin-top: auto;" 
                    onclick="app.showPlayerDetails('${player.id}')">View Profile</button>
            `;
            this.elements.playersGrid.appendChild(card);
        });
    },

    renderPlayerDetails(playerId) {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return;

        // Update Header
        this.elements.detailName.textContent = player.name;
        this.elements.detailRole.textContent = player.role;
        this.elements.detailTeam.textContent = player.country;

        // Calculate Stats
        const stats = player.records.reduce((acc, record) => {
            acc.runs += record.runs;
            acc.wickets += record.wickets;
            acc.highest = Math.max(acc.highest, record.runs);
            return acc;
        }, { runs: 0, wickets: 0, highest: 0 });

        this.elements.totalMatches.textContent = player.records.length;
        this.elements.totalRuns.textContent = stats.runs;
        this.elements.totalWickets.textContent = stats.wickets;
        this.elements.highestScore.textContent = stats.highest;

        // Render History
        this.elements.recordsList.innerHTML = '';
        player.records.forEach(record => {
            const el = document.createElement('div');
            el.className = 'glass-card';
            el.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600;">vs ${record.opponent}</span>
                    <span style="color: var(--text-muted); font-size: 0.85rem;">${record.date}</span>
                </div>
                <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    <div>
                        <div class="stat-label">Batting</div>
                        <div class="stat-value">${record.runs} (${record.balls})</div>
                    </div>
                    <div>
                        <div class="stat-label">Bowling</div>
                        <div class="stat-value">${record.wickets} / ${record.overs}</div>
                    </div>
                </div>
            `;
            this.elements.recordsList.appendChild(el);
        });
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
