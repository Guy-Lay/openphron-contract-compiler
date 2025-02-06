import { Request, Response } from 'express';

interface QueueItem {
    req: Request;
    res: Response;
    handler: (req: Request, res: Response) => Promise<any>;
}

const queue: QueueItem[] = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing || queue.length === 0) return;

    isProcessing = true;
    const { req, res, handler } = queue.shift()!; // Non-null assertion

    try {
        await handler(req, res);
    } finally {
        isProcessing = false;
        processQueue(); // Process next request
    }
}

export function addToQueue(req: Request, res: Response, handler: (req: Request, res: Response) => Promise<any>) {
    queue.push({ req, res, handler });
    processQueue();
}
