const $ = (id) => document.getElementById(id);

const esc = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));

const safe = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed || trimmed === '#') return null;
    return /^https?:\/\//i.test(trimmed) ? trimmed : null;
};

// Verified project metadata matching project descriptions & official skills
const PROJECT_METADATA = {
    "Wildfire Suppressing Multi-Drone Agent": {
        badge: "AI & Simulation",
        skills: ["Python", "Git"],
        technologies: ["Python", "PyGame", "PPO Reinforcement Learning", "Multi-Agent Systems", "Git"],
        role: "Designed custom wildfire simulation environment, multi-drone cooperative policy via PPO reinforcement learning, battery constraint modeling, and real-time PyGame visualizer."
    },
    "Customer Segmentation": {
        badge: "Machine Learning",
        skills: ["Python", "Git"],
        technologies: ["Python", "Streamlit", "Scikit-Learn", "K-Means", "PCA", "Git"],
        role: "Built the interactive Streamlit dashboard, implemented PCA visualization for high-dimensional customer data, clustering quality metrics, and customer segment classification."
    },
    "PowerGuard": {
        badge: "Desktop Application",
        skills: ["Java", "Git"],
        technologies: ["Java", "JavaFX", "Machine Learning", "Model Benchmarking", "Git"],
        role: "Developed the JavaFX desktop user interface, monthly budget and electricity consumption tracking, and benchmarked five ML models to select the most accurate predictor."
    },
    "Water Level Monitoring System": {
        badge: "IoT & Hardware",
        skills: ["C"],
        technologies: ["C", "Arduino UNO", "Ultrasonic Sensors", "Embedded Systems", "IoT"],
        role: "Engineered an IoT prototype using Arduino UNO and ultrasonic distance sensors, programmed threshold measurement and alerting routines in C/Arduino as part of Idea Lab."
    }
};

let currentProjects = [
    {
        title: "Wildfire Suppressing Multi-Drone Agent",
        desc: "A custom wildfire simulation where four firefighting drones learn to cooperate using PPO reinforcement learning. Includes battery management, resource constraints and real-time PyGame visualization.",
        link: "https://github.com/Mohd-Hanan/Wildfire-Suppressing-Multi-Drone-Agent"
    },
    {
        title: "Customer Segmentation",
        desc: "An interactive Streamlit dashboard that uses K-Means clustering to segment customers, visualize clusters with PCA, evaluate clustering quality and predict the segment of new customers.",
        link: "https://github.com/Mohd-Hanan/IML-PROJECT"
    },
    {
        title: "PowerGuard",
        desc: "A JavaFX desktop application that predicts electricity bills, tracks monthly budgets and benchmarks five machine learning models to select the best-performing model.",
        link: "https://github.com/Mohd-Hanan/AP-PROJECT"
    },
    {
        title: "Water Level Monitoring System",
        desc: "Developed an IoT-based water level monitoring system using Arduino UNO and ultrasonic sensors as part of Idea Lab (Semester 1).",
        link: ""
    }
];

let activeSkill = null;
let lastFocusedCard = null;

// ==========================================
// 1. PROJECT DETAIL POPUPS (HOVER & MODAL)
// ==========================================
let hoverOpenTimer = null;
let hoverCloseTimer = null;
let isPointerOverCard = false;
let isPointerOverModal = false;
let currentHoveredCard = null;
let modalMode = null; // 'hover' | 'modal' | 'keyboard'
let isTouchUser = false;
if (typeof window !== 'undefined') {
    window.addEventListener('touchstart', () => {
        isTouchUser = true;
    }, { passive: true, once: true });
}

function isFineHover(e) {
    if (e && e.pointerType === 'touch') return false;
    if (e && (e.pointerType === 'mouse' || e.pointerType === 'pen')) return true;
    if (isTouchUser) return false;
    return true;
}

function updateModalContent(project) {
    const meta = PROJECT_METADATA[project.title] || {
        badge: "Project Overview",
        skills: [],
        technologies: [],
        role: project.desc
    };

    $('modal-title').textContent = project.title;
    $('modal-desc').textContent = project.desc;
    $('modal-badge').textContent = meta.badge || "Project";
    $('modal-role').textContent = meta.role || "Project design, implementation and testing.";

    const techContainer = $('modal-tech');
    techContainer.innerHTML = (meta.technologies || [])
        .map(t => `<span>${esc(t)}</span>`)
        .join('');

    const actionsContainer = $('modal-actions');
    const projectLink = safe(project.link);
    if (projectLink) {
        actionsContainer.innerHTML = `
            <a href="${esc(projectLink)}" target="_blank" rel="noopener noreferrer" class="modal-btn-primary">
                View on GitHub ↗
            </a>
        `;
    } else {
        actionsContainer.innerHTML = `
            <span class="modal-note-pill">✦ Academic prototype · Idea Lab</span>
        `;
    }
}

