import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(projectRoot, '..', 'CISA-个人薄弱知识地图.md');
const outputPath = resolve(projectRoot, 'app', 'questions.json');

const source = await readFile(sourcePath, 'utf8');
const lines = source.split(/\r?\n/);
const questions = [];

let domain = { id: 'D1', name: '信息系统审计过程' };
let knowledgePoint = '';

const cleanInline = (value) =>
  value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+$/g, '')
    .trim();

const cleanBlock = (value) => {
  const cleaned = value
    .replace(/^```(?:text)?\s*$/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
};

const sectionBetween = (block, startLabel, endLabels = []) => {
  const start = block.indexOf(startLabel);
  if (start < 0) return '';
  const from = start + startLabel.length;
  const endings = endLabels
    .map((label) => block.indexOf(label, from))
    .filter((index) => index >= 0);
  const to = endings.length ? Math.min(...endings) : block.length;
  return cleanBlock(block.slice(from, to));
};

for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index];
  const domainMatch = line.match(/^## Domain (\d)：(.+?)（(\d+)%）/);
  if (domainMatch) {
    domain = { id: `D${domainMatch[1]}`, name: domainMatch[2] };
    knowledgePoint = '';
    continue;
  }

  const knowledgeMatch = line.match(/^### 知识点：(.+)/);
  if (knowledgeMatch) {
    knowledgePoint = cleanInline(knowledgeMatch[1]);
    continue;
  }

  const questionMatch = line.match(/^### (WQ-\d+)(?:（蒙对）)?：(.+)/);
  if (!questionMatch) continue;

  let end = index + 1;
  while (
    end < lines.length &&
    !/^### (?:WQ-\d+|知识点：)/.test(lines[end]) &&
    !lines[end].startsWith('## ')
  ) {
    end += 1;
  }

  const blockLines = lines.slice(index + 1, end);
  const block = blockLines.join('\n');
  const originalMarker = blockLines.findIndex((item) => item.startsWith('**原题'));
  const quoted = [];
  if (originalMarker >= 0) {
    for (let cursor = originalMarker + 1; cursor < blockLines.length; cursor += 1) {
      const item = blockLines[cursor];
      if (item.startsWith('>')) quoted.push(item.replace(/^>\s?/, '').replace(/\s{2}$/, ''));
      else if (quoted.length && item.trim() === '') break;
    }
  }

  const stemParts = [];
  const options = [];
  for (const quotedLine of quoted) {
    const option = quotedLine.match(/^([A-D])[.．、]\s*(.+)/);
    if (option) {
      options.push({ key: option[1], text: cleanInline(option[2]) });
      continue;
    }
    if (options.length) {
      options[options.length - 1].text += ` ${cleanInline(quotedLine)}`;
    } else if (quotedLine.trim()) {
      stemParts.push(cleanInline(quotedLine));
    }
  }

  const originalAnswerLine = block.match(/^- 个人答案：([^\n]+)/m)?.[1] ?? '';
  const correctAnswer = block.match(/^- 正确答案：\s*([A-D])/m)?.[1];
  const bankAnswer = block.match(/^- 题库答案：\s*([A-D])/m)?.[1];
  const principleAnswer = block.match(/^- 按[^\n]*?应选：\s*([A-D])/m)?.[1];
  const tagsLine = block.match(/^- 薄弱标签：([^\n]+)/m)?.[1] ?? '';
  const tags = [...tagsLine.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  const explanation = sectionBetween(block, '**解析**', ['**错因判断**', '**纠偏动作**']);
  const wrongCause = sectionBetween(block, '**错因判断**', ['**纠偏动作**']);
  const correction = sectionBetween(block, '**纠偏动作**');

  questions.push({
    id: questionMatch[1],
    title: cleanInline(questionMatch[2]),
    domainId: domain.id,
    domainName: domain.name,
    knowledgePoint,
    stem: stemParts.join('\n'),
    options,
    originalAnswer: originalAnswerLine.match(/([A-D])/)?.[1] ?? null,
    correctAnswer: principleAnswer ?? correctAnswer ?? bankAnswer ?? null,
    bankAnswer: bankAnswer ?? correctAnswer ?? null,
    principleAnswer: principleAnswer ?? null,
    tags,
    explanation,
    wrongCause,
    correction,
    flags: {
      guessedCorrect: /蒙对/.test(line + block),
      disputedAnswer: /题库答案疑似错误|题库答案或中文翻译疑似错误/.test(line + block),
      legacyContext: /旧题语境/.test(line) || /题目状态：[^\n]*旧题/.test(block),
      malformedStem: /疑似缺字|疑似.*断句/.test(line + block),
    },
  });

  index = end - 1;
}

await writeFile(outputPath, `${JSON.stringify(questions, null, 2)}\n`, 'utf8');
console.log(`Extracted ${questions.length} questions to ${outputPath}`);
