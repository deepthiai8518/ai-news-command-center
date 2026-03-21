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
                {id: 1, title: 'AI Ecosystem', valLabel: 'Active Signals', targetAgentId: 1, tags: ['High Impact', 'Generative'], insight: 'Compute-heavy architectural limits are shifting rapidly.', action: 'Review compute dependency across technical roadmap.', icon: 'fa-microchip', colorClass: 'agent-1-gradient', targetNav: 'agent-1'},
                {id: 2, title: 'Product Shifts', valLabel: 'Strategic Playbooks', targetAgentId: 2, tags: ['GTM', 'Evaluation'], insight: 'Pricing standards are moving toward value & usage constraints.', action: 'Model current margins against Anthropic/MiniMax API drops.', icon: 'fa-layer-group', colorClass: 'agent-2-gradient', targetNav: 'agent-2'},
                {id: 3, title: 'Fintech Market', valLabel: 'Regulatory Drafts', targetAgentId: 3, tags: ['Compliance', 'Liability'], insight: 'Singapore draft places strict liability on AI publishers directly.', action: 'Halt autonomous agent deployment until guardrails verified.', icon: 'fa-building-columns', colorClass: 'agent-3-gradient', targetNav: 'agent-3'}
            ]
        },
        'agent-1': {
            pageTitle: 'Intelligence: AI Updates',
            sectionTitle: 'Latest Technical Signals',
            pills: ['All', 'Models', 'Tools', 'Research', 'Regulation'],
            kpis: [
                {id: 1, title: 'Global AI Signals', valLabel: 'Total Signals', tags: ['High Impact', 'Generative'], insight: 'Grok & Apple push native multi-agent architectures.', action: 'Evaluate eliminating single-model bottlenecks.', icon: 'fa-microchip', colorClass: 'agent-1-gradient', targetPill: 'All'},
                {id: 2, title: 'Tool/Frameworks', valLabel: 'Infrastructure Drops', tags: ['Open Source', 'Deploy'], insight: 'Meta integrates Manus orchestration into enterprise tooling.', action: 'Test Manus workflows for internal operator pipelines.', icon: 'fa-wrench', colorClass: 'agent-1-gradient', targetPill: 'Tools'},
                {id: 3, title: 'Research Vectors', valLabel: 'Research Papers', tags: ['Pricing', 'Limits'], insight: 'Effort Controls prove critical to compute-heavy UX.', action: 'Design slider UIs to let users dictate response intelligence.', icon: 'fa-book', colorClass: 'agent-1-gradient', targetPill: 'Research'}
            ]
        },
        'agent-2': {
            pageTitle: 'Intelligence: Product Mgmt',
            sectionTitle: 'Latest Product Signals',
            pills: ['All', 'Pricing', 'Evaluation', 'GTM', 'Adoption', 'Workflow Design'],
            kpis: [
                {id: 1, title: 'Strategy Signals', valLabel: 'Elite Match Signals', tags: ['Moats', 'Strategy'], insight: 'Product Sense defined as last un-automatable PM skill.', action: 'Filter PM hiring rubrics primarily for ambiguity handling.', icon: 'fa-lightbulb', colorClass: 'agent-2-gradient', targetPill: 'GTM'},
                {id: 2, title: 'Workflow Design', valLabel: 'Operational Updates', tags: ['Operations', 'Speed'], insight: 'Startups requiring AI initial drafts immediately.', action: 'Mandate LLM-drafts for all PRDs starting Monday.', icon: 'fa-layer-group', colorClass: 'agent-2-gradient', targetPill: 'Workflow Design'},
                {id: 3, title: 'Team Structure', valLabel: 'Evaluation Frameworks', tags: ['Agile', 'Org Design'], insight: 'Delivery-only agile ticket writers face absolute automation.', action: 'Pivot existing POs into product discovery workflows immediately.', icon: 'fa-chess-knight', colorClass: 'agent-2-gradient', targetPill: 'Evaluation'}
            ]
        },
        'agent-3': {
            pageTitle: 'Intelligence: Fintech',
            sectionTitle: 'Latest Market & Regulatory Signals',
            pills: ['All', 'Regulatory', 'Fraud', 'Payments', 'Banking', 'Compliance'],
            kpis: [
                {id: 1, title: 'Regulatory Scrutiny', valLabel: 'Compliance Alerts', tags: ['Critical', 'Asia'], insight: 'First explicit legal framework targeting publisher liability.', action: 'Embed deterministic kill-switches in sweep networks.', icon: 'fa-gavel', colorClass: 'agent-3-gradient', targetPill: 'Regulatory'},
                {id: 2, title: 'Consumer Banking', valLabel: 'Banking Shifts', tags: ['Yield', 'Autonomy'], insight: 'Unverified auto-sweeping across EU money markets live.', action: 'Assess technical feasibility of matching Revolut APYs.', icon: 'fa-money-bill-trend-up', colorClass: 'agent-3-gradient', targetPill: 'Banking'},
                {id: 3, title: 'Risk Parameters', valLabel: 'Fraud Vectors', tags: ['Stable'], insight: 'Fraud attack vectors remain consistent with prior quarter.', action: 'Maintain current identity verification protocols.', icon: 'fa-shield-halved', colorClass: 'agent-3-gradient', targetPill: 'Fraud'}
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
                
                // Sync KPI Card visually when pill is clicked
                document.querySelectorAll('.kpi-card').forEach(el => el.classList.remove('active-kpi'));
                config.kpis.forEach((kpi, kpiIdx) => {
                    if (kpi.targetPill === p) {
                        document.getElementById(`kpi-card-${kpiIdx + 1}`).classList.add('active-kpi');
                    }
                });
                
                // Text filtering logic based on pill name
                applyFeedFilter(configKey, p);
            });
            filtersContainer.appendChild(span);
        });

        // Update Deep KPI Intelligence Cards
        config.kpis.forEach((kpi, idx) => {
            const index = idx + 1;
            const cardEl = document.getElementById(`kpi-card-${index}`);
            
            // Auto-highlight if this KPI corresponds to the default pill
            const extraClass = (kpi.targetPill === config.pills[0]) ? 'active-kpi' : '';
            
            cardEl.className = `kpi-card glass ${kpi.colorClass} ${extraClass}`;
            cardEl.setAttribute('title', `View intelligence signals filtered by ${kpi.title}`);
            document.getElementById(`kpi-icon-${index}`).innerHTML = `<i class="fa-solid ${kpi.icon}"></i>`;
            document.getElementById(`kpi-${index}-title`).textContent = kpi.title;
            
            // ----------------------------------------------------
            // DYNAMIC DATA INTEGRITY: Calculate exact dataset volume
            // ----------------------------------------------------
            let count = 0;
            if (LIVE_DATA && LIVE_DATA.length > 0) {
                if (kpi.targetNav) { // Global dashboard KPI
                    count = LIVE_DATA.filter(i => i.agentId === kpi.targetAgentId).length;
                } else if (kpi.targetPill === 'All') { // Agent overview KPI
                    const agentMap = { 'agent-1': 1, 'agent-2': 2, 'agent-3': 3 };
                    count = LIVE_DATA.filter(item => item.agentId === agentMap[configKey]).length;
                } else if (kpi.targetPill) { // Agent drill-down KPI
                    const agentMap = { 'agent-1': 1, 'agent-2': 2, 'agent-3': 3 };
                    const lowerPill = kpi.targetPill.toLowerCase();
                    count = LIVE_DATA.filter(item => {
                        if (item.agentId !== agentMap[configKey]) return false;
                        const haystack = [item.title, item.summary, item.primaryTag, item.secondaryTags, item.agent, item.source].join(' ').toLowerCase();
                        return haystack.includes(lowerPill);
                    }).length;
                }
            }
            
            if (count > 0) {
                document.getElementById(`kpi-${index}-val`).textContent = `${count} ${kpi.valLabel}`;
                document.getElementById(`kpi-${index}-insight`).textContent = kpi.insight;
                document.getElementById(`kpi-${index}-action`).textContent = kpi.action;
                
                const tagsContainer = document.getElementById(`kpi-${index}-tags`);
                tagsContainer.innerHTML = '';
                kpi.tags.forEach(t => {
                    tagsContainer.innerHTML += `<span class="micro-tag">${t}</span>`;
                });
                cardEl.classList.remove('kpi-empty-state');
            } else {
                document.getElementById(`kpi-${index}-val`).textContent = `No ${kpi.valLabel}`;
                document.getElementById(`kpi-${index}-insight`).textContent = "Signal flow idle. Ecosystem remains totally stable.";
                document.getElementById(`kpi-${index}-action`).textContent = "Safely maintain current operational roadmap.";
                document.getElementById(`kpi-${index}-tags`).innerHTML = `<span class="micro-tag stable-tag">Stable Baseline</span>`;
                cardEl.classList.add('kpi-empty-state');
            }
            
            // Add bulletproof click interaction router
            cardEl.onclick = (e) => {
                e.preventDefault(); // Stop any bubbling interference
                
                // If it's a global KPI navigating downward to an agent module
                if(kpi.targetNav) {
                    const navItem = document.querySelector(`.nav-item[data-target="${kpi.targetNav}"]`);
                    if(navItem) navItem.click();
                } 
                // If it's an agent KPI triggering a pill filter within its own module
                else if (kpi.targetPill) {
                    const pillEls = document.querySelectorAll('.pill');
                    pillEls.forEach(p => {
                        if(p.textContent.trim() === kpi.targetPill.trim()) {
                            p.click(); // Dispatches the built-in click event to filter automatically
                        }
                    });
                }
                
                // Scroll down gracefully to focus on results
                setTimeout(() => {
                    document.getElementById('section-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            };
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
                // Deep Keyword Match across all available data columns
                filteredData = filteredData.filter(i => {
                    const haystack = [i.title, i.summary, i.primaryTag, i.secondaryTags, i.agent, i.source].join(' ').toLowerCase();
                    return haystack.includes(lowerPill);
                });
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