function openProjectModal(project, mode = 'hover') {
    const modal = $('project-modal');
    if (!modal) return;

    if (hoverCloseTimer) {
        clearTimeout(hoverCloseTimer);
        hoverCloseTimer = null;
    }

    updateModalContent(project);
    modalMode = mode;

    modal.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');

    if (mode === 'hover') {
        modal.classList.add('modal-hover-mode');
        modal.classList.remove('modal-modal-mode');
    } else {
        modal.classList.add('modal-modal-mode');
        modal.classList.remove('modal-hover-mode');
        if (mode === 'modal') {
            document.body.style.overflow = 'hidden';
            const closeBtn = $('modal-close');
            if (closeBtn) closeBtn.focus();
        }
    }
}

function closeProjectModal(force = false) {
    const modal = $('project-modal');
    if (!modal || !modal.classList.contains('modal-open')) return;

    if (!force && modalMode === 'hover' && (isPointerOverCard || isPointerOverModal)) {
        return;
    }

    if (hoverOpenTimer) {
        clearTimeout(hoverOpenTimer);
        hoverOpenTimer = null;
    }
    if (hoverCloseTimer) {
        clearTimeout(hoverCloseTimer);
        hoverCloseTimer = null;
    }

    modal.classList.remove('modal-open', 'modal-hover-mode', 'modal-modal-mode');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalMode = null;

    if (lastFocusedCard && typeof lastFocusedCard.focus === 'function') {
        if (modal.contains(document.activeElement)) {
            lastFocusedCard.focus();
        }
    }
}

function scheduleHoverClose(delay = 320) {
    if (hoverCloseTimer) clearTimeout(hoverCloseTimer);
    hoverCloseTimer = setTimeout(() => {
        if (!isPointerOverCard && !isPointerOverModal) {
            closeProjectModal(true);
        }
    }, delay);
}

function initModalEvents() {
    const modal = $('project-modal');
    if (!modal) return;

    const modalCard = modal.querySelector('.modal-card');
    if (modalCard) {
        modalCard.addEventListener('mouseenter', (e) => {
            if (e && e.pointerType === 'touch') return;
            isPointerOverModal = true;
            if (hoverCloseTimer) {
                clearTimeout(hoverCloseTimer);
                hoverCloseTimer = null;
            }
        });

        modalCard.addEventListener('mouseleave', (e) => {
            if (e && e.pointerType === 'touch') return;
            isPointerOverModal = false;
            scheduleHoverClose(300);
        });
    }

    const closeBtn = $('modal-close');
    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeProjectModal(true);
        };
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProjectModal(true);
        }
    });

    document.addEventListener('pointerdown', (e) => {
        if (!modal.classList.contains('modal-open')) return;
        const insideModal = e.target.closest('.modal-card');
        const insideCard = e.target.closest('.card');
        if (!insideModal && !insideCard) {
            closeProjectModal(true);
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('modal-open')) {
            closeProjectModal(true);
        }
    });
}

