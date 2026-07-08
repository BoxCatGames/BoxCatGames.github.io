// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const appSelector = document.getElementById('app-selector');
    const priorityFilter = document.getElementById('priority-filter');
    const requirementsView = document.getElementById('requirements-view');
    const navigationTree = document.getElementById('navigation-tree');

    let currentData = null;

    // Load data natively based on selector configurations
    async function loadTestRequirements(jsonFileName) {
        try {
            requirementsView.innerHTML = '<p style="color: var(--secondary-color);">Loading specifications matrix...</p>';
            const response = await fetch(`tests/${jsonFileName}`);
            if (!response.ok) throw new Error(`HTTP verification failure: ${response.status}`);
            
            currentData = await response.json();
            renderDashboard();
        } catch (error) {
            requirementsView.innerHTML = `
                <p style="color: #ff4a4a; font-weight: bold;">
                    Error parsing requirement layout dataset: ${error.message}<br>
                    Ensure your local test file exists at /tests/${jsonFileName}
                </p>`;
        }
    }

    // Build layout elements and sync navigation arrays
    function renderDashboard() {
        if (!currentData) return;

        const targetPriority = priorityFilter.value;
        requirementsView.innerHTML = '';
        navigationTree.innerHTML = '';

        if (currentData.features.length === 0) {
            requirementsView.innerHTML = '<p>No matching functional components declared in matrix.</p>';
            return;
        }

        currentData.features.forEach(feature => {
            // Filter tests belonging to this block internally
            const matchingTests = feature.tests.filter(test => 
                targetPriority === 'all' || test.priority.toLowerCase() === targetPriority
            );

            // Skip rendering features that have zero current priority matches
            if (matchingTests.length === 0 && targetPriority !== 'all') return;

            // 1. Append navigation item link element tree
            const li = document.createElement('li');
            li.classList.add('nav-item');
            li.innerHTML = `<a href="#feature-${feature.id}" class="nav-link">${feature.title}</a>`;
            navigationTree.appendChild(li);

            // 2. Build layout framework card
            const featureCard = document.createElement('article');
            featureCard.classList.add('feature-card');
            featureCard.id = `feature-${feature.id}`;

            // Header layout container (Accordion toggler)
            const header = document.createElement('div');
            header.classList.add('feature-header');
            header.innerHTML = `
                <h2>${feature.title}</h2>
                <span class="accordion-icon" aria-hidden="true">&#9662;</span>
            `;
            
            // Toggle accordion state cleanly
            header.addEventListener('click', () => header.classList.toggle('collapsed'));

            // Body content containing specs
            const body = document.createElement('div');
            body.classList.add('feature-body');
            body.innerHTML = `<p class="feature-desc">${feature.description}</p>`;

            // 3. Append matched verification assertions
            matchingTests.forEach(test => {
                const testCase = document.createElement('div');
                testCase.classList.add('test-case', `priority-${test.priority.toLowerCase()}`);

                // Map string arrays securely
                const preconditionsHTML = test.preconditions.length > 0 
                    ? `<ul class="test-list">${test.preconditions.map(p => `<li>${p}</li>`).join('')}</ul>`
                    : '<em>None</em>';

                const expectedHTML = test.expected.map(e => `<li>${e}</li>`).join('');

                testCase.innerHTML = `
                    <div class="test-meta">
                        <span style="color: var(--secondary-color);">ID: <strong>${test.id}</strong></span>
                        <span class="priority-badge">${test.priority}</span>
                    </div>
                    <div class="test-section"><strong>Preconditions:</strong> ${preconditionsHTML}</div>
                    <div class="test-section"><strong>Action Execution:</strong> ${test.action}</div>
                    <div class="test-section"><strong>Expected Assertion Matrix:</strong>
                        <ul class="test-list">${expectedHTML}</ul>
                    </div>
                `;
                body.appendChild(testCase);
            });

            featureCard.appendChild(header);
            featureCard.appendChild(body);
            requirementsView.appendChild(featureCard);
        });

        if (requirementsView.innerHTML === '') {
            requirementsView.innerHTML = '<p style="color: var(--secondary-color);">No specifications match the selected priority criteria level.</p>';
        }
    }

    // Bind interaction engines
    appSelector.addEventListener('change', (e) => loadTestRequirements(e.target.value));
    priorityFilter.addEventListener('change', renderDashboard);

    // Initial default run
    loadTestRequirements(appSelector.value);
});
