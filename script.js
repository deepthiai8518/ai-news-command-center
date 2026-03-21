/**
 * Antigravity Dashboard - Agentic Intelligence Update
 */

document.addEventListener('DOMContentLoaded', () => {
    const feedGrid = document.getElementById('article-feed');
    const syncBtn = document.getElementById('sync-btn');
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('page-title');
    const sectionTitle = document.getElementById('section-title');
    const filtersContainer = document.getElementById('dynamic-filters');

    const API_URL = 'https://script.google.com/macros/s/AKfycbyNE8whuAXINVGGAfnuzkBpn9Ixxvz-Ftxdkh-OBV_-IemB8vGDILUixhV8hm7F2BWG/exec';
    let LIVE_DATA = [];

    // Agent UI Configuration definitions
    const AGENT_CONFIG = {
        'all': {
            pageTitle: 'Command Center',
            sectionTitle: 'Global Intelligence Feed',
            pills: ['All', 'High Impact', 'Regulatory'],
            kpis: [
                {id: 1, title: 'AI Updates', val: '-', label: 'New Signals (24h)', icon: 'fa-microchip', colorClass: 'agent-1-gradient'},
                {id: 2, title: 'Product Mgmt', val: '-', label: 'New Frameworks', icon: 'fa-layer-group', colorClass: 'agent-2-gradient'},
                {id: 3, title: 'Fintech & Reg', val: '-', label: 'Critical Alerts', icon: 'fa-building-columns', colorClass: 'agent-3-gradient'}
            ]
        },
        'agent-1': {
            pageTitle: 'Intelligence: AI Updates',
            sectionTitle: 'Latest Technical Signals',
            pills: ['All', 'Models', 'Tools', 'Research', 'Regulation'],
            kpis: [
                {id: 1, title: 'AI Updates', val: '-', label: 'New Signals (24h)', icon: 'fa-microchip', colorClass: 'agent-1-gradient'},
                {id: 2, title: 'Tool Releases', val: '-', label: 'Frameworks', icon: 'fa-wrench', colorClass: 'agent-1-gradient'},
                {id: 3, title: 'Research', val: '-', label: 'Paper Alerts', icon: 'fa-book', colorClass: 'agent-1-gradient'}
            ]
        },
        'agent-2': {
            pageTitle: 'Intelligence: Product Mgmt',
            sectionTitle: 'Latest Product Signals',
            pills: ['All', 'Pricing', 'Evaluation', 'GTM', 'Adoption', 'Workflow Design'],
            kpis: [
                {id: 1, title: 'Product Insights', val: '-', label: 'User Behavior', icon: 'fa-lightbulb', colorClass: 'agent-2-gradient'},
                {id: 2, title: 'New Frameworks', val: '-', label: 'Operating Models', icon: 'fa-layer-group', colorClass: 'agent-2-gradient'},
                {id: 3, title: 'Strategy Signals', val: '-', label: 'Pricing / GTM', icon: 'fa-chess-knight', colorClass: 'agent-2-gradient'}
            ]
        },
        'agent-3': {
            pageTitle: 'Intelligence: Fintech',
            sectionTitle: 'Latest Market & Regulatory Signals',
            pills: ['All', 'Regulatory', 'Fraud', 'Payments', 'Banking', 'Compliance'],
            kpis: [
                {id: 1, title: 'Regulatory Alerts', val: '-', label: 'MAS / FCA Updates', icon: 'fa-gavel', colorClass: 'agent-3-gradient'},
                {id: 2, title: 'Market Moves', val: '-', label: 'Competitor Intel', icon: 'fa-money-bill-trend-up', colorClass: 'agent-3-gradient'},
                {id: 3, title: 'Risk Signals', val: '-', label: 'Fraud / Compliance', icon: 'fa-shield-halved', colorClass: 'agent-3-gradient'}
            ]
        }
    };

    /** AI Simulation: Determines impact score based on text analysis */
    function scoreImpact(title, summary) {
        const text = (title + " " + summary).toLowerCase();
        if (text.match(/launch|release|regulation|draft|acquire|framework|liability/)) return "High";
        if (text.match(/update|feature|introduce|shift/)) return "Medium";
        return "Low";
    }

    /** AI Simulation: Determines agentic analysis based on payload text and agent rules */
    function generateAgentInsights(agentId, summary) {
        let insights = {};
        if (agentId === 1) { // AI Updates
            insights.f1_title = "Technical Significance";
            insights.f1_val = summary.includes("model") ? "Introduces new benchmark capabilities in reasoning pipelines." : "Provides foundational architecture optimizations.";
            insights.f2_title = "Ecosystem Impact";
            insights.f2_val = "Accelerates the shift toward localized, multi-agent frameworks across the industry.";
        } else if (agentId === 2) { // AI PM
            insights.f1_title = "Product Implication";
            insights.f1_val = summary.includes("pricing") ? "Forces a re-evaluation of flat-tier SaaS models in favor of value-based billing." : "Signals a transition from UI-heavy apps to workflow-native AI orchestration.";
            insights.f2_title = "Suggested Action";
            insights.f2_val = "Assess current roadmap to ensure multi-agent discovery features are prioritized over standard delivery tasks.";
        } else { // AI Fintech
            insights.f1_title = "Risk / Opportunity";
            insights.f1_val = "High potential for structural compliance failure if automated workflows bypass human-in-the-loop verifications.";
            insights.f2_title = "Watchpoint";
            insights.f2_val = "Monitor upcoming regulatory body guidance specifically targeting autonomous sweep networks and wealth management APIs.";
        }
        return insights;
    }

    function updateUIConfig(configKey) {
        const config = AGENT_CONFIG[configKey];
        pageTitle.textContent = config.pageTitle;
        sectionTitle.textContent = config.sectionTitle;
        
        // Update Pills
        filtersContainer.innerHTML = '';
        config.pills.forEach((p, idx) => {
            const span = document.createElement('span');
            span.className = `pill ${idx === 0 ? 'active' : ''}`;
            span.textContent = p;
            span.addEventListener('click', () => {
                document.querySelectorAll('.pill').forEach(el => el.classList.remove('active'));
                span.classList.add('active');
                
                // Text filtering logic based on pill name
                applyFeedFilter(configKey, p);
            });
            filtersContainer.appendChild(span);
        });

        // Update KPIs
        config.kpis.forEach((kpi, idx) => {
            const index = idx + 1;
            document.getElementById(`kpi-card-${index}`).className = `kpi-card glass ${kpi.colorClass}`;
            document.getElementById(`kpi-icon-${index}`).innerHTML = `<i class="fa-solid ${kpi.icon}"></i>`;
            document.getElementById(`kpi-${index}-title`).textContent = kpi.title;
            // Generate dummy KPI values for demo, but realistically calculated
            const val = Math.floor(Math.random() * 20) + 1;
            document.getElementById(`kpi-${index}-val`).textContent = val;
            document.getElementById(`kpi-${index}-label`).textContent = kpi.label;
        });
    }

    async function fetchIntel() {
        try {
            const response = await fetch(API_URL);
            LIVE_DATA = await response.json();
            
            // Enrich data with simulated Agentic Intelligence
            LIVE_DATA.forEach(article => {
                article.impactScore = scoreImpact(article.title, article.summary);
                article.insights = generateAgentInsights(article.agentId, article.summary);
            });

            // Priority System Sorting: Impact -> Date
            const impactWeight = { "High": 3, "Medium": 2, "Low": 1 };
            LIVE_DATA.sort((a, b) => {
                if (impactWeight[b.impactScore] !== impactWeight[a.impactScore]) {
                    return impactWeight[b.impactScore] - impactWeight[a.impactScore];
                }
                return new Date(b.date || 0) - new Date(a.date || 0);
            });
            
        } catch (error) {
            console.error('Error fetching data:', error);
            feedGrid.innerHTML = `<div class="loading-state"><p>Error connecting to Database: ${error.message}</p></div>`;
        }
    }

    function applyFeedFilter(navTarget, pillText) {
        let filteredData = LIVE_DATA || [];
        
        // Target Agent
        if(navTarget !== 'all') {
            const agentMap = { 'agent-1': 1, 'agent-2': 2, 'agent-3': 3 };
            filteredData = filteredData.filter(item => item.agentId === agentMap[navTarget]);
        }

        // Target Pill
        if(pillText !== 'All') {
            const lowerPill = pillText.toLowerCase();
            if (lowerPill === 'high impact') filteredData = filteredData.filter(i => i.impactScore === 'High');
            else if (lowerPill === 'trending') {} // noop
            else {
                // Keyword match roughly
                filteredData = filteredData.filter(i => (i.title + i.summary).toLowerCase().includes(lowerPill));
            }
        }

        renderArticles(filteredData);
    }

    function renderArticles(data) {
        feedGrid.innerHTML = '';
        
        if(!data || data.length === 0) {
            feedGrid.innerHTML = `
                <div class="loading-state">
                    <p style="font-size: 3rem; margin-bottom: 1rem;"><i class="fa-solid fa-box-open"></i></p>
                    <p>No actionable intelligence fetched for this filter.</p>
                </div>`;
            return;
        }

        data.forEach(article => {
            const el = document.createElement('article');
            el.className = 'feed-item glass';
            const linkHref = article.url || '#';
            
            el.innerHTML = `
                <div class="feed-meta">
                    <span class="agent-badge badge-${article.agentId || 1}">
                        <i class="fa-solid ${getIcon(article.agentId || 1)}"></i> ${article.agent || 'AI Update'}
                    </span>
                    <div class="meta-right">
                        <span class="impact-badge impact-${article.impactScore}">${article.impactScore} Impact</span>
                        <span class="feed-date">${article.date || ''}</span>
                    </div>
                </div>
                
                <h3 class="feed-title">${article.title || 'Untitled Article'}</h3>
                <p class="feed-summary">${article.summary || ''}</p>
                
                <!-- AI Agentic Decision Framework Payload -->
                <div class="agentic-insights insight-${article.agentId || 1}">
                    <div class="insight-block">
                        <span class="insight-title">${article.insights.f1_title}</span>
                        <span class="insight-text">${article.insights.f1_val}</span>
                    </div>
                    <div class="insight-block">
                        <span class="insight-title">${article.insights.f2_title}</span>
                        <span class="insight-text">${article.insights.f2_val}</span>
                    </div>
                </div>

                <div class="feed-footer">
                    <span class="source-tag"><i class="fa-solid fa-newspaper"></i> ${article.source || 'Intel Source'}</span>
                    <div class="action-btn-group">
                        <button class="action-btn" title="Track Module"><i class="fa-solid fa-eye"></i></button>
                        <button class="action-btn" title="Save intel"><i class="fa-solid fa-bookmark"></i></button>
                        <a href="${linkHref}" target="_blank" class="read-btn">Deep Dive <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </div>
            `;
            feedGrid.appendChild(el);
        });
    }

    function getIcon(id) {
        if(id === 1) return 'fa-robot';
        if(id === 2) return 'fa-box-open';
        if(id === 3) return 'fa-coins';
        return 'fa-circle-info';
    }

    async function init() {
        feedGrid.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Initializing Agents and connecting to Database...</p>
            </div>
        `;
        updateUIConfig('all');
        await fetchIntel();
        applyFeedFilter('all', 'All');
    }
    
    init();

    // Sync button
    syncBtn.addEventListener('click', async () => {
        const icon = syncBtn.querySelector('i');
        icon.classList.add('fa-spin');
        feedGrid.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Pulling live sync from Sheets...</p>
            </div>
        `;
        await fetchIntel();
        icon.classList.remove('fa-spin');
        
        // Reset nav to global
        navItems.forEach(n => n.classList.remove('active'));
        navItems[0].classList.add('active');
        updateUIConfig('all');
        applyFeedFilter('all', 'All');
    });

    // Sidebar Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            const target = item.getAttribute('data-target');
            updateUIConfig(target);
            applyFeedFilter(target, 'All');
        });
    });
});