function attachCardInteractivity() {
    const cards = document.querySelectorAll('.grid .card');
    cards.forEach((card, index) => {
        const project = currentProjects[index];
        if (!project) return;

        card.style.cursor = 'pointer';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-haspopup', 'dialog');
        card.setAttribute('aria-label', `View details for ${project.title}`);

        // Direct link isolation
        const links = card.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // 1. Pointer / Hover interaction for desktop with delay & grace period
        card.addEventListener('mouseenter', (e) => {
            if (e && e.pointerType === 'touch') return;
            if (!isFineHover(e)) return;

            isPointerOverCard = true;
            currentHoveredCard = card;
            if (hoverCloseTimer) {
                clearTimeout(hoverCloseTimer);
                hoverCloseTimer = null;
            }

            const modal = $('project-modal');
            const isAlreadyOpen = modal && modal.classList.contains('modal-open');

            if (isAlreadyOpen && modalMode === 'hover') {
                updateModalContent(project);
                lastFocusedCard = card;
            } else {
                if (hoverOpenTimer) clearTimeout(hoverOpenTimer);
                hoverOpenTimer = setTimeout(() => {
                    lastFocusedCard = card;
                    openProjectModal(project, 'hover');
                }, 220);
            }
        });

        card.addEventListener('mouseleave', (e) => {
            if (e && e.pointerType === 'touch') return;
            if (currentHoveredCard === card) {
                currentHoveredCard = null;
            }
            isPointerOverCard = false;
            if (hoverOpenTimer) {
                clearTimeout(hoverOpenTimer);
                hoverOpenTimer = null;
            }
            scheduleHoverClose(320);
        });

        // 2. Click / Tap interaction (retained for mobile/tablet & explicit clicks)
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;

            lastFocusedCard = card;
            if (hoverOpenTimer) {
                clearTimeout(hoverOpenTimer);
                hoverOpenTimer = null;
            }
            openProjectModal(project, 'modal');
        });

        // 3. Keyboard focus opens details
        card.addEventListener('focus', () => {
            lastFocusedCard = card;
            openProjectModal(project, 'keyboard');
        });

        card.addEventListener('blur', () => {
            setTimeout(() => {
                const modal = $('project-modal');
                if (
                    modal &&
                    !modal.contains(document.activeElement) &&
                    !card.contains(document.activeElement) &&
                    document.activeElement !== card
                ) {
                    if (modalMode === 'keyboard' || modalMode === 'hover') {
                        closeProjectModal(true);
                    }
                }
            }, 120);
        });

        card.addEventListener('keydown', (e) => {
            if (e.target.closest('a')) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                lastFocusedCard = card;
                openProjectModal(project, 'modal');
                const closeBtn = $('modal-close');
                if (closeBtn) closeBtn.focus();
            }
        });
    });
}

// ==========================================
// 2. INTERACTIVE SKILLS CONSTELLATION
// ==========================================

const CONSTELLATION_DATA = {
    categories: [
        {
            id: 'programming',
            name: 'PROGRAMMING',
            shortName: 'Programming',
            x: 70,
            y: 18,
            technologies: [
                { name: 'Python', x: 62, y: 6 },
                { name: 'Java', x: 76, y: 6 },
                { name: 'C', x: 85, y: 15 },
                { name: 'C++', x: 88, y: 27 }
            ]
        },
        {
            id: 'ai-ml',
            name: 'AI & MACHINE LEARNING',
            shortName: 'AI & ML',
            x: 30,
            y: 18,
            technologies: [
                { name: 'Scikit-learn', x: 15, y: 12 },
                { name: 'K-Means', x: 26, y: 5 },
                { name: 'PCA', x: 38, y: 5 },
                { name: 'StandardScaler', x: 11, y: 24 },
                { name: 'PPO', x: 18, y: 34 },
                { name: 'Reinforcement Learning', x: 32, y: 34 }
            ]
        },
        {
            id: 'data-science',
            name: 'DATA SCIENCE',
            shortName: 'Data Science',
            x: 14,
            y: 50,
            technologies: [
                { name: 'NumPy', x: 8, y: 36 },
                { name: 'Pandas', x: 22, y: 36 },
                { name: 'Matplotlib', x: 8, y: 64 },
                { name: 'Weka', x: 22, y: 64 }
            ]
        },
        {
            id: 'frameworks',
            name: 'FRAMEWORKS & SIMULATION',
            shortName: 'Frameworks & Sim',
            x: 86,
            y: 50,
            technologies: [
                { name: 'Streamlit', x: 78, y: 36 },
                { name: 'PyGame', x: 92, y: 36 },
                { name: 'Gymnasium', x: 78, y: 64 },
                { name: 'JavaFX', x: 92, y: 64 }
            ]
        },
        {
            id: 'databases',
            name: 'DATABASES',
            shortName: 'Databases',
            x: 28,
            y: 82,
            technologies: [
                { name: 'MySQL', x: 15, y: 76 },
                { name: 'Oracle', x: 24, y: 94 },
                { name: 'SQL*Plus', x: 38, y: 94 }
            ]
        },
        {
            id: 'tools-platforms',
            name: 'TOOLS & PLATFORMS',
            shortName: 'Tools & Platforms',
            x: 72,
            y: 82,
            technologies: [
                { name: 'Git', x: 58, y: 92 },
                { name: 'GitHub', x: 70, y: 94 },
                { name: 'VS Code', x: 82, y: 92 },
                { name: 'Jupyter Notebook', x: 88, y: 78 },
                { name: 'Arduino', x: 85, y: 66 },
                { name: 'IntelliJ IDEA', x: 60, y: 70 },
                { name: 'PyCharm', x: 62, y: 81 }
            ]
        }
    ],
    verifiedProjects: {
        'Python': ['Wildfire Suppressing Multi-Drone Agent', 'Customer Segmentation'],
        'Java': ['PowerGuard'],
        'C': ['Water Level Monitoring System'],
        'PPO': ['Wildfire Suppressing Multi-Drone Agent'],
        'Streamlit': ['Customer Segmentation'],
        'Gymnasium': ['Wildfire Suppressing Multi-Drone Agent'],
        'PyGame': ['Wildfire Suppressing Multi-Drone Agent'],
        'JavaFX': ['PowerGuard'],
        'Arduino': ['Water Level Monitoring System'],
        'Git': ['Wildfire Suppressing Multi-Drone Agent', 'Customer Segmentation', 'PowerGuard']
    }
};

