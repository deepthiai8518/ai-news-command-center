/**
 * Antigravity Dashboard - Agentic Intelligence
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

    const AGENT_CONFIG = {
        'all': {
            pageTitle: 'Command Center',
            sectionTitle: 'Global Intelligence Feed',
            pills: ['All', 'High Impact', 'Recent (48h)', 'Watchlist (Escalated)', 'Regulatory'],
            kpis: [
                { id: 1, title: 'AI Ecosystem', valLabel: 'Active Signals', targetAgentId: 1, tags: ['High Impact', 'Generative'], insight: 'Compute-heavy architectural limits are shifting rapidly.', action: 'Review compute dependency across technical roadmap.', icon: 'fa-microchip', colorClass: 'agent-1-gradient', targetNav: 'agent-1' },
                { id: 2, title: 'Product Shifts', valLabel: 'Strategic Playbooks', targetAgentId: 2, tags: ['GTM', 'Evaluation'], insight: 'Pricing standards are moving toward value & usage constraints.', action: 'Model current margins against Anthropic/MiniMax API drops.', icon: 'fa-layer-group', colorClass: 'agent-2-gradient', targetNav: 'agent-2' },
                { id: 3, title: 'Fintech Market', valLabel: 'Regulatory Drafts', targetAgentId: 3, tags: ['Compliance', 'Liability'], insight: 'Singapore draft places strict liability on AI publishers directly.', action: 'Halt autonomous agent deployment until guardrails verified.', icon: 'fa-building-columns', colorClass: 'agent-3-gradient', targetNav: 'agent-3' }
            ]
        },
        'agent-1': {
            pageTitle: 'Intelligence: AI Updates',
            sectionTitle: 'Latest Technical Signals',
            pills: ['All', 'High Impact', 'Recent (48h)', 'Watchlist (Escalated)', 'Regulatory'],
            kpis: [
                { id: 1, title: 'Global AI Signals', valLabel: 'Total Signals', tags: ['High Impact', 'Generative'], insight: 'Grok & Apple push native multi-agent architectures.', action: 'Evaluate eliminating single-model bottlenecks.', icon: 'fa-microchip', colorClass: 'agent-1-gradient', targetPill: 'All' },
                { id: 2, title: 'Tool/Frameworks', valLabel: 'Infrastructure Drops', tags: ['Open Source', 'Deploy'], insight: 'Meta integrates Manus orchestration into enterprise tooling.', action: 'Test Manus workflows for internal operator pipelines.', icon: 'fa-wrench', colorClass: 'agent-1-gradient', targetPill: 'Tools' },
                { id: 3, title: 'Research Vectors', valLabel: 'Research Papers', tags: ['Pricing', 'Limits'], insight: 'Effort Controls prove critical to compute-heavy UX.', action: 'Design slider UIs to let users dictate response intelligence.', icon: 'fa-book', colorClass: 'agent-1-gradient', targetPill: 'Research' }
            ]
        },
        'agent-2': {
            pageTitle: 'Intelligence: Product Mgmt',
            sectionTitle: 'Latest Product Signals',
            pills: ['All', 'High Impact', 'Recent (48h)', 'Watchlist (Escalated)', 'Regulatory'],
            kpis: [
                { id: 1, title: 'Strategy Signals', valLabel: 'Elite Match Signals', tags: ['Moats', 'Strategy'], insight: 'Product Sense defined as last un-automatable PM skill.', action: 'Filter PM hiring rubrics primarily for ambiguity handling.', icon: 'fa-lightbulb', colorClass: 'agent-2-gradient', targetPill: 'All' },
                { id: 2, title: 'Workflow Design', valLabel: 'Operational Updates', tags: ['Operations', 'Speed'], insight: 'Startups requiring AI initial drafts immediately.', action: 'Mandate LLM-drafts for all PRDs starting Monday.', icon: 'fa-layer-group', colorClass: 'agent-2-gradient', targetPill: 'Workflow Design' },
                { id: 3, title: 'Team Structure', valLabel: 'Evaluation Frameworks', tags: ['Agile', 'Org Design'], insight: 'Delivery-only agile ticket writers face absolute automation.', action: 'Pivot existing POs into product discovery workflows immediately.', icon: 'fa-chess-knight', colorClass: 'agent-2-gradient', targetPill: 'Evaluation' }
            ]
        },
        'agent-3': {
            pageTitle: 'Intelligence: Fintech',
            sectionTitle: 'Latest Market & Regulatory Signals',
            ppills: ['All', 'High Impact', 'Recent (48h)', 'Watchlist (Escalated)', 'Regulatory'],
            kpis: [
                { id: 1, title: 'Regulatory Scrutiny', valLabel: 'Compliance Alerts', tags: ['Critical', 'Asia'], insight: 'First explicit legal framework targeting publisher liability.', action: 'Embed deterministic kill-switches in sweep networks.', icon: 'fa-gavel', colorClass: 'agent-3-gradient', targetPill: 'All' },
                { id: 2, title: 'Consumer Banking', valLabel: 'Banking Shifts', tags: ['Yield', 'Autonomy'], insight: 'Unverified auto-sweeping across EU money markets live.', action: 'Assess technical feasibility of matching Revolut APYs.', icon: 'fa-money-bill-trend-up', colorClass: 'agent-3-gradient', targetPill: 'Banking' },
                { id: 3, title: 'Risk Parameters', valLabel: 'Fraud Vectors', tags: ['Stable'], insight: 'Fraud attack vectors remain consistent with prior quarter.', action: 'Maintain current identity verification protocols.', icon: 'fa-shield-halved', colorClass: 'agent-3-gradient', targetPill: 'Fraud' }
            ]
        },
        'weekly': {
            pageTitle: 'Weekly Executive Summaries',
            sectionTitle: 'Synthesized Intelligence (Past 7 Days)',
            pills: ['All', 'High Impact', 'Strategy', 'Risk', 'Technology'],
            kpis: [
                { id: 1, title: 'Total Volume', valLabel: 'Total Signals', tags: ['Global'], insight: 'Aggregating global data flow across all active intelligence parameters.', action: 'Review high-impact anomalies below.', icon: 'fa-chart-line', colorClass: 'agent-1-gradient', targetPill: 'All' },
                { id: 2, title: 'Critical Risk', valLabel: 'High Impact Moves', tags: ['Priority'], insight: 'Market-moving shifts detected this week across domains.', action: 'Distribute to executive leadership for strategic alignment.', icon: 'fa-triangle-exclamation', colorClass: 'agent-3-gradient', targetPill: 'High Impact' },
                { id: 3, title: 'Strategic Shifts', valLabel: 'New Frameworks', tags: ['Operations'], insight: 'New operating models emerging across competitors and tools.', action: 'Audit internal processes against new benchmarks.', icon: 'fa-chess', colorClass: 'agent-2-gradient', targetPill: 'Strategy' }
            ]
        }
    };

    // ─────────────────────────────────────────────────────────────
    // IMPACT SCORING
    // Skips "Pending GenAI Summary" so only the title is scored
    // until real summaries are available.
    // ─────────────────────────────────────────────────────────────
    function scoreImpact(title, summary) {
        const cleanSummary = (summary === 'Pending GenAI Summary' ? '' : summary);
        const text = (title + ' ' + cleanSummary).toLowerCase();

        if (text.match(/launch|release|regulation|draft|acqui|framework|liability|breach|ban|mandate|shutdown|merger|partnership|raises|billion|critical|shatters|reborn|pioneers|end of|open.source|benchmark|outperform|surpass|layoff|restructur|reorg|commoditiz|displac|fraud|sanction|cbdc|stablecoin|kyc|aml|exploit|hack|gpt-\d|llama \d|claude \d|gemini \d/)) return 'High';

        if (text.match(/update|feature|introduc|shift|build|expands|integrates|improves|optimizes|announces|explores|tests|soft.launch|beta|automat|fine.tun|moat|discovery|retention|new model|mini|nano|rebrand|pivot/)) return 'Medium';

        return 'Low';
    }

    // ─────────────────────────────────────────────────────────────
    // IMPACT SCORING
    // Uses real OpenAI impact score from sheet if available,
    // otherwise falls back to keyword matching on title.
    // ─────────────────────────────────────────────────────────────
    function scoreImpact(title, summary, sheetImpact) {
        // If OpenAI already scored it in the sheet, trust that
        if (sheetImpact && ['High', 'Medium', 'Low'].includes(sheetImpact)) {
            return sheetImpact;
        }

        // Fallback: keyword match on title only
        const text = title.toLowerCase();
        if (text.match(/acquires|acquired|raises \$|drafts liability|strict liability|bans|mandated|fined \$|shuts down|gpt-\d|llama \d|claude \d|gemini \d|data breach|breached|exploited|hacked|sanctions/)) return 'High';
        if (text.match(/launches|releases|introduces|regulation|framework|draft|mandate|benchmark|layoff|restructur|fraud|beta|automat|retention|planning|warns/)) return 'Medium';
        return 'Low';
    }

    // ─────────────────────────────────────────────────────────────
    // AGENT INSIGHTS GENERATOR
    // Uses real OpenAI-generated insights from sheet if available.
    // Falls back to keyword templates for unparsed articles.
    // ─────────────────────────────────────────────────────────────
    function generateAgentInsights(agentId, title, summary, secondaryTags) {
        // Try to parse real OpenAI insights stored as JSON in secondary_tags
        if (secondaryTags && secondaryTags.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(secondaryTags);
                if (parsed.insight1Title && parsed.insight1Text) {
                    return {
                        f1_title: parsed.insight1Title,
                        f1_val:   parsed.insight1Text,
                        f2_title: parsed.insight2Title || 'Watchpoint',
                        f2_val:   parsed.insight2Text  || 'Monitor for further developments.'
                    };
                }
            } catch (e) {
                // Not valid JSON — fall through to keyword templates
            }
        }

        // ── FALLBACK KEYWORD TEMPLATES ────────────────────────────
        const text = (title + ' ' + summary).toLowerCase();
        let insights = {};

        if (agentId === 1) { // AI Updates
            insights.f1_title = 'Technical Significance';
            if (text.match(/model|gpt|claude|gemini|llama|grok|benchmark/)) {
                insights.f1_val = 'Introduces new benchmark capabilities — evaluate integration into current reasoning pipelines.';
            } else if (text.match(/tool|framework|sdk|api|infrastructure|open.source/)) {
                insights.f1_val = 'New tooling drop — assess fit for internal operator and agent workflows.';
            } else if (text.match(/regulation|law|draft|liability|ban|mandate/)) {
                insights.f1_val = 'Regulatory signal — review compliance exposure across active deployments.';
            } else {
                insights.f1_val = 'Provides foundational architecture optimizations worth tracking.';
            }
            insights.f2_title = 'Ecosystem Impact';
            insights.f2_val = text.match(/acqui|merger|partner/)
                ? 'Consolidation signal — monitor for downstream API pricing and availability changes.'
                : 'Accelerates the shift toward localized, multi-agent frameworks across the industry.';

        } else if (agentId === 2) { // AI PM
            insights.f1_title = 'Product Implication';
            if (text.match(/pricing|cost|monetiz|billing|saas/)) {
                insights.f1_val = 'Forces a re-evaluation of flat-tier SaaS models in favor of value-based billing.';
            } else if (text.match(/workflow|draft|automat|productivity|operator/)) {
                insights.f1_val = 'Signals a shift toward workflow-native AI — teams not adopting this face velocity gaps.';
            } else if (text.match(/product owner|pm role|agile|discovery|roadmap/)) {
                insights.f1_val = 'Direct signal for PM role evolution — prioritize discovery skills over delivery execution.';
            } else {
                insights.f1_val = 'Signals a transition from UI-heavy apps to workflow-native AI orchestration.';
            }
            insights.f2_title = 'Suggested Action';
            insights.f2_val = text.match(/acqui|merger/)
                ? 'Assess vendor lock-in risk — evaluate alternative providers before pricing shifts materialize.'
                : 'Assess current roadmap to ensure multi-agent discovery features are prioritized over standard delivery tasks.';

        } else { // AI Fintech (agentId === 3)
            insights.f1_title = 'Risk / Opportunity';
            if (text.match(/regulation|liability|draft|mas|fca|ban|mandate|compliance/)) {
                insights.f1_val = 'Direct regulatory exposure — legal review of autonomous agent workflows required immediately.';
            } else if (text.match(/sweep|yield|banking|wallet|payment/)) {
                insights.f1_val = 'Consumer banking shift in motion — first-mover advantage window is open for 60–90 days.';
            } else if (text.match(/fraud|breach|exploit|hack|sanction/)) {
                insights.f1_val = 'Active threat vector — audit current identity verification and transaction monitoring pipelines.';
            } else {
                insights.f1_val = 'High potential for structural compliance failure if automated workflows bypass human-in-the-loop verifications.';
            }
            insights.f2_title = 'Watchpoint';
            if (text.match(/singapore|mas|asia|apac/)) {
                insights.f2_val = 'APAC regulatory posture is shifting fastest — monitor MAS guidance cadence as a leading indicator.';
            } else {
                insights.f2_val = 'Monitor upcoming regulatory body guidance specifically targeting autonomous sweep networks and wealth management APIs.';
            }
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

                document.querySelectorAll('.kpi-card').forEach(el => el.classList.remove('active-kpi'));
                config.kpis.forEach((kpi, kpiIdx) => {
                    if (kpi.targetPill === p) {
                        document.getElementById(`kpi-card-${kpiIdx + 1}`).classList.add('active-kpi');
                    }
                });

                applyFeedFilter(configKey, p);
            });
            filtersContainer.appendChild(span);
        });

        // Update KPI Cards
        config.kpis.forEach((kpi, idx) => {
            const index = idx + 1;
            const cardEl = document.getElementById(`kpi-card-${index}`);
            const extraClass = (kpi.targetPill === config.pills[0]) ? 'active-kpi' : '';

            cardEl.className = `kpi-card glass ${kpi.colorClass} ${extraClass}`;
            cardEl.setAttribute('title', `View intelligence signals filtered by ${kpi.title}`);
            document.getElementById(`kpi-icon-${index}`).innerHTML = `<i class="fa-solid ${kpi.icon}"></i>`;
            document.getElementById(`kpi-${index}-title`).textContent = kpi.title;

            // ─────────────────────────────────────────────────────
            // KPI COUNT LOGIC
            // targetNav  → global dashboard, counts by agentId
            // targetPill 'All' → count all articles for this agent
            // targetPill other → keyword match within agent's data
            // ─────────────────────────────────────────────────────
            let count = 0;
            if (LIVE_DATA && LIVE_DATA.length > 0) {
                const agentMap = { 'agent-1': 1, 'agent-2': 2, 'agent-3': 3 };

                if (kpi.targetNav) {
                    // Global dashboard card — count all articles for target agent
                    count = LIVE_DATA.filter(i => i.agentId === kpi.targetAgentId).length;

                } else if (kpi.targetPill === 'All') {
                    // Agent overview card — total count for this agent
                    if (configKey === 'all' || configKey === 'weekly') {
                        count = LIVE_DATA.length;
                    } else {
                        count = LIVE_DATA.filter(item => item.agentId === agentMap[configKey]).length;
                    }

                } else if (kpi.targetPill) {
                    // Drill-down card — keyword match within agent's articles
                    const lowerPill = kpi.targetPill.toLowerCase();
                    if (lowerPill === 'high impact') {
                        count = LIVE_DATA.filter(i => i.impactScore === 'High').length;
                    } else if (lowerPill === 'strategy') {
                        count = LIVE_DATA.filter(i => {
                            const haystack = [i.title, i.summary, i.primary_tag, i.secondary_tags].join(' ').toLowerCase();
                            return haystack.match(/strateg|framework|moat|competitor|business|revenue|operat|model/);
                        }).length;
                    } else {
                        count = LIVE_DATA.filter(item => {
                            if (configKey !== 'all' && configKey !== 'weekly' && item.agentId !== agentMap[configKey]) return false;
                            const haystack = [
                                item.title, item.summary, item.primary_tag,
                                item.secondary_tags, item.agent, item.source
                            ].join(' ').toLowerCase();
                            return haystack.includes(lowerPill);
                        }).length;
                    }
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
                document.getElementById(`kpi-${index}-insight`).textContent = 'Signal flow idle. Ecosystem remains totally stable.';
                document.getElementById(`kpi-${index}-action`).textContent = 'Safely maintain current operational roadmap.';
                document.getElementById(`kpi-${index}-tags`).innerHTML = `<span class="micro-tag stable-tag">Stable Baseline</span>`;
                cardEl.classList.add('kpi-empty-state');
            }

            // Click router
            cardEl.onclick = (e) => {
                e.preventDefault();
                if (kpi.targetNav) {
                    const navItem = document.querySelector(`.nav-item[data-target="${kpi.targetNav}"]`);
                    if (navItem) navItem.click();
                } else if (kpi.targetPill) {
                    document.querySelectorAll('.pill').forEach(p => {
                        if (p.textContent.trim() === kpi.targetPill.trim()) p.click();
                    });
                }
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

            // Enrich each article with impact score and agent insights
            LIVE_DATA.forEach(article => {
                // Pass sheet impact score so real OpenAI scores take priority
                article.impactScore = scoreImpact(article.title, article.summary, article.impact);
                // Pass secondary_tags so real OpenAI insights are used when available
                article.insights = generateAgentInsights(
                    article.agentId,
                    article.title,
                    article.summary,
                    article.secondary_tags
                );
            });

            // Sort: High → Medium → Low, then newest first within each tier
            const impactWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
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

    // ─────────────────────────────────────────────────────────────
    // FEED FILTER
    // Filters by agent first, then by pill keyword or impact level
    // ─────────────────────────────────────────────────────────────
    function applyFeedFilter(navTarget, pillText) {
        let filteredData = LIVE_DATA || [];

        // Filter by agent
        if (navTarget !== 'all' && navTarget !== 'weekly') {
            const agentMap = { 'agent-1': 1, 'agent-2': 2, 'agent-3': 3 };
            filteredData = filteredData.filter(item => item.agentId === agentMap[navTarget]);
        }

        // Filter by pill
        if (pillText !== 'All') {
            const lowerPill = pillText.toLowerCase();
            if (lowerPill === 'high impact') {
                filteredData = filteredData.filter(i => i.impactScore === 'High');
            } else if (lowerPill === 'strategy') {
                filteredData = filteredData.filter(i => {
                    const haystack = [i.title, i.summary, i.primary_tag, i.secondary_tags].join(' ').toLowerCase();
                    return haystack.match(/strateg|framework|moat|competitor|business|revenue|operat|model/);
                });
            } else if (lowerPill === 'regulatory') {
                // Regulatory pill: match impact OR keyword so it catches both
                filteredData = filteredData.filter(i => {
                    const haystack = [i.title, i.summary, i.primary_tag, i.secondary_tags].join(' ').toLowerCase();
                    return haystack.match(/regulat|compliance|liability|draft|ban|mandate|fca|mas|law|govern/);
                });
            } else if (lowerPill === 'recent (48h)') {
   		 const now = new Date();
		 filteredData = filteredData.filter(i => {
        	 if (!i.date) return false;

	        const articleDate = new Date(i.date);
        	if (isNaN(articleDate)) return false;	

	        const diffMs = now - articleDate;
        	return diffMs <= 48 * 60 * 60 * 1000;
	    	});

	    } else if (lowerPill === 'watchlist (escalated)') {
    		filteredData = filteredData.filter(i => {
        	return String(i.escalation || '').toUpperCase() === 'YES';
   	    });
	    }
		else {
                filteredData = filteredData.filter(i => {
                    const haystack = [
                        i.title, i.summary, i.primary_tag,
                        i.secondary_tags, i.agent, i.source
                    ].join(' ').toLowerCase();
                    return haystack.includes(lowerPill);
                });
            }
        }

        renderArticles(filteredData);
    }

    function renderArticles(data) {
        feedGrid.innerHTML = '';

        if (!data || data.length === 0) {
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
        if (id === 1) return 'fa-robot';
        if (id === 2) return 'fa-box-open';
        if (id === 3) return 'fa-coins';
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
        navItems.forEach(n => n.classList.remove('active'));
        navItems[0].classList.add('active');
        updateUIConfig('all');
        applyFeedFilter('all', 'All');
    });

    // Sidebar navigation
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
