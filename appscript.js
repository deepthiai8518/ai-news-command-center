/**
 * AI Intelligence Agents - Phase 1: Data Infrastructure
 * 
 * Instructions:
 * 1. Place this code in the Google Sheets Apps Script Editor (Extensions > Apps Script).
 * 2. Update the TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID below.
 */
const TELEGRAM_BOT_TOKEN = '8278942111:AAF8J9fCtQEKeMEpfgxymlCRvJLpcyOvuc4';
const TELEGRAM_CHAT_ID = '6627988773';

// Column mappings to make the code flexible
const TABS = {
    ARTICLES: 'All_Articles',
    SOURCES: 'RSS_Sources',
    SUMMARIES: 'Weekly_Summaries',
    ALERTS: 'Alerts_Log'
};

/**
 * Noise patterns — titles matching these are silently skipped on fetch.
 * Add any recurring low-quality RSS subject lines here.
 */
const NOISE_PATTERNS = /^spring break$|please listen to my podcast|^this week on|^2026\.\d+|^weekend reads|^daily digest|^links for|^issue #\d+/i;

/**
 * Returns true if an article with this exact title already exists in the sheet.
 * Prevents duplicates from the same RSS feed running multiple times.
 */
function articleExists(articlesSheet, title) {
    const data = articlesSheet.getDataRange().getValues();
    return data.some(row => row[1] === title);
}

/**
 * Normalises ambiguous agent names coming from RSS_Sources.
 * Fixes the "AI Updates/Fintech" hybrid badge bug.
 */
function normaliseAgent(agent) {
    const a = (agent || '').trim();
    // If someone typed a hybrid like "AI Updates/Fintech" default to AI Updates
    if (a.toLowerCase().includes('/')) return 'AI Updates';
    return a;
}

/**
 * Main function to fetch all active RSS feeds and save new articles.
 * Runs automatically every 4 hours via Apps Script Triggers.
 */
function fetchAllActiveRSSFeeds() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const sourcesSheet = sheet.getSheetByName(TABS.SOURCES);
    const articlesSheet = sheet.getSheetByName(TABS.ARTICLES);
    const alertsSheet = sheet.getSheetByName(TABS.ALERTS);

    if (!sourcesSheet || !articlesSheet) {
        Logger.log("Error: Missing required tabs.");
        return;
    }

    const sourcesData = sourcesSheet.getDataRange().getValues();
    const sourcesRows = sourcesData.slice(1);
    let newArticlesFound = 0;
    let skippedNoise = 0;
    let skippedDupes = 0;

    sourcesRows.forEach((row, index) => {
        const name       = row[0];
        const rssUrl     = row[1];
        const agent      = normaliseAgent(row[2]); // ← fixes hybrid agent names
        const active     = row[3];
        const lastFetched = row[4];

        if (active === true && rssUrl) {
            try {
                Logger.log(`Fetching feed: ${name} (${rssUrl})`);
                const xml = UrlFetchApp.fetch(rssUrl).getContentText();
                const document = XmlService.parse(xml);
                const root = document.getRootElement();
                let items = [];

                const channel = root.getChild('channel');
                if (channel) {
                    items = channel.getChildren('item');
                } else {
                    const atomNamespace = XmlService.getNamespace('http://www.w3.org/2005/Atom');
                    items = root.getChildren('entry', atomNamespace);
                }

                const cutoffDate = lastFetched
                    ? new Date(lastFetched)
                    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

                items.forEach(item => {
                    let title, link, pubDateStr, pubDate;

                    if (channel) {
                        title      = item.getChildText('title') || 'No Title';
                        link       = item.getChildText('link') || '';
                        pubDateStr = item.getChildText('pubDate');
                    } else {
                        const atomNs = XmlService.getNamespace('http://www.w3.org/2005/Atom');
                        title      = item.getChildText('title', atomNs) || 'No Title';
                        const linkNode = item.getChild('link', atomNs);
                        link       = linkNode ? linkNode.getAttribute('href').getValue() : '';
                        pubDateStr = item.getChildText('published', atomNs) || item.getChildText('updated', atomNs);
                    }

                    pubDate = pubDateStr ? new Date(pubDateStr) : new Date();

                    // ── NOISE FILTER ──────────────────────────────────────────
                    if (NOISE_PATTERNS.test(title.trim())) {
                        skippedNoise++;
                        Logger.log(`Skipped (noise): "${title}"`);
                        return;
                    }

                    // ── DUPLICATE FILTER ──────────────────────────────────────
                    if (articleExists(articlesSheet, title)) {
                        skippedDupes++;
                        Logger.log(`Skipped (duplicate): "${title}"`);
                        return;
                    }

                    if (pubDate > cutoffDate) {
                        articlesSheet.appendRow([
                            pubDate, title, link, name, agent, 'Auto-tagged', '', 'Pending GenAI Summary', 'Normal', 'New'
                        ]);
                        newArticlesFound++;
                        checkHighPriorityAlert(title, link, agent, pubDate, alertsSheet);
                    }
                });

                const sourceRowIndex = index + 2;
                sourcesSheet.getRange(sourceRowIndex, 5).setValue(new Date());

            } catch (e) {
                Logger.log(`Error fetching ${name}: ${e.toString()}`);
            }
        }
    });

    Logger.log(`Finished. New: ${newArticlesFound} | Noise skipped: ${skippedNoise} | Dupes skipped: ${skippedDupes}`);
    if (newArticlesFound > 0) {
        sendTelegramMessage(`✅ Fetched ${newArticlesFound} new articles. (${skippedDupes} dupes + ${skippedNoise} noise filtered)`);
    }
}

