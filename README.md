# WebhookPro

A modern, open-source webhook testing and debugging tool for developers. Built with Next.js, TypeScript, and Tailwind CSS.

![WebhookPro Screenshot](https://webhookpro.vercel.app/og-image.png)

## Features

- **Instant Setup** - No signup required. Get a unique webhook URL in seconds
- **Real-time Inspection** - View headers, body, and metadata instantly. Auto-updates as webhooks arrive
- **Secure by Default** - HTTPS-only endpoints. Your webhook data is private
- **Global Edge Network** - Deployed on Vercel Edge for sub-100ms latency worldwide
- **Dark Theme** - Easy on the eyes with a carefully crafted dark UI inspired by Linear and MonoKai Pro

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Upstash Redis](https://upstash.com/) - Data persistence
- [Vercel](https://vercel.com/) - Hosting & Edge network

## Self-Hosting

### Prerequisites

- Node.js 20+
- Upstash Redis account (free tier works)
- Vercel account (optional, for deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/tiagofoil/webhookpro.git
cd webhookpro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Upstash Redis credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Your Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash Redis REST token |

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tiagofoil/webhookpro)

## Usage

1. Visit [webhookpro.vercel.app](https://webhookpro.vercel.app)
2. Click "Create Webhook Endpoint" to get a unique URL
3. Send webhooks to your URL using curl, Postman, or your application
4. Watch them appear in real-time with full details

### Example with curl

```bash
curl -X POST https://webhookpro.vercel.app/hook/YOUR_ENDPOINT_ID \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "data": "hello"}'
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

If you find this tool useful, consider [buying me a coffee](https://www.buymeacoffee.com/tiagofoil) ☕

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ by [Tiago Foil](https://github.com/tiagofoil)