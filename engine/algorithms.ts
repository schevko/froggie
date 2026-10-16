// Core High-Performance Algorithms inspired by REA analysis of Screaming Frog v24.3.0:
// 1. FastBitSet (SparseBitSet / RoaringBitmap equivalent for O(1) tab & filter intersections)
// 2. AhoCorasick Automaton (aho-corasick-double-array-trie equivalent for O(n) Custom Search)
// 3. MinHash Shingle Engine (minhash-0.5.0 equivalent for Near-Duplicate content detection)
// 4. SERP Pixel Width Estimator (Google Title 561px / Meta Description 985px)
// 5. Robots.txt Parser & Matcher

export class FastBitSet {
  private words: Uint32Array;
  private sizeCounter = 0;

  constructor(initialCapacityBits = 16384) {
    this.words = new Uint32Array(Math.ceil(initialCapacityBits / 32));
  }

  private ensureCapacity(bitIndex: number) {
    const wordIndex = bitIndex >>> 5;
    if (wordIndex >= this.words.length) {
      let newLen = this.words.length || 64;
      while (newLen <= wordIndex) newLen *= 2;
      const next = new Uint32Array(newLen);
      next.set(this.words);
      this.words = next;
    }
  }

  add(bitIndex: number): void {
    this.ensureCapacity(bitIndex);
    const wordIndex = bitIndex >>> 5;
    const mask = 1 << (bitIndex & 31);
    if ((this.words[wordIndex] & mask) === 0) {
      this.words[wordIndex] |= mask;
      this.sizeCounter++;
    }
  }

  remove(bitIndex: number): void {
    const wordIndex = bitIndex >>> 5;
    if (wordIndex >= this.words.length) return;
    const mask = 1 << (bitIndex & 31);
    if ((this.words[wordIndex] & mask) !== 0) {
      this.words[wordIndex] &= ~mask;
      this.sizeCounter--;
    }
  }

  has(bitIndex: number): boolean {
    const wordIndex = bitIndex >>> 5;
    if (wordIndex >= this.words.length) return false;
    return (this.words[wordIndex] & (1 << (bitIndex & 31))) !== 0;
  }

  count(): number {
    return this.sizeCounter;
  }

  clear(): void {
    this.words.fill(0);
    this.sizeCounter = 0;
  }

  and(other: FastBitSet): FastBitSet {
    const minLen = Math.min(this.words.length, other.words.length);
    const res = new FastBitSet(minLen * 32);
    let total = 0;
    for (let i = 0; i < minLen; i++) {
      const w = this.words[i] & other.words[i];
      res.words[i] = w;
      if (w !== 0) total += popcount32(w);
    }
    res.sizeCounter = total;
    return res;
  }

  toArray(limit = 50000, offset = 0): number[] {
    const out: number[] = [];
    let skipped = 0;
    for (let i = 0; i < this.words.length; i++) {
      let w = this.words[i];
      if (w === 0) continue;
      const base = i << 5;
      while (w !== 0) {
        const t = w & -w;
        const bit = 31 - Math.clz32(t);
        if (skipped < offset) {
          skipped++;
        } else {
          out.push(base + bit);
          if (out.length >= limit) return out;
        }
        w ^= t;
      }
    }
    return out;
  }
}

function popcount32(v: number): number {
  v = v - ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

// Aho-Corasick Automaton for Multi-Pattern Custom Search in O(N)
export interface CustomSearchRule {
  id: string;
  name: string;
  pattern: string;
  mode: "contains" | "does_not_contain" | "regex";
  scope: "html" | "text";
  caseSensitive?: boolean;
}

interface TrieNode {
  next: Map<string, number>;
  fail: number;
  outputs: string[]; // rule IDs matched
}

export class AhoCorasickEngine {
  private nodes: TrieNode[] = [{ next: new Map(), fail: 0, outputs: [] }];
  private compiled = false;

  addPattern(ruleId: string, pattern: string) {
    if (!pattern) return;
    const norm = pattern.toLowerCase();
    let curr = 0;
    for (const ch of norm) {
      let nextIdx = this.nodes[curr].next.get(ch);
      if (nextIdx === undefined) {
        nextIdx = this.nodes.length;
        this.nodes.push({ next: new Map(), fail: 0, outputs: [] });
        this.nodes[curr].next.set(ch, nextIdx);
      }
      curr = nextIdx;
    }
    if (!this.nodes[curr].outputs.includes(ruleId)) {
      this.nodes[curr].outputs.push(ruleId);
    }
    this.compiled = false;
  }

  buildFailureLinks() {
    const queue: number[] = [];
    for (const [, nextIdx] of this.nodes[0].next) {
      this.nodes[nextIdx].fail = 0;
      queue.push(nextIdx);
    }
    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const [ch, v] of this.nodes[u].next) {
        queue.push(v);
        let f = this.nodes[u].fail;
        while (f > 0 && !this.nodes[f].next.has(ch)) {
          f = this.nodes[f].fail;
        }
        const failTarget = this.nodes[f].next.get(ch) ?? 0;
        this.nodes[v].fail = failTarget;
        if (this.nodes[failTarget].outputs.length > 0) {
          this.nodes[v].outputs.push(...this.nodes[failTarget].outputs);
        }
      }
    }
    this.compiled = true;
  }

  searchCounts(text: string): Map<string, number> {
    if (!this.compiled) this.buildFailureLinks();
    const counts = new Map<string, number>();
    if (this.nodes.length <= 1 || !text) return counts;
    const norm = text.toLowerCase();
    let curr = 0;
    for (const ch of norm) {
      while (curr > 0 && !this.nodes[curr].next.has(ch)) {
        curr = this.nodes[curr].fail;
      }
      curr = this.nodes[curr].next.get(ch) ?? 0;
      const outs = this.nodes[curr].outputs;
      for (let i = 0; i < outs.length; i++) {
        const id = outs[i];
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    return counts;
  }
}

// MinHash Engine (64 hash functions over 3-word shingles) for Near-Duplicate Content Analysis
const NUM_HASHES = 64;
const HASH_COEFFS_A = new Uint32Array(NUM_HASHES);
const HASH_COEFFS_B = new Uint32Array(NUM_HASHES);
const LARGE_PRIME = 4294967291;

(() => {
  let seed = 0x9e3779b9;
  const nextRand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) || 1;
  };
  for (let i = 0; i < NUM_HASHES; i++) {
    HASH_COEFFS_A[i] = nextRand() | 1;
    HASH_COEFFS_B[i] = nextRand();
  }
})();

