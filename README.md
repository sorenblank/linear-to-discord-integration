# Linear to Discord Integration

A lightweight and customizable webhook integration that forwards Linear updates to Discord with rich formatting. This integration mirrors Linear's native Slack integration style while adding Discord-specific enhancements.

![Linear to Discord Demo](/public/demo.gif)

## Features

- 🚀 Real-time Linear updates in Discord
- 💅 Clean, Slack-like message formatting
- 🎨 Status-based color coding
- 📊 Priority indicators with emojis
- 🔗 Direct links to Linear issues
- 👥 Team and assignee tracking
- 🏷️ Label support
- 💬 Comment notifications

## Prerequisites

- Node.js 16.x or higher
- npm or yarn
- A Discord server with admin privileges
- A Linear workspace with admin access

## Setup Guide

### 1. Discord Webhook Setup

1. Open your Discord server settings
2. Navigate to "Integrations" > "Webhooks"
3. Click "New Webhook"
4. Choose the channel for Linear notifications
5. Copy the Webhook URL

### 2. Linear Webhook Setup

1. Go to your Linear workspace settings
2. Navigate to "API" > "Webhooks"
3. Click "New Webhook"
4. Name it "Discord Integration"
5. Enter your deployment URL (see Deployment section)
6. Select the events you want to forward (recommended: Issues and Comments)
7. Save and copy the webhook secret

### 3. Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/linear-discord-integration.git
cd linear-discord-integration

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your environment variables
DISCORD_WEBHOOK_URL=your_discord_webhook_url
LINEAR_WEBHOOK_SECRET=your_linear_webhook_secret
PORT=3000

# Start development server
npm run dev
```

### 4. Local Testing with ngrok

To test the webhook locally, you'll need to make your local server accessible to Linear. We use ngrok for this:

1. Install ngrok globally (if you haven't already):

```bash
npm install -g ngrok
# or
brew install ngrok # on macOS with Homebrew
```

2. Start your local server:

```bash
npm run dev
```

3. In a new terminal window, create an ngrok tunnel:

```bash
ngrok http 3000
```

4. Copy the HTTPS URL provided by ngrok (e.g., `https://1234-56-78-901-23.ngrok-free.app`)

5. Use this URL in your Linear webhook settings:
   - Go to Linear workspace settings
   - Navigate to "API" > "Webhooks"
   - Create or edit your webhook
   - Paste the ngrok URL as the webhook endpoint

Note: The ngrok URL changes every time you restart ngrok. For persistent testing, consider:

- Using a fixed ngrok URL with a paid account
- Deploying to a staging environment
- Using Railway or Vercel for development previews

### 4. Environment Variables

| Variable                | Description                            | Required           |
| ----------------------- | -------------------------------------- | ------------------ |
| `DISCORD_WEBHOOK_URL`   | Discord channel webhook URL            | Yes                |
| `LINEAR_WEBHOOK_SECRET` | Linear webhook secret for verification | Yes                |
| `PORT`                  | Port for the server to run on          | No (default: 3000) |

## Deployment

### Vercel Deployment (Recommended)

1. Fork this repository
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your forked repository
4. Add environment variables in Vercel project settings
5. Deploy!

### Manual Deployment

You can deploy this on any Node.js hosting platform:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start production server
npm start
```

## Customization

### Message Formatting

Modify the `createDiscordMessage` function in `index.js` to customize the message format:

```javascript
function createDiscordMessage(linearData) {
  // Your custom formatting logic
}
```

### Status Colors

Adjust status colors in the `getStatusColor` function:

```javascript
function getStatusColor(status) {
  // Your custom color mappings
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Create an [issue](https://github.com/yourusername/linear-discord-integration/issues) for bug reports or feature requests
- Star ⭐ the repository if you find it useful!

## Acknowledgments

- [Linear API Documentation](https://developers.linear.app/docs/)
- [Discord Webhook Documentation](https://discord.com/developers/docs/resources/webhook)

---

Made by [Soren Blank](https://sorenblank.com)