/**
 * Basic keyword checking for high-priority alerts.
 */
function checkHighPriorityAlert(title, link, agent, pubDate, alertsSheet) {
    const highPriorityKeywords = [
        // Regulatory
        'regulation', 'fca', 'mas', 'ban', 'mandate', 'liability', 'compliance',
        // Model releases
        'gpt-5', 'gpt-6', 'llama 4', 'claude 5', 'gemini 4',
        // Market moves
        'acquires', 'acquisition', 'merger', 'raises', 'billion', 'shutdown',
        // Security
        'breach', 'exploit', 'hack', 'sanction'
    ];
    const lowerTitle = title.toLowerCase();
    if (highPriorityKeywords.some(kw => lowerTitle.includes(kw))) {
        alertsSheet.appendRow([pubDate, title, 'High Priority', 'Telegram', 'Pending']);
        sendTelegramMessage(`🚨 HIGH PRIORITY ALERT [${agent}]:\n\n${title}\n${link}`);
    }
}

/**
 * Helper to send messages to Telegram.
 */
function sendTelegramMessage(message) {
    if (TELEGRAM_BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
        Logger.log("Skipping Telegram notification: Token not set.");
        return;
    }
    const payload = { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' };
    const options = { method: 'post', payload: payload };
    try {
        UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, options);
    } catch (e) {
        Logger.log(`Failed to send Telegram message: ${e.toString()}`);
    }
}

/**
 * Setup Triggers Programmatically.
 * Run this ONCE to automate the execution.
 */
function setupDailyTriggers() {
    ScriptApp.newTrigger('fetchAllActiveRSSFeeds')
        .timeBased()
        .everyHours(4)
        .create();
    Logger.log("Triggers setup complete.");
}

/**
 * Utility test pipeline.
 */
function testPipeline() {
    Logger.log("Starting test pipeline...");
    fetchAllActiveRSSFeeds();
}

/**
 * Adds starter RSS feeds for AI Updates agent.
 */