let activeCategory = null;
let activeTechnology = null;

function getNodeCenter(nodeEl, containerEl) {
    if (!nodeEl || !containerEl) return { x: 0, y: 0 };
    const cRect = containerEl.getBoundingClientRect();
    const nRect = nodeEl.getBoundingClientRect();
    return {
        x: nRect.left + nRect.width / 2 - cRect.left,
        y: nRect.top + nRect.height / 2 - cRect.top
    };
}

function drawConstellationLines() {
    const stage = $('constellation-stage');
    const linesLayer = $('constellation-lines-layer');
    const hananNode = $('node-hanan');
    if (!stage || !linesLayer || !hananNode) return;

    if (window.innerWidth <= 650) {
        linesLayer.innerHTML = '';
        return;
    }

    const hananCenter = getNodeCenter(hananNode, stage);
    let svgHtml = '';

    // Celestial connecting ring between categories
    const catElements = Array.from(document.querySelectorAll('.category-node'));
    if (catElements.length >= 6) {
        const ringOrder = [1, 0, 3, 5, 4, 2, 1];
        let pathD = '';
        ringOrder.forEach((idx, i) => {
            const cat = catElements[idx];
            if (cat) {
                const pt = getNodeCenter(cat, stage);
                pathD += (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
            }
        });
        svgHtml += `<path d="${pathD}" class="constellation-ring-line" />`;
    }

    // Lines from HANAN to each Category Node
    catElements.forEach(catEl => {
        const catCenter = getNodeCenter(catEl, stage);
        const isActive = catEl.classList.contains('active');
        const isSubdued = catEl.classList.contains('subdued');
        const lineClass = `constellation-line ${isActive ? 'active' : ''} ${isSubdued ? 'subdued' : ''}`.trim();
        svgHtml += `<line x1="${hananCenter.x}" y1="${hananCenter.y}" x2="${catCenter.x}" y2="${catCenter.y}" class="${lineClass}" />`;
    });

    // If a category is active, draw branch lines to revealed technology nodes
    if (activeCategory) {
        const activeCatEl = document.querySelector(`.category-node[data-id="${activeCategory}"]`);
        if (activeCatEl) {
            const catCenter = getNodeCenter(activeCatEl, stage);
            const techElements = Array.from(document.querySelectorAll('.tech-node'));
            techElements.forEach(techEl => {
                const techCenter = getNodeCenter(techEl, stage);
                svgHtml += `<line x1="${catCenter.x}" y1="${catCenter.y}" x2="${techCenter.x}" y2="${techCenter.y}" class="tech-branch-line" />`;
            });
        }
    }

    linesLayer.innerHTML = svgHtml;
}

function selectCategory(catId) {
    if (activeCategory === catId) {
        resetConstellation();
        return;
    }

    activeCategory = catId;
    activeTechnology = null;
    closeTechDetailPanel(false);

    const category = CONSTELLATION_DATA.categories.find(c => c.id === catId);
    if (!category) return;

    // Update Category Nodes state
    const catElements = document.querySelectorAll('.category-node');
    catElements.forEach(el => {
        const id = el.getAttribute('data-id');
        if (id === catId) {
            el.classList.add('active');
            el.classList.remove('subdued');
            el.setAttribute('aria-expanded', 'true');
        } else {
            el.classList.remove('active');
            el.classList.add('subdued');
            el.setAttribute('aria-expanded', 'false');
        }
    });

    // Update Status Hint & Reset Button
    const statusText = $('constellation-status-text');
    if (statusText) {
        statusText.textContent = `${category.name} active · Select a star to explore`;
    }
    const resetBtn = $('reset-constellation');
    if (resetBtn) {
        resetBtn.style.display = 'inline-flex';
    }

    // Render Technology Nodes
    const techLayer = $('tech-nodes-layer');
    if (techLayer) {
        techLayer.innerHTML = category.technologies.map((tech) => {
            const hasProjects = !!(CONSTELLATION_DATA.verifiedProjects[tech.name]?.length);
            return `
                <button type="button" class="tech-node" data-tech="${esc(tech.name)}" tabindex="0" role="button" aria-label="Technology: ${esc(tech.name)}${hasProjects ? ' (has linked projects)' : ''}">
                    ${hasProjects ? '<span class="tech-has-projects" aria-hidden="true"></span>' : ''}
                    <span>${esc(tech.name)}</span>
                </button>
            `;
        }).join('');

        // Apply coordinates on desktop/tablet & staggered entrance
        const isMobile = window.innerWidth <= 650;
        const techNodes = techLayer.querySelectorAll('.tech-node');
        techNodes.forEach((node, idx) => {
            const techData = category.technologies[idx];
            if (!isMobile && techData) {
                node.style.left = `${techData.x}%`;
                node.style.top = `${techData.y}%`;
            }

            setTimeout(() => {
                node.classList.add('visible');
            }, idx * 25);

            node.onclick = () => selectTechnology(techData.name, category);
            node.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectTechnology(techData.name, category);
                }
            };
        });
    }

    // Redraw lines after nodes are placed
    requestAnimationFrame(() => {
        drawConstellationLines();
    });
}

