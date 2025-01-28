/**
 * Linear to Discord Integration
 * Forwards Linear webhooks to Discord with rich formatting
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

// Initialize Express application
const app = express();
app.use(bodyParser.json());

/* =============== CONSTANTS & UTILITIES =============== */

/**
 * Maps priority levels to corresponding emojis
 * @param {number} priority - Linear priority level (0-4)
 * @returns {string} Emoji representation of priority
 */
function getPriorityEmoji(priority) {
    const PRIORITY_EMOJIS = {
        0: '🔘', // No priority
        1: '⬇️', // Low
        2: '⏺️', // Medium
        3: '⬆️', // High
        4: '🔥', // Urgent
    };
    return PRIORITY_EMOJIS[priority] || '🔘';
}

/**
 * Maps status to Discord embed colors
 * @param {string} status - Linear issue status
 * @returns {number} Discord color code
 */
function getStatusColor(status) {
    const STATUS_COLORS = {
        'done': 0x77B255,      // Green
        'completed': 0x77B255,  // Green
        'in progress': 0xF2C94C,// Yellow
        'in review': 0xFFC107,  // Yellow
        'canceled': 0x95A2B3,   // Off White
        'blocked': 0xFF5722,    // Orange
    };
    return STATUS_COLORS[status?.toLowerCase()] || 0x5E6AD2; // Default Linear blue
}

/**
 * Creates a Discord timestamp string
 * @param {string} date - ISO date string
 * @returns {string} Formatted Discord timestamp
 */
function getTimestampString(date) {
    return `<t:${Math.floor(new Date(date).getTime() / 1000)}:R>`;
}

/* =============== MESSAGE FORMATTING =============== */

/**
 * Creates a formatted Discord message from Linear webhook data
 * @param {Object} linearData - Webhook payload from Linear
 * @returns {Object} Formatted Discord webhook payload
 */
function createDiscordMessage(linearData) {
    const { action, actor, data, type } = linearData;

    // Handle different types of Linear webhooks
    const handlers = {
        'Issue': handleIssueUpdate,
        'Comment': handleCommentUpdate,
        'default': handleDefaultUpdate
    };

    const handler = handlers[type] || handlers.default;
    return handler({ action, actor, data, type });
}

/**
 * Handles Issue type updates
 */
function handleIssueUpdate({ action, actor, data }) {
    const issueName = `${data.team?.key}-${data.number}`;
    const issueUrl = `https://linear.app/issue/${issueName}`;
    const priorityEmoji = getPriorityEmoji(data.priority);
    const timestamp = getTimestampString(data.updatedAt || data.createdAt);

    // Action-specific formatting
    const ACTION_FORMATS = {
        'create': { emoji: '🆕', description: `New issue created ${timestamp}` },
        'update': { emoji: '📝', description: `Issue updated ${timestamp}` },
        'remove': { emoji: '🗑️', description: `Issue deleted ${timestamp}` },
    };

    const actionFormat = ACTION_FORMATS[action] || { emoji: 'ℹ️', description: `Issue ${action} ${timestamp}` };

    // Create content string
    const content = `${data.state?.name === 'Done' ? '✅' : ''} **${actor.name}** changed issue status to **${data.state?.name}** in [${data.team?.name || 'Unknown'} Team](${data.url})`;

    return {
        content,
        embeds: [{
            title: `${actionFormat.emoji} ${issueName}: ${data.title}`,
            url: issueUrl,
            description: actionFormat.description,
            color: getStatusColor(data.state?.name),
            fields: [
                {
                    name: 'Status',
                    value: data.state?.name || 'No status',
                    inline: true
                },
                {
                    name: 'Priority',
                    value: `${priorityEmoji} ${data.priority ? `P${data.priority}` : 'None'}`,
                    inline: true
                },
                {
                    name: 'Assignee',
                    value: data.assignee?.name || 'Unassigned',
                    inline: true
                },
                ...(data.labels?.length ? [{
                    name: 'Labels',
                    value: data.labels.map(label => `\`${label.name}\``).join(', '),
                    inline: false
                }] : [])
            ],
            footer: {
                text: `${data.team?.name || 'Unknown Team'} • ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            },
            timestamp: new Date(data.updatedAt || data.createdAt).toISOString()
        }]
    };
}

/**
 * Handles Comment type updates
 */
function handleCommentUpdate({ data }) {
    return {
        embeds: [{
            title: `💬 New comment on ${data.issue.identifier}`,
            url: `https://linear.app/issue/${data.issue.identifier}`,
            color: 0x5E6AD2,
            footer: {
                text: `Comment by ${data.user.name}`
            },
            timestamp: new Date(data.createdAt).toISOString()
        }]
    };
}

/**
 * Handles any unspecified update types
 */
function handleDefaultUpdate({ action, type }) {
    return {
        embeds: [{
            title: `Linear Update: ${type}`,
            description: `A ${type} was ${action}ed`,
            color: 0x5E6AD2
        }]
    };
}

/* =============== SERVER SETUP =============== */

// Webhook endpoint
app.post('/', async (req, res) => {
    try {
        console.log('Received webhook from Linear:', JSON.stringify(req.body, null, 2));

        const discordMessage = createDiscordMessage(req.body);
        const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordMessage)
        });

        if (!response.ok) {
            console.error('Discord webhook failed:', await response.text());
            throw new Error(`Discord webhook failed: ${response.statusText}`);
        }

        res.json({ status: 'success' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Failed to process webhook' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});