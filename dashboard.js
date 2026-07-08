// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const appSelector = document.getElementById('app-selector');
    const priorityFilter = document.getElementById('priority-filter');
    const requirementsView = document.getElementById('requirements-view');
    const navigationTree = document.getElementById('navigation-tree');

    let currentData = null;

    // Mapping dictionary to connect clean URL hashes to our file naming conventions
    const projectRouteMap = {
        'embiggen-it': 'embiggen-it.json',
        'galaxy-cats': 'galaxy-cats.json'
    };

    // 1. URL Routing Engine
    function resolveInitialProject() {
        // Grab the hash from the URL string, stripped of the '#' character
        const urlHash = window.location.hash.replace('#', '').toLowerCase();
        
        // If the hash matches one of our defined project keys
        if (projectRouteMap[urlHash]) {
            // Update the dropdown value visually
            appSelector.value = projectRouteMap[urlHash];
            return projectRouteMap[urlHash];
        }
        
        // Fallback to whatever option is selected by default in the HTML
        return appSelector.value;
    }

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

        // Update the subtitle with the active project name from the JSON
        const projectSubtitle = document.getElementById('project-subtitle');
        if (projectSubtitle && currentData.name) {
            projectSubtitle.textContent = currentData.name;
        }

        const targetPriority = priorityFilter.value;
        requirementsView.innerHTML = '';
        navigationTree.innerHTML = '';

        if (currentData.features.length === 0) {
            requirementsView.innerHTML = '<p>No matching functional components declared in matrix.</p>';
            return;
        }

        currentData.features.forEach(feature => {
            const matchingTests = feature.tests.filter(test => 
                targetPriority === 'all' || test.priority.toLowerCase() === targetPriority
            );

            if (matchingTests.length === 0 && targetPriority !== 'all') return;

            // Append navigation item link element tree
            const li = document.createElement('li');
            li.classList.add('nav-item');
            li.innerHTML = `<a href="#feature-${feature.id}" class="nav-link">${feature.title}</a>`;
            navigationTree.appendChild(li);

            // Build layout framework card
            const featureCard = document.createElement('article');
            featureCard.classList.add('feature-card');
            featureCard.id = `feature-${feature.id}`;

            const header = document.createElement('div');
            header.classList.add('feature-header');
            header.innerHTML = `
                <h2>${feature.title}</h2>
                <span class="accordion-icon" aria-hidden="true">&#9662;</span>
            `;
            
            header.addEventListener('click', () => header.classList.toggle('collapsed'));

            const body = document.createElement('div');
            body.classList.add('feature-body');
            body.innerHTML = `<p class="feature-desc">${feature.description}</p>`;

            matchingTests.forEach(test => {
                const testCase = document.createElement('div');
                testCase.classList.add('test-case', `priority-${test.priority.toLowerCase()}`);

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

    // 2. Event Listeners
    appSelector.addEventListener('change', (e) => {
        // Find the matching clean routing key to push to the browser address history
        const selectedFile = e.target.value;
        const lookupKey = Object.keys(projectRouteMap).find(key => projectRouteMap[key] === selectedFile);
        
        if (lookupKey) {
            // Update URL hash cleanly without forcing a full page reload loop
            window.location.hash = lookupKey;
        }
        
        loadTestRequirements(selectedFile);
    });

    priorityFilter.addEventListener('change', renderDashboard);

    // Watch for user browser back/forward buttons or hash link jumps
    window.addEventListener('hashchange', () => {
        const resolvedFile = resolveInitialProject();
        loadTestRequirements(resolvedFile);
    });

    // 3. Initial Run Execution
    const primaryTargetFile = resolveInitialProject();
    loadTestRequirements(primaryTargetFile);
});