function selectTechnology(techName, category) {
    activeTechnology = techName;

    // Update active class on tech nodes
    const techNodes = document.querySelectorAll('.tech-node');
    techNodes.forEach(node => {
        if (node.getAttribute('data-tech') === techName) {
            node.classList.add('active');
        } else {
            node.classList.remove('active');
        }
    });

    // Populate Technology Detail Panel
    const panel = $('tech-detail-panel');
    const categoryBadge = $('tech-detail-category');
    const titleEl = $('tech-detail-title');
    const contentEl = $('tech-detail-content');
    if (!panel || !categoryBadge || !titleEl || !contentEl) return;

    categoryBadge.textContent = category.name;
    titleEl.textContent = techName;

    const linkedProjects = CONSTELLATION_DATA.verifiedProjects[techName] || [];
    if (linkedProjects.length > 0) {
        contentEl.innerHTML = `
            <span class="tech-detail-projects-label">Verified Showcase Projects</span>
            <div class="tech-detail-projects">
                ${linkedProjects.map(p => `
                    <button type="button" class="tech-detail-project-btn" data-project="${esc(p)}" aria-label="View project ${esc(p)}">
                        <span>${esc(p)}</span>
                        <span aria-hidden="true">↗</span>
                    </button>
                `).join('')}
            </div>
        `;

        const projectBtns = contentEl.querySelectorAll('.tech-detail-project-btn');
        projectBtns.forEach(btn => {
            btn.onclick = () => {
                const projectTitle = btn.getAttribute('data-project');
                selectRelatedProject(projectTitle);
            };
        });
    } else {
        contentEl.innerHTML = `
            <p class="tech-detail-empty-note">Core technical capability · Explored through coursework and experimentation.</p>
        `;
    }

    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');

    const statusText = $('constellation-status-text');
    if (statusText) {
        statusText.textContent = `Exploring: ${techName} (${category.name})`;
    }
}

function closeTechDetailPanel(refocus = true) {
    const panel = $('tech-detail-panel');
    if (!panel || !panel.classList.contains('open')) return;

    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');

    const previousTech = activeTechnology;
    activeTechnology = null;

    const techNodes = document.querySelectorAll('.tech-node');
    techNodes.forEach(node => node.classList.remove('active'));

    if (refocus && previousTech) {
        const nodeToFocus = Array.from(techNodes).find(n => n.getAttribute('data-tech') === previousTech);
        if (nodeToFocus) nodeToFocus.focus();
    }
}

