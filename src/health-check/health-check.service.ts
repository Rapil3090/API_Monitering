import { Injectable } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class HealthCheckService {
    async checkSystemHealth() {
        const totalMemory = os.totalmem() / (1024 * 1024);
        const freeMemory = os.freemem() / (1024 * 1024);
        const usedMemory = totalMemory - freeMemory;
    
        const cpus = os.cpus();
        const loadAvg = os.loadavg();
    
        const now = new Date();
        const currentTime = now.toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul',
          hour12: false,
        });
    
        const healthData = {
          timestamp: currentTime,
          memory: {
            total: `${totalMemory.toFixed(2)} MB`,
            used: `${usedMemory.toFixed(2)} MB`,
            free: `${freeMemory.toFixed(2)} MB`,
          },
          cpu: {
            loadAverage: loadAvg.map((avg) => avg.toFixed(2)),
            cores: cpus.map((cpu, index) => {
              const times = cpu.times;
              const total = Object.values(times).reduce((acc, time) => acc + time, 0);
              const usage = ((total - times.idle) / total) * 100;
              return { core: index + 1, usage: `${usage.toFixed(2)}%` };
            }),
          },
          uptime: `${os.uptime()} seconds`,
        };
    
        return healthData;
      }
} 