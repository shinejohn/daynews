import { Worker } from 'worker_threads'
import { EventEmitter } from 'events'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class RevalidationQueue extends EventEmitter {
  constructor(maxWorkers = 2) {
    super()
    this.queue = []
    this.workers = []
    this.maxWorkers = maxWorkers
    this.processing = new Set()
  }

  add(route, priority = 'normal') {
    // Avoid duplicate entries
    if (this.processing.has(route)) return
    
    const job = { route, priority, timestamp: Date.now() }
    
    if (priority === 'high') {
      this.queue.unshift(job)
    } else {
      this.queue.push(job)
    }
    
    this.process()
  }

  async process() {
    if (this.workers.length >= this.maxWorkers || this.queue.length === 0) {
      return
    }

    const job = this.queue.shift()
    if (!job) return

    this.processing.add(job.route)

    const worker = new Worker(
      path.join(__dirname, 'revalidation-worker.js'),
      { workerData: job }
    )

    this.workers.push(worker)

    worker.on('message', (result) => {
      this.emit('revalidated', result)
      this.processing.delete(job.route)
    })

    worker.on('error', (err) => {
      console.error('Worker error:', err)
      this.emit('error', { route: job.route, error: err })
      this.processing.delete(job.route)
    })

    worker.on('exit', () => {
      this.workers = this.workers.filter(w => w !== worker)
      this.process() // Process next item
    })
  }

  clear() {
    this.queue = []
  }

  size() {
    return this.queue.length
  }
}