function resetConstellation() {
    activeCategory = null;
    activeTechnology = null;
    closeTechDetailPanel(false);

    const techLayer = $('tech-nodes-layer');
    if (techLayer) {
        techLayer.innerHTML = '';
    }

    const catElements = document.querySelectorAll('.category-node');
    catElements.forEach(el => {
        el.classList.remove('active', 'subdued');
        el.setAttribute('aria-expanded', 'false');
    });

    const statusText = $('constellation-status-text');
    if (statusText) {
        statusText.textContent = 'Select a constellation to explore';
    }
    const resetBtn = $('reset-constellation');
    if (resetBtn) {
        resetBtn.style.display = 'none';
    }

    document.querySelectorAll('.grid .card').forEach(c => c.classList.remove('card-highlighted'));

    requestAnimationFrame(() => {
        drawConstellationLines();
    });
}

function selectRelatedProject(projectTitle) {
    if (!projectTitle) return;

    const cards = document.querySelectorAll('.grid .card');
    let matchedCard = null;
    let matchedProject = null;

    cards.forEach((card, idx) => {
        const title = card.querySelector('h3')?.textContent.trim();
        if (title && title.toLowerCase() === projectTitle.trim().toLowerCase()) {
            matchedCard = card;
            matchedProject = currentProjects[idx];
        }
    });

    if (matchedCard) {
        matchedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        document.querySelectorAll('.grid .card').forEach(c => c.classList.remove('card-highlighted'));
        matchedCard.classList.add('card-highlighted');

        closeTechDetailPanel(false);

        if (matchedProject) {
            setTimeout(() => {
                openProjectModal(matchedProject, 'modal');
            }, 380);
        }
    }
}

function initConstellation() {
    const stage = $('constellation-stage');
    const catLayer = $('category-nodes-layer');
    if (!stage || !catLayer) return;

    const isMobile = window.innerWidth <= 650;
    catLayer.innerHTML = CONSTELLATION_DATA.categories.map((cat) => {
        return `
            <button type="button" class="category-node" data-id="${cat.id}" tabindex="0" role="button" aria-expanded="false" aria-label="Constellation: ${cat.name}, ${cat.technologies.length} technologies">
                <span class="cat-star">✦</span>
                <span class="cat-label">${esc(cat.name)}</span>
                <span class="cat-badge">${cat.technologies.length}</span>
            </button>
        `;
    }).join('');

    const catElements = catLayer.querySelectorAll('.category-node');
    catElements.forEach((el, idx) => {
        const cat = CONSTELLATION_DATA.categories[idx];
        if (!isMobile && cat) {
            el.style.left = `${cat.x}%`;
            el.style.top = `${cat.y}%`;
        }

        el.onclick = () => selectCategory(cat.id);
        el.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectCategory(cat.id);
            }
        };
    });

    const hananNode = $('node-hanan');
    if (hananNode) {
        hananNode.onclick = () => {
            resetConstellation();
            hananNode.focus();
        };
        hananNode.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                resetConstellation();
            }
        };
    }

    const resetBtn = $('reset-constellation');
    if (resetBtn) {
        resetBtn.onclick = resetConstellation;
    }

    const detailClose = $('tech-detail-close');
    if (detailClose) {
        detailClose.onclick = () => closeTechDetailPanel(true);
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const detailPanel = $('tech-detail-panel');
            if (detailPanel && detailPanel.classList.contains('open')) {
                e.preventDefault();
                closeTechDetailPanel(true);
                return;
            }
            if (activeCategory) {
                e.preventDefault();
                const catToFocus = document.querySelector(`.category-node[data-id="${activeCategory}"]`);
                resetConstellation();
                if (catToFocus) catToFocus.focus();
            }
        }
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const mobile = window.innerWidth <= 650;
            const cats = catLayer.querySelectorAll('.category-node');
            cats.forEach((el, idx) => {
                const cat = CONSTELLATION_DATA.categories[idx];
                if (!mobile && cat) {
                    el.style.left = `${cat.x}%`;
                    el.style.top = `${cat.y}%`;
                } else {
                    el.style.left = '';
                    el.style.top = '';
                }
            });

            if (activeCategory) {
                const activeCat = CONSTELLATION_DATA.categories.find(c => c.id === activeCategory);
                const techNodes = document.querySelectorAll('.tech-node');
                techNodes.forEach((node, idx) => {
                    const techData = activeCat?.technologies[idx];
                    if (!mobile && techData) {
                        node.style.left = `${techData.x}%`;
                        node.style.top = `${techData.y}%`;
                    } else {
                        node.style.left = '';
                        node.style.top = '';
                    }
                });
            }

            drawConstellationLines();
        }, 50);
    });

    requestAnimationFrame(() => {
        drawConstellationLines();
    });
}

