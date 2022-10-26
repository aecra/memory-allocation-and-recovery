class FirstFit {
  constructor(ramSize) {
    ramSize = parseInt(ramSize);
    this.ramSize = ramSize;
    this.ramUnused = [{ start: 0, end: ramSize }];
    this.ramUsed = [];
    this.processes = [];
    console.log("First Fit algorithm initialized");
  }

  /**
   * 分配内存
   * @param {number} pid
   * @returns {boolean} true if process was allocated, false otherwise
   */
  allocate(size) {
    // if size is string, string to number
    size = parseInt(size);
    if (size <= 0) {
      return false;
    }
    const block = this.ramUnused
      .sort((a, b) => a.start - b.start)
      .find((block) => block.end - block.start >= size);
    if (block) {
      const index = this.ramUnused.indexOf(block);
      if (block.end - block.start > size) {
        this.ramUnused[index] = { start: block.start + size, end: block.end };
      } else {
        this.ramUnused.splice(index, 1);
      }
      // pid = max pid + 1 and should not depend this.processes is sorted,
      // use reduce to find max pid
      const pid =
        this.processes.reduce(
          (max, process) => (process.pid > max ? process.pid : max),
          0
        ) + 1;
      this.ramUsed.push({ start: block.start, end: block.start + size, pid });
      this.processes.push({ pid, size });
      return true;
    }
    return false;
  }

  /**
   * 释放内存
   * @param {number} pid
   * @returns {boolean} true if process was freed, false otherwise
   */
  free(pid) {
    pid = parseInt(pid);
    const process = this.processes.find((process) => process.pid === pid);
    if (process) {
      const index = this.processes.indexOf(process);
      this.processes.splice(index, 1);
      const block = this.ramUsed.find((block) => block.pid === pid);
      const blockIndex = this.ramUsed.indexOf(block);
      this.ramUsed.splice(blockIndex, 1);
      block.pid = null;
      this.ramUnused.push(block);
      this.ramUnused.sort((a, b) => a.start - b.start);
      // 合并连续的内存
      for (let i = 0; i < this.ramUnused.length - 1; i++) {
        if (this.ramUnused[i].end === this.ramUnused[i + 1].start) {
          this.ramUnused[i].end = this.ramUnused[i + 1].end;
          this.ramUnused.splice(i + 1, 1);
          i--;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * 获取进程表
   * @returns {Array} 进程表
   * @example [{ pid: 1, size: 100 }, { pid: 2, size: 100 }]
   */
  getProcesses() {
    return this.processes;
  }

  /**
   * 获取内存分配情况
   * @returns {Array} 内存分配情况
   * @example
   * [
   *   { start: 0, end: 100, pid: 1 },
   *   { start: 100, end: 200, pid: 2 },
   *   { start: 200, end: 400, pid: null }
   * ]
   * pid 为 null 表示该内存块未被分配，否则为分配给进程的 pid，
   * start 和 end 为内存块的起始地址和结束地址，
   * 该数组应该按照 start 从小到大排序。
   */
  getDistributionStats() {
    const distribution = [...this.ramUnused, ...this.ramUsed];
    distribution.sort((a, b) => a.start - b.start);
    distribution.forEach((block) => {
      if (block.pid === undefined) {
        block.pid = null;
      }
    });
    return distribution;
  }

  /**
   *  获取内部碎片
   * @returns {Object} 内部碎片
   * @example
   * { requested: 95, allocated: 100 }
   */
  getInternalMemoryFragmentation() {
    const used = this.ramUsed.reduce(
      (sum, block) => sum + block.end - block.start,
      0
    );
    return { requested: used, allocated: used };
  }

  /**
   * 获取外部碎片
   * @returns {Object} 外部碎片
   * @example
   * { allocated: 55, total: 100 }
   */
  getExternalMemoryFragmentation() {
    const used = this.ramUsed.reduce(
      (sum, block) => sum + block.end - block.start,
      0
    );
    return { allocated: used, total: this.ramSize };
  }

  /**
   * 内存使用情况
   * @returns {Object} 内存使用情况
   * @example
   * { requested: 100, total: 100 }
   */
  getMemoryUsage() {
    const used = this.ramUsed.reduce(
      (sum, block) => sum + block.end - block.start,
      0
    );
    return { requested: used, total: this.ramSize };
  }
}

class BestFit {
  constructor(ramSize) {
    ramSize = parseInt(ramSize);
    this.ramSize = ramSize;
    this.ramUnused = [{ start: 0, end: ramSize }];
    this.ramUsed = [];
    this.processes = [];
    console.log("Best Fit algorithm initialized");
  }

  /**
   * 分配内存
   * @param {number} pid
   * @returns {boolean} true if process was allocated, false otherwise
   */
  allocate(size) {
    // if size is string, string to number
    size = parseInt(size);
    if (size <= 0) {
      return false;
    }
    const blocks = this.ramUnused.filter(
      (block) => block.end - block.start >= size
    );
    if (blocks) {
      const block = blocks.reduce((min, block) =>
        block.end - block.start < min.end - min.start ? block : min
      );
      const index = this.ramUnused.indexOf(block);
      if (block.end - block.start > size) {
        this.ramUnused[index] = { start: block.start + size, end: block.end };
      } else {
        this.ramUnused.splice(index, 1);
      }
      // pid = max pid + 1 and should not depend this.processes is sorted,
      // use reduce to find max pid
      const pid =
        this.processes.reduce(
          (max, process) => (process.pid > max ? process.pid : max),
          0
        ) + 1;
      this.ramUsed.push({ start: block.start, end: block.start + size, pid });
      this.processes.push({ pid, size });
      return true;
    }
    return false;
  }

  /**
   * 释放内存
   * @param {number} pid
   * @returns {boolean} true if process was freed, false otherwise
   */
  free(pid) {
    pid = parseInt(pid);
    const process = this.processes.find((process) => process.pid === pid);
    if (process) {
      const index = this.processes.indexOf(process);
      this.processes.splice(index, 1);
      const block = this.ramUsed.find((block) => block.pid === pid);
      const blockIndex = this.ramUsed.indexOf(block);
      this.ramUsed.splice(blockIndex, 1);
      block.pid = null;
      this.ramUnused.push(block);
      this.ramUnused.sort((a, b) => a.start - b.start);
      // 合并连续的内存
      for (let i = 0; i < this.ramUnused.length - 1; i++) {
        if (this.ramUnused[i].end === this.ramUnused[i + 1].start) {
          this.ramUnused[i].end = this.ramUnused[i + 1].end;
          this.ramUnused.splice(i + 1, 1);
          i--;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * 获取进程表
   * @returns {Array} 进程表
   * @example [{ pid: 1, size: 100 }, { pid: 2, size: 100 }]
   */
  getProcesses() {
    return this.processes;
  }

  /**
   * 获取内存分配情况
   * @returns {Array} 内存分配情况
   * @example
   * [
   *   { start: 0, end: 100, pid: 1 },
   *   { start: 100, end: 200, pid: 2 },
   *   { start: 200, end: 400, pid: null }
   * ]
   * pid 为 null 表示该内存块未被分配，否则为分配给进程的 pid，
   * start 和 end 为内存块的起始地址和结束地址，
   * 该数组应该按照 start 从小到大排序。
   */
  getDistributionStats() {
    const distribution = [...this.ramUnused, ...this.ramUsed];
    distribution.sort((a, b) => a.start - b.start);
    distribution.forEach((block) => {
      if (block.pid === undefined) {
        block.pid = null;
      }
    });
    return distribution;
  }

  /**
   *  获取内部碎片
   * @returns {Object} 内部碎片
   * @example
   * { requested: 95, allocated: 100 }
   */
  getInternalMemoryFragmentation() {
    const used = this.ramUsed.reduce(
      (sum, block) => sum + block.end - block.start,
      0
    );
    return { requested: used, allocated: used };
  }

  /**
   * 获取外部碎片
   * @returns {Object} 外部碎片
   * @example
   * { allocated: 55, total: 100 }
   */
  getExternalMemoryFragmentation() {
    const used = this.ramUsed.reduce(
      (sum, block) => sum + block.end - block.start,
      0
    );
    return { allocated: used, total: this.ramSize };
  }

  /**
   * 内存使用情况
   * @returns {Object} 内存使用情况
   * @example
   * { requested: 100, total: 100 }
   */
  getMemoryUsage() {
    const used = this.ramUsed.reduce(
      (sum, block) => sum + block.end - block.start,
      0
    );
    return { requested: used, total: this.ramSize };
  }
}

class WorstFit {
  constructor(ramSize) {
    ramSize = parseInt(ramSize);
    this.ramSize = ramSize;
    this.ramUnused = [{ start: 0, end: ramSize }];
    this.ramUsed = [];
    this.processes = [];
    console.log("Worst Fit algorithm initialized");
  }

  /**
   * 分配内存
   * @param {number} pid
   * @returns {boolean} true if process was allocated, false otherwise
   */
  allocate(size) {
    // if size is string, string to number
    size = parseInt(size);
    if (size <= 0) {
      return false;
    }
    const block = this.ramUnused
      .sort((a, b) => b.end - b.start - (a.end - a.start))
      .find((block) => block.end - block.start >= size);
    if (block) {
      const index = this.ramUnused.indexOf(block);
      if (block.end - block.start > size) {
        this.ramUnused[index] = { start: block.start + size, end: block.end };
      } else {
        this.ramUnused.splice(index, 1);
      }
      // pid = max pid + 1 and should not depend this.processes is sorted,
      // use reduce to find max pid
      const pid =
        this.processes.reduce(
          (max, process) => (process.pid > max ? process.pid : max),
          0
        ) + 1;
      this.ramUsed.push({ start: block.start, end: block.start + size, pid });
      this.processes.push({ pid, size });
      return true;
    }
    return false;
  }

  /**
   * 释放内存
   * @param {number} pid
   * @returns {boolean} true if process was freed, false otherwise
   */
  free(pid) {
    pid = parseInt(pid);
    const process = this.processes.find((process) => process.pid === pid);
    if (process) {
      const index = this.processes.indexOf(process);
      this.processes.splice(index, 1);
      const block = this.ramUsed.find((block) => block.pid === pid);
      const blockIndex = this.ramUsed.indexOf(block);
      this.ramUsed.splice(blockIndex, 1);
      block.pid = null;
      this.ramUnused.push(block);
      this.ramUnused.sort((a, b) => a.start - b.start);
      // 合并连续的内存
      for (let i = 0; i < this.ramUnused.length - 1; i++) {
        if (this.ramUnused[i].end === this.ramUnused[i + 1].start) {
          this.ramUnused[i].end = this.ramUnused[i + 1].end;
          this.ramUnused.splice(i + 1, 1);
          i--;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * 获取进程表
   * @returns {Array} 进程表
   * @example [{ pid: 1, size: 100 }, { pid: 2, size: 100 }]
   */
  getProcesses() {
    return this.processes;
  }

  /**
   * 获取内存分配情况
   * @returns {Array} 内存分配情况
   * @example
   * [
   *   { start: 0, end: 100, pid: 1 },
   *   { start: 100, end: 200, pid: 2 },
   *   { start: 200, end: 400, pid: null }
   * ]
   * pid 为 null 表示该内存块未被分配，否则为分配给进程的 pid，
   * start 和 end 为内存块的起始地址和结束地址，
   * 该数组应该按照 start 从小到大排序。
   */
  getDistributionStats() {
    const distribution = [...this.ramUnused, ...this.ramUsed];
    distribution.sort((a, b) => a.start - b.start);
    distribution.forEach((block) => {
      if (block.pid === undefined) {
        block.pid = null;
      }
    });
    return distribution;
  }

  /**
   *  获取内部碎片
   * @returns {Object} 内部碎片
   * @example
   * { requested: 95, allocated: 100 }
   */
  getInternalMemoryFragmentation() {
    const used = this.ramUsed.reduce(
      (sum, block) => sum + block.end - block.start,
      0
    );
    return { requested: used, allocated: used };
  }

  /**
   * 获取外部碎片
   * @returns {Object} 外部碎片
   * @example
   * { allocated: 55, total: 100 }
   */
  getExternalMemoryFragmentation() {
    const used = this.ramUsed.reduce(
      (sum, block) => sum + block.end - block.start,
      0
    );
    return { allocated: used, total: this.ramSize };
  }

  /**
   * 内存使用情况
   * @returns {Object} 内存使用情况
   * @example
   * { requested: 100, total: 100 }
   */
  getMemoryUsage() {
    const used = this.ramUsed.reduce(
      (sum, block) => sum + block.end - block.start,
      0
    );
    return { requested: used, total: this.ramSize };
  }
}

class TwoLevelSegregatedFit {
  constructor(ramSize) {
    ramSize = parseInt(ramSize);
    this.firstLevel = [];
    for (
      let i = 4, grandTotal = 0;
      grandTotal + Math.pow(2, i) < ramSize;
      grandTotal += Math.pow(2, i), i++
    ) {
      let secondLevel = {
        full: false,
        partSize: Math.pow(2, i) / 4,
        blocks: [],
      };
      for (let j = 0; j < 4; j++) {
        secondLevel.blocks.push({
          start: grandTotal + (j * Math.pow(2, i)) / 4,
          end: grandTotal + ((j + 1) * Math.pow(2, i)) / 4,
          requested: 0,
          pid: null,
        });
      }
      this.firstLevel.push(secondLevel);
    }
    this.pid = 0;
    this.wastedRam =
      ramSize -
      this.firstLevel.reduce(
        (sum, secondLevel) => sum + secondLevel.partSize * 4,
        0
      );
    console.log("Two Level Segregated Fit initialized");
  }

  /**
   * 分配内存
   * @param {number} pid
   * @returns {boolean} true if process was allocated, false otherwise
   */
  allocate(size) {
    size = parseInt(size);
    let secondLevel = this.firstLevel.find(
      (secondLevel) => secondLevel.partSize >= size && !secondLevel.full
    );
    if (secondLevel) {
      let block = secondLevel.blocks.find((block) => block.pid === null);
      block.requested = size;
      block.pid = ++this.pid;
      // if secondLevel is full, set full to true
      if (secondLevel.blocks.every((block) => block.pid !== null)) {
        secondLevel.full = true;
      }
      return true;
    }
    return false;
  }

  /**
   * 释放内存
   * @param {number} pid
   * @returns {boolean} true if process was freed, false otherwise
   */
  free(pid) {
    pid = parseInt(pid);
    let secondLevel = this.firstLevel.find((secondLevel) =>
      secondLevel.blocks.some((block) => block.pid === pid)
    );
    if (secondLevel) {
      let block = secondLevel.blocks.find((block) => block.pid === pid);
      block.requested = 0;
      block.pid = null;
      secondLevel.full = false;
      return true;
    }
    return false;
  }

  /**
   * 获取进程表
   * @returns {Array} 进程表
   * @example [{ pid: 1, size: 100 }, { pid: 2, size: 100 }]
   */
  getProcesses() {
    let processes = [];
    this.firstLevel.forEach((secondLevel) => {
      secondLevel.blocks.forEach((block) => {
        if (block.pid !== null) {
          processes.push({ pid: block.pid, size: block.end - block.start });
        }
      });
    });
    return processes;
  }

  /**
   * 获取内存分配情况
   * @returns {Array} 内存分配情况
   * @example
   * [
   *   { start: 0, end: 100, pid: 1 },
   *   { start: 100, end: 200, pid: 2 },
   *   { start: 200, end: 400, pid: null }
   * ]
   * pid 为 null 表示该内存块未被分配，否则为分配给进程的 pid，
   * start 和 end 为内存块的起始地址和结束地址，
   * 该数组应该按照 start 从小到大排序。
   */
  getDistributionStats() {
    let distribution = [];
    this.firstLevel.forEach((secondLevel) => {
      secondLevel.blocks.forEach((block) => {
        distribution.push({
          start: block.start,
          end: block.end,
          pid: block.pid,
        });
      });
    });
    // add wasted ram
    distribution.push({
      start: distribution[distribution.length - 1].end,
      end: distribution[distribution.length - 1].end + this.wastedRam,
      pid: null,
    });
    return distribution;
  }

  /**
   *  获取内部碎片
   * @returns {Object} 内部碎片
   * @example
   * { requested: 95, allocated: 100 }
   */
  getInternalMemoryFragmentation() {
    let requested = 0;
    let allocated = 0;
    this.firstLevel.forEach((secondLevel) => {
      secondLevel.blocks.forEach((block) => {
        if (block.pid !== null) {
          requested += block.requested;
          allocated += block.end - block.start;
        }
      });
    });
    return { requested, allocated };
  }

  /**
   * 获取外部碎片
   * @returns {Object} 外部碎片
   * @example
   * { allocated: 55, total: 100 }
   */
  getExternalMemoryFragmentation() {
    let total = this.firstLevel.reduce(
      (sum, secondLevel) => sum + secondLevel.partSize * 4,
      0
    );
    return { allocated: total, total: total + this.wastedRam };
  }

  /**
   * 内存使用情况
   * @returns {Object} 内存使用情况
   * @example
   * { requested: 100, total: 100 }
   */
  getMemoryUsage() {
    let requested = 0;
    this.firstLevel.forEach((secondLevel) => {
      secondLevel.blocks.forEach((block) => {
        if (block.pid !== null) {
          requested += block.requested;
        }
      });
    });
    return {
      requested,
      total:
        this.firstLevel.reduce(
          (sum, secondLevel) => sum + secondLevel.partSize * 4,
          0
        ) + this.wastedRam,
    };
  }
}

class Paging {
  constructor(ramSize) {
    this.pageSize = 4;
    this.ramSize = parseInt(parseInt(ramSize) / this.pageSize) * this.pageSize;
    this.wastedRam = parseInt(ramSize) - this.ramSize;
    this.pageCount = parseInt(this.ramSize / this.pageSize);
    this.sparePageCount = this.pageCount;
    this.pageTable = new Array(this.pageCount);
    this.pageTable.fill(0);
    this.requested = 0;
    this.processes = [];
    console.log("Paging algorithm initialized");
  }

  /**
   * 分配内存
   * @param {number} pid
   * @returns {boolean} true if process was allocated, false otherwise
   */
  allocate(size) {
    // if size is string, string to number
    size = parseInt(size);
    if (size <= 0) {
      return false;
    }
    const pageNum =
      parseInt(size / this.pageSize) + (size % this.pageSize != 0);
    if (pageNum < this.sparePageCount) {
      this.requested += size;
      let n = pageNum;
      const pages = [];
      for (let i = 0; i < this.pageCount; i++) {
        if (!this.pageTable[i]) {
          this.pageTable[i] = 1;
          pages.push(i);
          n--;
        }
        if (n == 0) break;
      }
      this.sparePageCount -= pageNum;
      const pid =
        this.processes.reduce(
          (max, process) => (process.pid > max ? process.pid : max),
          0
        ) + 1;
      this.processes.push({
        pid,
        size: pageNum * this.pageSize,
        req: size,
        pages,
      });
      return true;
    }
    return false;
  }

  /**
   * 释放内存
   * @param {number} pid
   * @returns {boolean} true if process was freed, false otherwise
   */
  free(pid) {
    pid = parseInt(pid);
    const process = this.processes.find((process) => process.pid === pid);
    if (process) {
      const index = this.processes.indexOf(process);
      this.processes.splice(index, 1);
      process.pages.forEach((page) => (this.pageTable[page] = 0));
      this.sparePageCount += process.pages.length;
      this.requested -= process.req;
      return true;
    }
    return false;
  }

  /**
   * 获取进程表
   * @returns {Array} 进程表
   * @example [{ pid: 1, size: 100 }, { pid: 2, size: 100 }]
   */
  getProcesses() {
    return this.processes;
  }

  /**
   * 获取内存分配情况
   * @returns {Array} 内存分配情况
   * @example
   * [
   *   { start: 0, end: 100, pid: 1 },
   *   { start: 100, end: 200, pid: 2 },
   *   { start: 200, end: 400, pid: null }
   * ]
   * pid 为 null 表示该内存块未被分配，否则为分配给进程的 pid，
   * start 和 end 为内存块的起始地址和结束地址，
   * 该数组应该按照 start 从小到大排序。
   */
  getDistributionStats() {
    const distribution = [];
    this.pageTable.forEach((_, index) =>
      distribution.push({ start: index * 4, end: index * 4 + 4, pid: null })
    );
    this.processes.forEach((process) => {
      const pid = process.pid;
      process.pages.forEach((page) => {
        distribution[page].pid = pid;
      });
    });
    //console.log(distribution);
    return distribution;
  }

  /**
   *  获取内部碎片
   * @returns {Object} 内部碎片
   * @example
   * { requested: 95, allocated: 100 }
   */
  getInternalMemoryFragmentation() {
    return {
      requested: this.requested,
      allocated: (this.pageCount - this.sparePageCount) * this.pageSize,
    };
  }

  /**
   * 获取外部碎片
   * @returns {Object} 外部碎片
   * @example
   * { allocated: 55, total: 100 }
   */
  getExternalMemoryFragmentation() {
    return {
      allocated: this.wastedRam,
      total: this.ramSize + this.wastedRam,
    };
  }

  /**
   * 内存使用情况
   * @returns {Object} 内存使用情况
   * @example
   * { requested: 100, total: 100 }
   */
  getMemoryUsage() {
    return { requested: this.requested, total: this.ramSize };
  }
}

class BuddySystem {
  constructor(ramSize) {
    ramSize = parseInt(ramSize);
    let i = 0;
    while (1 << (i + 1) <= ramSize) i++;
    this.ramSize = ramSize;
    this.aeraNum = i + 1;
    this.ramUnused = new Array(this.aeraNum);
    let pre = 0;
    for (i = 0; i < this.aeraNum; i++) {
      this.ramUnused[i] = new Array();
      if ((1 << i) & ramSize) {
        this.ramUnused[i].push({ start: pre, end: pre + (1 << i) });
        pre += 1 << i;
      }
    }
    this.ramUsed = [];
    this.processes = [];
    console.log("BuddySystem algorithm initialized");
  }

  allocateMem(k, h) {
    if (h >= this.aeraNum) return null;

    if (this.ramUnused[h].length > 0) {
      const block = this.ramUnused[h][0];
      this.ramUnused[h].splice(0, 1);
      return block;
    } else {
      const block = this.allocateMem(k, h + 1);
      if (block === null) return null;
      const mid = parseInt((block.start + block.end) / 2);
      this.ramUnused[h].push({ start: mid, end: block.end });
      return { start: block.start, end: mid };
    }
  }

  freeMem(block, h) {
    const buddyBlock = this.ramUnused[h].find(
      (b) =>
        b.end - b.start === block.end - block.start &&
        (b.start === block.end || b.end === block.start)
    );
    if (buddyBlock) {
      const start = Math.min(block.start, buddyBlock.start);
      const end = Math.max(block.end, buddyBlock.end);
      const index = this.ramUnused[h].indexOf(buddyBlock);
      this.ramUnused[h].splice(index, 1);
      this.freeMem({ start, end }, h + 1);
    } else {
      this.ramUnused[h].push(block);
    }
  }

  /**
   * 分配内存
   * @param {number} pid
   * @returns {boolean} true if process was allocated, false otherwise
   */
  allocate(size) {
    // if size is string, string to number
    size = parseInt(size);
    if (size <= 0) {
      return false;
    }
    let k = 0;
    while (1 << k < size) k++;
    const block = this.allocateMem(k, k);
    if (block) {
      const pid =
        this.processes.reduce(
          (max, process) => (process.pid > max ? process.pid : max),
          0
        ) + 1;
      this.ramUsed.push({ ...block, pid, requested: size });
      this.processes.push({ pid, size: block.end - block.start });
      return true;
    }
    return false;
  }

  /**
   * 释放内存
   * @param {number} pid
   * @returns {boolean} true if process was freed, false otherwise
   */
  free(pid) {
    pid = parseInt(pid);
    const process = this.processes.find((process) => process.pid === pid);
    if (process) {
      let index = this.processes.indexOf(process);
      this.processes.splice(index, 1);
      // if only once allocate
      const block = this.ramUsed.find((block) => block.pid === pid);
      let h = 0;
      while (1 << h < block.end - block.start) h++;
      this.freeMem({ start: block.start, end: block.end }, h);
      index = this.ramUsed.indexOf(block);
      this.ramUsed.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 获取进程表
   * @returns {Array} 进程表
   * @example [{ pid: 1, size: 100 }, { pid: 2, size: 100 }]
   */
  getProcesses() {
    return this.processes;
  }

  /**
   * 获取内存分配情况
   * @returns {Array} 内存分配情况
   * @example
   * [
   *   { start: 0, end: 100, pid: 1 },
   *   { start: 100, end: 200, pid: 2 },
   *   { start: 200, end: 400, pid: null }
   * ]
   * pid 为 null 表示该内存块未被分配，否则为分配给进程的 pid，
   * start 和 end 为内存块的起始地址和结束地址，
   * 该数组应该按照 start 从小到大排序。
   */
  getDistributionStats() {
    const distribution = [];
    for (let i = 0; i < this.aeraNum; i++) {
      distribution.push(...this.ramUnused[i]);
    }
    distribution.push(...this.ramUsed);
    distribution.forEach((block) => {
      if (block.pid === undefined) {
        block.pid = null;
      }
    });
    distribution.sort((a, b) => a.start - b.start);
    return distribution;
  }

  /**
   *  获取内部碎片
   * @returns {Object} 内部碎片
   * @example
   * { requested: 95, allocated: 100 }
   */
  getInternalMemoryFragmentation() {
    const requested = this.ramUsed.reduce(
      (req, block) => req + block.requested,
      0
    );
    const allocated = this.ramUsed.reduce(
      (all, block) => all + block.end - block.start,
      0
    );
    return {
      requested,
      allocated,
    };
  }

  /**
   * 获取外部碎片
   * @returns {Object} 外部碎片
   * @example
   * { allocated: 55, total: 100 }
   */
  getExternalMemoryFragmentation() {
    return {
      allocated: this.ramSize,
      total: this.ramSize,
    };
  }

  /**
   * 内存使用情况
   * @returns {Object} 内存使用情况
   * @example
   * { requested: 100, total: 100 }
   */
  getMemoryUsage() {
    const requested = this.ramUsed.reduce(
      (req, block) => req + block.requested,
      0
    );
    return { requested, total: this.ramSize };
  }
}