function addStarterFeeds() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSS_Sources');
    const feeds = [
        ['OpenAI',            'https://openai.com/news/rss.xml',                                          'AI Updates', true, ''],
        ['Hugging Face',      'https://huggingface.co/blog/feed.xml',                                     'AI Updates', true, ''],
        ['arXiv AI',          'https://rss.arxiv.org/rss/cs.AI',                                          'AI Updates', true, ''],
        ['Google AI Blog',    'https://ai.googleblog.com/feeds/posts/default',                             'AI Updates', true, ''],
        ['MIT Tech Review',   'https://www.technologyreview.com/topic/artificial-intelligence/feed',       'AI Updates', true, ''],
        // --- PM Feeds ---
        ["Lenny's Newsletter",'https://www.lennysnewsletter.com/feed',                                     'AI PM',      true, ''],
        ['SVPG',              'https://www.svpg.com/feed/',                                                'AI PM',      true, ''],
        ['Product Hunt',      'https://www.producthunt.com/feed',                                          'AI PM',      true, ''],
        // --- Fintech Feeds ---
        ['Finextra',          'https://www.finextra.com/rss/headlines.aspx',                               'AI Fintech', true, ''],
        ['The Block',         'https://www.theblock.co/rss.xml',                                           'AI Fintech', true, ''],
        ['MAS News',          'https://www.mas.gov.sg/rss/news',                                           'AI Fintech', true, '']
    ];
    sheet.getRange(2, 1, feeds.length, feeds[0].length).setValues(feeds);
    Logger.log('Starter feeds added.');
}

// =============================================================================
// API ENDPOINT FOR YOUR DASHBOARD
// IMPORTANT: After editing this file, you MUST deploy a NEW version:
//   Deploy > Manage deployments > Edit (pencil) > Version: New version > Deploy
// =============================================================================
function doGet(e) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('All_Articles');
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
        return ContentService
            .createTextOutput(JSON.stringify([]))
            .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0];

    // --- DEBUG: Log exact header keys on first run to verify column names ---
    // Remove or comment this out after confirming keys are correct.
    Logger.log('Sheet column keys: ' + headers.map(h => h.toLowerCase().replace(/\s+/g, '_')).join(', '));

    const jsonArray = data.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            const key = header.toLowerCase().replace(/\s+/g, '_');
            obj[key] = row[index];
        });

        // -----------------------------------------------------------------------
        // AGENT ID ROUTING
        // Maps each row to an agentId (1=AI Updates, 2=AI PM, 3=AI Fintech)
        // Strategic Signals are routed by their Primary Tag value.
        // -----------------------------------------------------------------------
        if (obj.agent === 'AI Updates') {
            obj.agentId = 1;

        } else if (obj.agent === 'AI PM') {
            obj.agentId = 2;

        } else if (obj.agent === 'AI Fintech') {
            obj.agentId = 3;

        } else if (obj.agent === 'Strategic Signals') {
            // NOTE: 'primary_tag' assumes your sheet column header is exactly "Primary Tag"
            // If your column is named differently (e.g. "Primary Tags"), update the key below.
            const tag = (obj.primary_tag || '').toLowerCase();

            if (
                tag.includes('fintech') ||
                tag.includes('banking') ||
                tag.includes('regulation') ||
                tag.includes('compliance') ||
                tag.includes('payments') ||
                tag.includes('fraud')
            ) {
                obj.agentId = 3; // AI Fintech

            } else if (
                tag.includes('product management') ||
                tag.includes('product strategy') ||
                tag.includes('gtm') ||
                tag.includes('workflow') ||
                tag.includes('adoption') ||
                tag.includes('evaluation') ||
                tag.includes('pricing strategy')
            ) {
                obj.agentId = 2; // AI PM

            } else {
                obj.agentId = 1; // Default: AI Updates (catches AI Models, AI News, etc.)
            }

            // Debug log — remove after confirming routing is correct
            Logger.log(`Strategic Signal routed: "${obj.title}" | tag="${obj.primary_tag}" → agentId=${obj.agentId}`);

        } else {
            obj.agentId = 1; // Fallback for any unrecognised agent name
        }

        // Format the date timestamp for the UI
        if (obj.date instanceof Date) {
            obj.date = obj.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        return obj;
    });

    // Return data newest-first
    return ContentService
        .createTextOutput(JSON.stringify(jsonArray.reverse()))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    const data = JSON.parse(e.postData.contents);
    const message = data.message?.text || '';
    const chatId = data.message?.chat?.id;

    if (!message || !chatId) return ContentService.createTextOutput('ok');

    if (message === '/run') {
        fetchAllActiveRSSFeeds();
        sendTelegramReply(chatId, 'RSS fetch started and completed.');
    } else if (message === '/signals') {
        sendTelegramReply(chatId, 'Strategic Signals flow not connected yet.');
    } else if (message === '/summary') {
        sendTelegramReply(chatId, 'Summary flow not connected yet.');
    } else {
        sendTelegramReply(chatId, 'Unknown command. Try /run');
    }

    return ContentService.createTextOutput('ok');
}

