import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { sendEmail } from "../services/emailService";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let emailQueue: Queue | null = null;
let emailWorker: Worker | null = null;
let isRedisAvailable = false;

// Initialize ioredis with strict retry limits to prevent hanging
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableReadyCheck: false,
  reconnectOnError: () => false,
  retryStrategy: (times) => {
    if (times > 1) return null; // stop reconnect retries immediately
    return 10;
  },
});

connection.connect()
  .then(() => {
    isRedisAvailable = true;
    console.log("[Redis] Connected successfully for queues.");
    
    emailQueue = new Queue("emailQueue", { connection: connection as any });
    
    emailWorker = new Worker(
      "emailQueue",
      async (job: Job) => {
        const { to, subject, html } = job.data;
        await sendEmail({ to, subject, html });
      },
      { connection: connection as any }
    );

    emailWorker.on("completed", (job) => {
      console.log(`[Queue] Job ${job.id} completed successfully`);
    });

    emailWorker.on("failed", (job, err) => {
      console.error(`[Queue] Job ${job?.id} failed:`, err);
    });
  })
  .catch((err) => {
    console.warn(`[Redis] Connection failed. Falling back to mock in-memory queues: ${err.message}`);
    isRedisAvailable = false;
  });

export async function queueEmail(to: string, subject: string, html: string) {
  if (isRedisAvailable && emailQueue) {
    try {
      await emailQueue.add(`email_${Date.now()}`, { to, subject, html });
      console.log(`[Queue] Queued email to ${to} via BullMQ`);
    } catch (e: any) {
      console.warn(`[Queue] Failed to add to BullMQ: ${e.message}. Executing in-memory.`);
      await sendEmail({ to, subject, html });
    }
  } else {
    // Fallback: execute immediately in-memory (synchronously)
    console.log(`[Queue Fallback] Dispatching email immediately (in-memory) to ${to}`);
    await sendEmail({ to, subject, html });
  }
}