// ==========================================
// 3. INTERACTIVE STARFIELD
// ==========================================
function initStarfield() {
    const canvas = $('starfield');
    const hero = document.querySelector('.hero');
    if (!canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    const STAR_COUNT = 65;

    let targetOffsetX = 0;
    let targetOffsetY = 0;
    let currentOffsetX = 0;
    let currentOffsetY = 0;
    let animId = null;
    let isVisible = true;

    function resize() {
        const rect = hero.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.scale(dpr, dpr);

        if (stars.length === 0) {
            createStars();
        }
    }

    function createStars() {
        stars = [];
        const colors = ['#F3E9D8', '#FFB36B', '#F8EEDF', '#FFA64D'];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.4 + 0.6,
                baseAlpha: Math.random() * 0.5 + 0.35,
                twinkleSpeed: Math.random() * 0.03 + 0.015,
                phase: Math.random() * Math.PI * 2,
                depth: Math.random() * 0.8 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        currentOffsetX += (targetOffsetX - currentOffsetX) * 0.06;
        currentOffsetY += (targetOffsetY - currentOffsetY) * 0.06;

        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            star.phase += star.twinkleSpeed;
            const alpha = Math.max(0.15, Math.min(1, star.baseAlpha + Math.sin(star.phase) * 0.22));

            let px = star.x + currentOffsetX * star.depth;
            let py = star.y + currentOffsetY * star.depth;

            if (px < 0) px += width;
            if (px > width) px -= width;
            if (py < 0) py += height;
            if (py > height) py -= height;

            ctx.beginPath();
            ctx.arc(px, py, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = alpha;
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        if (isVisible && !prefersReducedMotion) {
            animId = requestAnimationFrame(draw);
        }
    }

    window.addEventListener('resize', () => {
        resize();
        if (prefersReducedMotion) draw();
    });

    resize();

    if (!prefersReducedMotion) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            targetOffsetX = ((e.clientX - rect.left) - cx) * 0.035;
            targetOffsetY = ((e.clientY - rect.top) - cy) * 0.035;
        }, { passive: true });

        hero.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                const rect = hero.getBoundingClientRect();
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                targetOffsetX = ((e.touches[0].clientX - rect.left) - cx) * 0.025;
                targetOffsetY = ((e.touches[0].clientY - rect.top) - cy) * 0.025;
            }
        }, { passive: true });

        hero.addEventListener('mouseleave', () => {
            targetOffsetX = 0;
            targetOffsetY = 0;
        });

        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    cancelAnimationFrame(animId);
                    animId = requestAnimationFrame(draw);
                } else {
                    cancelAnimationFrame(animId);
                }
            });
        }, { threshold: 0.05 });

        heroObserver.observe(hero);
        animId = requestAnimationFrame(draw);
    } else {
        draw();
    }
}

