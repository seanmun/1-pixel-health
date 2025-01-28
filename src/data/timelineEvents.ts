// src/data/timelineEvents.ts
import { TimelineEvent } from '../types';

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: -300000,
    type: 'popup',
    content: {
      message: "Early humans relied solely on fire for heating and cooking. This was their only form of energy consumption beyond their own physical efforts."
    }
  },
  {
    year: -200000,
    type: 'stat-change',
    content: {
      stats: {
        lifeExpectancy: 25,
        infantMortality: 50
      }
    }
  },
  {
    year: 1800,
    type: 'popup',
    content: {
      message: "Industrial Revolution begins, marking the start of processed foods and dramatic changes in human diet."
    }
  }
  // We can add more events
];