function sendTelegramReply(chatId, message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    UrlFetchApp.fetch(url, { method: 'post', payload: { chat_id: chatId, text: message } });
}

/**
 * Imports 10 curated Strategic Signals into the All_Articles sheet.
 * Run this ONCE to seed your database with initial signal data.
 */
function importStrategicSignals() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("All_Articles");

    const signals = [
        {
            date: "2026-03-17",
            title: "The End of the Product Owner in the Agentic Era",
            url: "https://svpg.com/the-end-of-the-product-owner",
            source: "Silicon Valley Product Group",
            agent: "Strategic Signals",
            primaryTag: "AI Product Management",
            secondaryTags: "Agile, Team Structure, AI Automation",
            summary: "Marty Cagan argues that traditional Product Owner roles focused strictly on delivery pipelines and agile ticket writing face extreme automation risk. Product teams must pivot entirely to true discovery to survive.",
            impact: "High - Forces a massive re-org in tech companies away from delivery-focused PMs toward strategic discovery.",
            status: "New"
        },
        {
            date: "2026-03-16",
            title: "Effort Controls and the New Frontier of Monetization",
            url: "https://www.anthropic.com/news/effort-controls-4-6",
            source: "Anthropic Research",
            agent: "Strategic Signals",
            primaryTag: "AI Models",
            secondaryTags: "Pricing Strategy, UX Design",
            summary: "Anthropic introduces developer dials for the Claude 4.6 family, allowing operators to dictate the balance between intelligence (compute time) and speed. This shifts focus from prompting to dynamic resource allocation.",
            impact: "High - Establishes a new paradigm for SaaS pricing, enabling value-based compute scaling.",
            status: "New"
        },
        {
            date: "2026-03-15",
            title: "MAS Singapore Drafts Liability Framework for Autonomous Finance",
            url: "https://www.mas.gov.sg/news/regulatory-framework-ai",
            source: "MAS Press Room",
            agent: "Strategic Signals",
            primaryTag: "AI Fintech",
            secondaryTags: "Regulation, Liability, Governance",
            summary: "The Monetary Authority of Singapore released the first global draft holding tech publishers strictly liable for unauthorized actions taken by autonomous financial agents handling banking or investments.",
            impact: "Critical - Forces fintechs building wealth agents to implement deterministic guardrails before scaling.",
            status: "New"
        },
        {
            date: "2026-03-15",
            title: "Judgment as the Ultimate Moat in Product",
            url: "https://shreyasdoshi.substack.com/judgment-ai",
            source: "Shreyas Doshi Newsletter",
            agent: "Strategic Signals",
            primaryTag: "AI Product Management",
            secondaryTags: "Product Strategy, Career",
            summary: "With vibe coding and PRD generation commoditized by LLMs, Doshi outlines how tactical PM tasks yield zero competitive advantage. 'Product Sense' is the last defensible human moat.",
            impact: "Medium - Highly practical framework for operators looking to upskill and avoid automation redundancy.",
            status: "New"
        },
        {
            date: "2026-03-14",
            title: "Meta Acquires AI Agent Startup Manus for $2B",
            url: "https://www.theverge.com/meta-acquires-manus-2b",
            source: "The Verge",
            agent: "Strategic Signals",
            primaryTag: "AI News",
            secondaryTags: "Acquisitions, Agentic Workflows",
            summary: "Meta aggressively acquires workflow startup Manus to integrate multi-agent collaboration directly into WhatsApp, Instagram, and internal enterprise tools.",
            impact: "High - Confirms the industry's hard pivot from better foundational LLMs to better agentic orchestration.",
            status: "New"
        },
        {
            date: "2026-03-12",
            title: "The Draft-Zero Operating Standard",
            url: "https://www.lennysnewsletter.com/draft-zero",
            source: "Lenny's Newsletter",
            agent: "Strategic Signals",
            primaryTag: "AI Product Management",
            secondaryTags: "Operations, Productivity",
            summary: "Highlights a fast-growing organizational norm: every document, roadmap, and memo must start with an AI-generated draft. The primary function of an operator transitions to 'editor-in-chief'.",
            impact: "High - Establishes a practical, measurable velocity baseline for product teams.",
            status: "New"
        },
        {
            date: "2026-03-11",
            title: "Revolut Soft-Launches Auto-Sweep Yield Optimizer Agents",
            url: "https://www.ft.com/revolut-auto-sweep-ai",
            source: "Financial Times",
            agent: "Strategic Signals",
            primaryTag: "AI Fintech",
            secondaryTags: "Consumer Banking, WealthTech",
            summary: "Revolut allows premium users to enable an AI agent that monitors daily checking balances and automatically sweeps idle cash into the highest-yielding money markets across Europe.",
            impact: "High - The first major retail deployment of hands-free cross-institutional asset maximization.",
            status: "New"
        },
        {
            date: "2026-03-10",
            title: "xAI Grok 4.20 Pioneers Native Four-Agent Architectures",
            url: "https://x.ai/blog/grok-4-20",
            source: "xAI Blog",
            agent: "Strategic Signals",
            primaryTag: "AI Models",
            secondaryTags: "Architecture, Verification",
            summary: "Grok's newest release abandons a single-model pipeline. Queries pass through four natively integrated sub-agents (Researcher, Drafter, Verifier, Synthesizer) internally before outputting text or video.",
            impact: "High - Shifts the engineering burden of creating 'Chain of Agents' back to the model host.",
            status: "New"
        },
        {
            date: "2026-03-09",
            title: "MiniMax M2.5 Shatters the Pricing Floor",
            url: "https://techcrunch.com/minimax-m2-5-pricing",
            source: "TechCrunch",
            agent: "Strategic Signals",
            primaryTag: "AI News",
            secondaryTags: "Market Dynamics, API Economics",
            summary: "Chinese startup releases a model rivaling Claude Opus 4.6 at a fraction of the cost, forcing US incumbents to drastically lower pricing for enterprise SaaS customers.",
            impact: "High - Unlocks incredibly compute-heavy background tasks for bootstrapped products.",
            status: "New"
        },
        {
            date: "2026-03-08",
            title: "Apple Siri Reborn: Gemini 3.1 Pro Drives the OS",
            url: "https://www.bloomberg.com/apple-siri-gemini-3-1",
            source: "Bloomberg",
            agent: "Strategic Signals",
            primaryTag: "AI News",
            secondaryTags: "OS Integration, UI Paradigm",
            summary: "Apple finalizes its transition to power Siri natively via Google's 1.2 Trillion parameter Gemini 3.1 Pro model. Secure deep-app intents allow the assistant to bypass application UIs entirely.",
            impact: "Critical - Marks the rapid decline of traditional GUI interaction on mobile devices.",
            status: "New"
        }
    ];

    signals.forEach(sig => {
        sheet.appendRow([
            sig.date, sig.title, sig.url, sig.source, sig.agent,
            sig.primaryTag, sig.secondaryTags, sig.summary, sig.impact, sig.status
        ]);
    });

    Logger.log("Successfully added all 10 Strategic Signals to the database!");
}

function authorizeInternet() {
    UrlFetchApp.fetch("https://google.com");
}
