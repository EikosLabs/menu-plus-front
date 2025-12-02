// Start the Astro app directly
import('./entry.mjs').catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});