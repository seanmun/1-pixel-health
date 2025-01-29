import { TimelineEvent } from '../types';

export const TIMELINE_EVENTS: TimelineEvent[] = [
    {
      year: -300000,
      type: 'popup',
      content: {
        message: "Early humans faced harsh survival conditions. Average life expectancy was 25-30 years, with infant mortality rates above 50%. Most deaths occurred in the first few years of life."
      }
    },
    {
      year: -200000,
      type: 'popup',
      content: {
        message: "During peak ice ages, plant foods became scarce in many regions. Humans relied heavily on hunting large game animals for survival, with animal products making up the majority of their diet."
      }
    },
    {
      year: -100000,
      type: 'popup',
      content: {
        message: "Communities developed sophisticated hunting techniques. Despite harsh conditions, humans showed remarkable adaptation skills, learning to preserve meat through drying and smoking."
      }
    },
    {
      year: -50000,
      type: 'popup',
      content: {
        message: "Development of better tools and weapons led to more efficient hunting. Communities could now support larger populations, though life remained challenging with high mortality rates."
      }
    },
    {
      year: -10000,
      type: 'popup',
      content: {
        message: "The beginning of agriculture. Small-scale farming emerged in multiple regions, marking the first time humans actively cultivated plants for food. This gradually reduced dependence on hunting and gathering."
      }
    },
    // Keep existing later events
    {
      year: 1800,
      type: 'popup',
      content: {
        message: "Industrial Revolution begins. Introduction of processed foods and significant changes in food preservation methods."
      }
    },
    {
      year: 1900,
      type: 'popup',
      content: {
        message: "Introduction of industrial seed oils and beginning of modern food processing. This marks the most dramatic shift in human diet since the advent of agriculture."
      }
    }
  ];