// ==========================================
// 4. SMART NAVIGATION (ACTIVE SCROLL SPY)
// ==========================================
function initSmartNavigation() {
    const navLinks = document.querySelectorAll('.pill a');
    if (!navLinks.length) return;

    const heroEl = $('hero');
    const skillsEl = $('skills');
    const projectsEl = $('projects');
    const footerEl = $('footer');

    function updateActiveNav() {
        const scrollY = window.scrollY;
        const winH = window.innerHeight;
        const docH = document.documentElement.scrollHeight;
        const maxScrollY = docH - winH;

        let activeId = 'hero';

        if (scrollY < 200) {
            activeId = 'hero';
        } else {
            // Check if user has actually reached the Contact / footer area:
            let isContactActive = false;
            if (footerEl) {
                const footerRect = footerEl.getBoundingClientRect();
                const atPageBottom = (scrollY >= maxScrollY - 35);

                if (projectsEl) {
                    const projectsRect = projectsEl.getBoundingClientRect();
                    // Projects section remains active while project cards occupy viewport
                    // Contact becomes active only when projects is mostly scrolled past OR at the absolute page bottom with footer in view
                    const projectsScrolledPast = projectsRect.bottom < (winH * 0.42);
                    if (projectsScrolledPast || (atPageBottom && projectsRect.bottom < winH * 0.72)) {
                        isContactActive = true;
                    }
                } else if (atPageBottom || footerRect.top < winH * 0.5) {
                    isContactActive = true;
                }
            }

            if (isContactActive) {
                activeId = 'footer';
            } else {
                // Determine active section based on user viewing focus point (~30% down from viewport top)
                const targetPoint = scrollY + Math.min(270, winH * 0.35);

                if (projectsEl && targetPoint >= projectsEl.offsetTop) {
                    activeId = 'projects';
                } else if (skillsEl && targetPoint >= skillsEl.offsetTop) {
                    activeId = 'skills';
                } else {
                    activeId = 'hero';
                }
            }
        }

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (activeId && href === `#${activeId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    window.addEventListener('resize', updateActiveNav, { passive: true });
    updateActiveNav();
}

// ==========================================
// 5. CONTACT INTERACTION (CLIPBOARD & TOAST)
// ==========================================
let toastTimer = null;
function showToast(message) {
    const toast = $('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showToast(successMsg))
            .catch(() => fallbackCopy(text, successMsg));
    } else {
        fallbackCopy(text, successMsg);
    }
}

function fallbackCopy(text, successMsg) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast(successMsg);
    } catch (err) {
        showToast('Profile URL: ' + text);
    }
    document.body.removeChild(textarea);
}

function initContactInteraction(profile) {
    const copyBtn = $('copy-github-btn');
    if (!copyBtn) return;

    const githubUrl = profile?.links?.github || 'https://github.com/Mohd-Hanan';

    copyBtn.onclick = () => {
        copyToClipboard(githubUrl, `✓ Copied GitHub profile URL: ${githubUrl}`);

        const textSpan = $('copy-btn-text');
        const iconSpan = $('copy-btn-icon');
        if (textSpan && iconSpan) {
            const origText = textSpan.textContent;
            const origIcon = iconSpan.textContent;
            textSpan.textContent = 'Copied!';
            iconSpan.textContent = '✓';
            setTimeout(() => {
                textSpan.textContent = origText;
                iconSpan.textContent = origIcon;
            }, 2000);
        }
    };
}

// ==========================================
// RENDER HELPERS
// ==========================================
function renderProjects(projects) {
    const projectsContainer = $('projects')?.querySelector('.grid');
    if (!projectsContainer || !Array.isArray(projects)) return;

    projectsContainer.innerHTML = projects
        .map((project) => {
            const projectLink = safe(project.link);
            return `
                <article class="card" tabindex="0" role="button" aria-haspopup="dialog" aria-label="View details for ${esc(project.title)}">
                    <h3>${esc(project.title)}</h3>
                    <p>${esc(project.desc)}</p>
                    ${
                        projectLink
                            ? `<a href="${esc(projectLink)}" target="_blank" rel="noopener noreferrer">View project ↗</a>`
                            : `<span class="project-note">Project details</span>`
                    }
                </article>
            `;
        })
        .join('');

    attachCardInteractivity();
}

function renderSkills() {
    // Handled by initConstellation()
}

// ==========================================
// INITIAL BOOTSTRAP & PROFILE DATA LOAD
// ==========================================
initModalEvents();
attachCardInteractivity();
initConstellation();
initStarfield();
initSmartNavigation();
initContactInteraction({ links: { github: 'https://github.com/Mohd-Hanan' } });

fetch('profile.json')
    .then((response) => {
        if (!response.ok) {
            throw new Error('Could not load profile.json');
        }
        return response.json();
    })
    .then((profile) => {
        if (profile.name) {
            document.title = `${profile.name} | Portfolio`;
        }

        if ($('tagline') && profile.tagline) $('tagline').textContent = profile.tagline;
        if ($('bio') && profile.bio) $('bio').textContent = profile.bio;
        if ($('about-bio') && profile.bio) $('about-bio').textContent = profile.bio;

        if (Array.isArray(profile.skills)) {
            renderSkills(profile.skills);
        }

        if (Array.isArray(profile.projects)) {
            currentProjects = profile.projects;
            renderProjects(profile.projects);
        }

        if ($('links') && profile.links) {
            const githubUrl = profile.links.github;
            $('links').innerHTML = `
                ${githubUrl ? `<a href="${esc(githubUrl)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : ''}
                <button type="button" class="copy-btn" id="copy-github-btn" title="Copy GitHub profile URL" aria-label="Copy GitHub profile URL to clipboard">
                    <span id="copy-btn-icon">⎘</span> <span id="copy-btn-text">Copy GitHub URL</span>
                </button>
            `;
            initContactInteraction(profile);
        }

        if ($('footer-name') && profile.name) {
            $('footer-name').textContent = `© ${new Date().getFullYear()} ${profile.name}`;
        }
    })
    .catch((error) => {
        console.error('Portfolio loading error:', error);
    });
