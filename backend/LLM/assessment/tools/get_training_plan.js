import fs from 'fs';
import path from 'path';

const numberWords = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10
};

function normalizeFrequency(input) {
  if (typeof input === 'number') return `${input}/week`;

  const lower = String(input).toLowerCase().trim();

  // Match "3", "3x", "3 per week", etc.
  const numberMatch = lower.match(/\d/);
  if (numberMatch) {
    return `${numberMatch[0]}/week`;
  }

  // Match "four days", "four/week"
  const word = Object.keys(numberWords).find(w => lower.includes(w));
  if (word) {
    return `${numberWords[word]}/week`;
  }

  return null;
}

export default async function getTrainingPlan({ frequency }) {
  const filePath = path.join(process.cwd(), 'LLM', 'assessment', 'data', 'training_plans.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const normalized = normalizeFrequency(frequency);
  if (!normalized || !data.plans[normalized]) {
    return `Sorry, I couldn't find a training plan for "${frequency}". Try something like "3", "four days", or "6/week".`;
  }

  const plan = data.plans[normalized];

  return `Here's your ${normalized} training plan:\n` +
    Object.entries(plan)
      .map(([day, muscles]) => `${day}: ${muscles.join(', ')}`)
      .join('\n');
}
