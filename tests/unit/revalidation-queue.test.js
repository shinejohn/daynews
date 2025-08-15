// Unit tests for RevalidationQueue
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { RevalidationQueue } from '../../server/isr/revalidation-queue.js';
import { waitFor, sleep, PerformanceTimer } from '../utils/test-helpers.js';
import { EventEmitter } from 'events';

// Mock worker_threads module
const mockWorkers = new Map();
const mockWorkerData = new Map();

jest.mock('worker_threads', () => ({
  Worker: jest.fn().mockImplementation((scriptPath, options) => {
    const worker = new EventEmitter();
    const workerId = Date.now() + Math.random();
    
    worker.postMessage = jest.fn();
    worker.terminate = jest.fn();
    
    // Store worker data for testing
    mockWorkerData.set(workerId, options.workerData);
    mockWorkers.set(workerId, worker);
    
    // Simulate async work completion
    setTimeout(() => {
      const { route } = options.workerData;
      worker.emit('message', {
        success: true,
        route,
        timestamp: Date.now()
      });
      worker.emit('exit', 0);
    }, 10);
    
    worker._id = workerId;
    return worker;
  }),
  parentPort: {
    postMessage: jest.fn()
  }
}));

describe('RevalidationQueue', () => {
  let queue;
  let timer;

  beforeEach(() => {
    queue = new RevalidationQueue(2); // Max 2 workers
    timer = new PerformanceTimer();
    
    // Clear mocks
    mockWorkers.clear();
    mockWorkerData.clear();
    
    // Mock console to avoid test noise
    global.mockConsole();
  });

  afterEach(() => {
    queue.clear();
    global.restoreConsole();
  });

  describe('constructor', () => {
    test('should initialize with default max workers', () => {
      const defaultQueue = new RevalidationQueue();
      expect(defaultQueue.maxWorkers).toBe(2);
      expect(defaultQueue.queue).toEqual([]);
      expect(defaultQueue.workers).toEqual([]);
      expect(defaultQueue.processing).toBeInstanceOf(Set);
    });

    test('should initialize with custom max workers', () => {
      const customQueue = new RevalidationQueue(4);
      expect(customQueue.maxWorkers).toBe(4);
    });

    test('should be an EventEmitter', () => {
      expect(queue).toBeInstanceOf(EventEmitter);
    });
  });

  describe('add', () => {
    test('should add normal priority job to end of queue', () => {
      queue.add('/route1', 'normal');
      queue.add('/route2', 'normal');

      expect(queue.queue).toHaveLength(2);
      expect(queue.queue[0].route).toBe('/route1');
      expect(queue.queue[1].route).toBe('/route2');
      expect(queue.queue[0].priority).toBe('normal');
      expect(queue.queue[1].priority).toBe('normal');
    });

    test('should add high priority job to front of queue', () => {
      queue.add('/route1', 'normal');
      queue.add('/route2', 'high');
      queue.add('/route3', 'normal');

      expect(queue.queue).toHaveLength(3);
      expect(queue.queue[0].route).toBe('/route2'); // High priority first
      expect(queue.queue[0].priority).toBe('high');
      expect(queue.queue[1].route).toBe('/route1');
      expect(queue.queue[2].route).toBe('/route3');
    });

    test('should avoid duplicate entries for same route', () => {
      queue.add('/route1', 'normal');
      queue.processing.add('/route1'); // Simulate already processing
      
      queue.add('/route1', 'normal'); // Should be ignored
      queue.add('/route1', 'high');   // Should be ignored

      expect(queue.queue).toHaveLength(0);
      expect(queue.processing.has('/route1')).toBe(true);
    });

    test('should include timestamp in job', () => {
      const beforeAdd = Date.now();
      queue.add('/route1', 'normal');
      const afterAdd = Date.now();

      expect(queue.queue[0].timestamp).toBeGreaterThanOrEqual(beforeAdd);
      expect(queue.queue[0].timestamp).toBeLessThanOrEqual(afterAdd);
    });

    test('should trigger processing when job added', () => {
      const processSpy = jest.spyOn(queue, 'process');
      
      queue.add('/route1', 'normal');
      
      expect(processSpy).toHaveBeenCalled();
      processSpy.mockRestore();
    });
  });

  describe('process', () => {
    test('should not process when max workers reached', async () => {
      // Fill up workers to max capacity
      queue.workers = [{ mock: 'worker1' }, { mock: 'worker2' }];
      
      queue.add('/route1', 'normal');
      
      await queue.process();
      
      expect(queue.queue).toHaveLength(1); // Job should remain in queue
    });

    test('should not process when queue is empty', async () => {
      expect(queue.queue).toHaveLength(0);
      
      await queue.process();
      
      expect(mockWorkers.size).toBe(0);
    });

    test('should create worker for job processing', async () => {
      queue.add('/test-route', 'normal');
      
      await waitFor(() => mockWorkers.size > 0, 1000);
      
      expect(mockWorkers.size).toBe(1);
      
      const workerData = Array.from(mockWorkerData.values())[0];
      expect(workerData.route).toBe('/test-route');
      expect(workerData.priority).toBe('normal');
    });

    test('should add route to processing set', async () => {
      queue.add('/processing-test', 'normal');
      
      await waitFor(() => queue.processing.has('/processing-test'), 1000);
      
      expect(queue.processing.has('/processing-test')).toBe(true);
    });

    test('should handle multiple jobs within worker limit', async () => {
      queue.add('/route1', 'normal');
      queue.add('/route2', 'normal');
      
      await waitFor(() => mockWorkers.size === 2, 1000);
      
      expect(mockWorkers.size).toBe(2);
      expect(queue.processing.has('/route1')).toBe(true);
      expect(queue.processing.has('/route2')).toBe(true);
    });

    test('should respect worker limit', async () => {
      // Add more jobs than worker limit
      queue.add('/route1', 'normal');
      queue.add('/route2', 'normal');
      queue.add('/route3', 'normal');
      
      await sleep(50); // Allow processing
      
      expect(mockWorkers.size).toBeLessThanOrEqual(2); // Should not exceed maxWorkers
      expect(queue.queue.length + queue.workers.length).toBe(3); // Total jobs should be 3
    });
  });

  describe('worker event handling', () => {
    test('should handle successful worker completion', async () => {
      const revalidatedSpy = jest.fn();
      queue.on('revalidated', revalidatedSpy);
      
      queue.add('/success-route', 'normal');
      
      await waitFor(() => revalidatedSpy.mock.calls.length > 0, 1000);
      
      expect(revalidatedSpy).toHaveBeenCalledWith({
        success: true,
        route: '/success-route',
        timestamp: expect.any(Number)
      });
      
      expect(queue.processing.has('/success-route')).toBe(false);
    });

    test('should handle worker errors', async () => {
      const errorSpy = jest.fn();
      queue.on('error', errorSpy);
      
      // Mock Worker to emit error
      const { Worker } = await import('worker_threads');
      const originalWorker = Worker;
      Worker.mockImplementationOnce((scriptPath, options) => {
        const worker = new EventEmitter();
        worker.postMessage = jest.fn();
        worker.terminate = jest.fn();
        
        setTimeout(() => {
          const error = new Error('Worker processing failed');
          worker.emit('error', error);
        }, 10);
        
        return worker;
      });
      
      queue.add('/error-route', 'normal');
      
      await waitFor(() => errorSpy.mock.calls.length > 0, 1000);
      
      expect(errorSpy).toHaveBeenCalledWith({
        route: '/error-route',
        error: expect.any(Error)
      });
      
      expect(queue.processing.has('/error-route')).toBe(false);
      
      // Restore original Worker
      Worker.mockImplementation(originalWorker);
    });

    test('should process next job when worker exits', async () => {
      // Add 3 jobs (more than worker limit)
      queue.add('/route1', 'normal');
      queue.add('/route2', 'normal');
      queue.add('/route3', 'normal');
      
      // Wait for initial processing
      await sleep(100);
      
      // Should have processed all 3 jobs eventually
      await waitFor(() => queue.queue.length === 0, 2000);
      
      expect(queue.queue).toHaveLength(0);
    });

    test('should remove worker from workers array on exit', async () => {
      queue.add('/exit-test', 'normal');
      
      // Wait for worker to be created and complete
      await waitFor(() => mockWorkers.size > 0, 1000);
      await sleep(50); // Allow exit event
      
      expect(queue.workers).toHaveLength(0);
    });
  });

  describe('clear', () => {
    test('should clear the job queue', () => {
      queue.add('/route1', 'normal');
      queue.add('/route2', 'high');
      
      expect(queue.queue).toHaveLength(2);
      
      queue.clear();
      
      expect(queue.queue).toHaveLength(0);
    });

    test('should not affect processing jobs', () => {
      queue.processing.add('/processing-route');
      queue.add('/queue-route', 'normal');
      
      queue.clear();
      
      expect(queue.queue).toHaveLength(0);
      expect(queue.processing.has('/processing-route')).toBe(true);
    });
  });

  describe('size', () => {
    test('should return queue size', () => {
      expect(queue.size()).toBe(0);
      
      queue.add('/route1', 'normal');
      expect(queue.size()).toBe(1);
      
      queue.add('/route2', 'high');
      expect(queue.size()).toBe(2);
      
      queue.clear();
      expect(queue.size()).toBe(0);
    });
  });

  describe('priority handling', () => {
    test('should process high priority jobs first', async () => {
      const completionOrder = [];
      
      queue.on('revalidated', (result) => {
        completionOrder.push(result.route);
      });
      
      // Add jobs in mixed priority order
      queue.add('/normal1', 'normal');
      queue.add('/high1', 'high');
      queue.add('/normal2', 'normal');
      queue.add('/high2', 'high');
      
      await waitFor(() => completionOrder.length === 4, 2000);
      
      // High priority jobs should complete first
      expect(completionOrder.slice(0, 2)).toEqual(
        expect.arrayContaining(['/high1', '/high2'])
      );
    });

    test('should maintain order within same priority', () => {
      queue.add('/normal1', 'normal');
      queue.add('/normal2', 'normal');
      queue.add('/high1', 'high');
      queue.add('/high2', 'high');
      
      const routes = queue.queue.map(job => job.route);
      
      // Should be: [high2, high1, normal1, normal2]
      // (high priority jobs at front, in reverse order of addition)
      expect(routes[0]).toBe('/high2');
      expect(routes[1]).toBe('/high1');
      expect(routes[2]).toBe('/normal1');
      expect(routes[3]).toBe('/normal2');
    });
  });

  describe('concurrent operations', () => {
    test('should handle concurrent job additions', async () => {
      const jobs = Array.from({ length: 20 }, (_, i) => `/concurrent-${i}`);
      
      // Add all jobs concurrently
      const addPromises = jobs.map(route => 
        Promise.resolve().then(() => queue.add(route, 'normal'))
      );
      
      await Promise.all(addPromises);
      
      expect(queue.size()).toBeLessThanOrEqual(20); // Some may have started processing
      expect(queue.queue.length + queue.processing.size).toBe(20);
    });

    test('should handle mixed priority concurrent additions', async () => {
      const normalJobs = Array.from({ length: 10 }, (_, i) => `/normal-${i}`);
      const highJobs = Array.from({ length: 5 }, (_, i) => `/high-${i}`);
      
      // Add all jobs concurrently with mixed priorities
      const promises = [
        ...normalJobs.map(route => queue.add(route, 'normal')),
        ...highJobs.map(route => queue.add(route, 'high'))
      ];
      
      await Promise.all(promises);
      
      // High priority jobs should be at front of remaining queue
      const highPriorityCount = queue.queue
        .filter(job => job.priority === 'high').length;
      
      expect(highPriorityCount).toBeGreaterThan(0);
      
      // First few jobs in queue should be high priority
      const frontJobs = queue.queue.slice(0, Math.min(3, queue.queue.length));
      expect(frontJobs.every(job => job.priority === 'high')).toBe(true);
    });
  });

  describe('performance', () => {
    test('should handle large queue efficiently', async () => {
      const jobCount = 100;
      const jobs = Array.from({ length: jobCount }, (_, i) => `/perf-test-${i}`);
      
      const { time } = await timer.measure('large-queue-add', () => {
        jobs.forEach(route => queue.add(route, 'normal'));
      });
      
      expect(time).toBeLessThan(100); // Should add 100 jobs in less than 100ms
      expect(queue.size()).toBeLessThanOrEqual(jobCount);
    });

    test('should process jobs within reasonable time', async () => {
      const testJobs = ['/perf1', '/perf2', '/perf3'];
      const completedJobs = [];
      
      queue.on('revalidated', (result) => {
        completedJobs.push(result.route);
      });
      
      const { time } = await timer.measure('job-processing', async () => {
        testJobs.forEach(route => queue.add(route, 'normal'));
        await waitFor(() => completedJobs.length === testJobs.length, 5000);
      });
      
      expect(time).toBeLessThan(1000); // Should complete within 1 second
      expect(completedJobs).toHaveLength(testJobs.length);
    });
  });

  describe('edge cases', () => {
    test('should handle routes with special characters', async () => {
      const specialRoute = '/test-route?param=value&other=123#fragment';
      
      queue.add(specialRoute, 'normal');
      
      await waitFor(() => mockWorkers.size > 0, 1000);
      
      const workerData = Array.from(mockWorkerData.values())[0];
      expect(workerData.route).toBe(specialRoute);
    });

    test('should handle empty route strings', () => {
      queue.add('', 'normal');
      
      expect(queue.queue).toHaveLength(1);
      expect(queue.queue[0].route).toBe('');
    });

    test('should handle very long route strings', () => {
      const longRoute = '/very-long-route-' + 'x'.repeat(1000);
      
      queue.add(longRoute, 'normal');
      
      expect(queue.queue).toHaveLength(1);
      expect(queue.queue[0].route).toBe(longRoute);
    });

    test('should handle invalid priority gracefully', () => {
      queue.add('/test-route', 'invalid-priority');
      
      expect(queue.queue).toHaveLength(1);
      expect(queue.queue[0].priority).toBe('invalid-priority');
      expect(queue.queue[0].route).toBe('/test-route');
    });
  });

  describe('memory management', () => {
    test('should not leak memory with many job additions', () => {
      const initialSize = queue.size();
      
      // Add and clear jobs multiple times
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 50; j++) {
          queue.add(`/test-${i}-${j}`, 'normal');
        }
        queue.clear();
      }
      
      expect(queue.size()).toBe(initialSize);
      expect(queue.queue).toHaveLength(0);
    });

    test('should clean up processing set properly', async () => {
      const routes = ['/cleanup1', '/cleanup2', '/cleanup3'];
      const completedRoutes = [];
      
      queue.on('revalidated', (result) => {
        completedRoutes.push(result.route);
      });
      
      routes.forEach(route => queue.add(route, 'normal'));
      
      await waitFor(() => completedRoutes.length === routes.length, 2000);
      
      // All routes should be removed from processing set
      routes.forEach(route => {
        expect(queue.processing.has(route)).toBe(false);
      });
    });
  });
});