function fnv1a32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export class MinHashEngine {
  static computeSignature(text: string): Uint32Array | null {
    const words = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]+/gu, " ")
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 1);

    if (words.length < 12) return null; // Too little content for near-duplicate comparison

    const sig = new Uint32Array(NUM_HASHES);
    sig.fill(0xffffffff);

    const shingleCount = Math.max(1, words.length - 2);
    for (let i = 0; i < shingleCount; i++) {
      const shingle = `${words[i]} ${words[i + 1] ?? ""} ${words[i + 2] ?? ""}`;
      const baseHash = fnv1a32(shingle);
      for (let h = 0; h < NUM_HASHES; h++) {
        const hv = (Math.imul(HASH_COEFFS_A[h], baseHash) + HASH_COEFFS_B[h]) >>> 0;
        if (hv < sig[h]) sig[h] = hv;
      }
    }
    return sig;
  }

  static similarity(sigA: Uint32Array, sigB: Uint32Array): number {
    let matches = 0;
    for (let i = 0; i < NUM_HASHES; i++) {
      if (sigA[i] === sigB[i]) matches++;
    }
    return Math.round((matches / NUM_HASHES) * 100);
  }
}

// SERP Pixel Width Estimator (Google 20px Arial for Titles, 14px Arial for Meta Desc)
export function estimateSerpPixelWidth(text: string, type: "title" | "description"): number {
  if (!text) return 0;
  const scale = type === "title" ? 1.0 : 0.7;
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ("iIl1|!.,;:'`".includes(ch)) width += 5;
    else if ("fjtJr()[]{}\"-".includes(ch)) width += 7;
    else if ("mwMW@%&QOGD".includes(ch)) width += 15;
    else if (ch >= "A" && ch <= "Z") width += 12;
    else if (ch === " ") width += 5;
    else width += 9.5;
  }
  return Math.round(width * scale);
}

// Robots.txt Parser & Matcher
export interface RobotsRule {
  pattern: string;
  allow: boolean;
  regex: RegExp;
}

export class RobotsTxtParser {
  public rules: RobotsRule[] = [];
  public sitemaps: string[] = [];
  public rawContent = "";

  constructor(rawTxt: string, userAgent = "*") {
    this.rawContent = rawTxt || "";
    this.parse(rawTxt, userAgent.toLowerCase());
  }

  private parse(raw: string, targetUa: string) {
    if (!raw) return;
    const lines = raw.split(/\r?\n/);
    let currentAgents: string[] = [];
    let seenRuleInGroup = false;

    const specificRules: RobotsRule[] = [];
    const wildcardRules: RobotsRule[] = [];

    for (const rawLine of lines) {
      const line = rawLine.split("#")[0].trim();
      if (!line) {
        currentAgents = [];
        seenRuleInGroup = false;
        continue;
      }
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const field = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();

      if (field === "sitemap") {
        if (value) this.sitemaps.push(value);
        continue;
      }

      if (field === "user-agent") {
        if (seenRuleInGroup) {
          currentAgents = [];
          seenRuleInGroup = false;
        }
        currentAgents.push(value.toLowerCase());
      } else if (field === "disallow" || field === "allow") {
        seenRuleInGroup = true;
        if (!value) continue;
        const rule = this.compileRule(value, field === "allow");
        if (currentAgents.some((ua) => targetUa.includes(ua) && ua !== "*")) {
          specificRules.push(rule);
        } else if (currentAgents.includes("*")) {
          wildcardRules.push(rule);
        }
      }
    }

    this.rules = specificRules.length > 0 ? specificRules : wildcardRules;
  }

  private compileRule(pattern: string, allow: boolean): RobotsRule {
    let escaped = pattern
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*");
    if (pattern.endsWith("$")) {
      escaped = escaped.slice(0, -2) + "$";
    }
    return {
      pattern,
      allow,
      regex: new RegExp("^" + escaped),
    };
  }

  isAllowed(urlOrPath: string): boolean {
    if (this.rules.length === 0) return true;
    let path = urlOrPath;
    try {
      const u = new URL(urlOrPath);
      path = u.pathname + u.search;
    } catch {}

    let matchedRule: RobotsRule | null = null;
    for (const rule of this.rules) {
      if (rule.regex.test(path)) {
        if (!matchedRule || rule.pattern.length > matchedRule.pattern.length) {
          matchedRule = rule;
        } else if (
          rule.pattern.length === matchedRule.pattern.length &&
          rule.allow
        ) {
          matchedRule = rule;
        }
      }
    }
    return matchedRule ? matchedRule.allow : true;
  }
}
