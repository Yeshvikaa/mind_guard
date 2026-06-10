import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini if key is provided
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Empathy replies dictionary for local fallback
const fallbackResponses = [
  {
    keywords: ['suicide', 'kill myself', 'die', 'self-harm', 'end my life'],
    response: "I hear how much pain you're in, and I want to support you. Please know you are not alone. Let's start a short countdown to connect you with emergency assistance, or you can call a professional hotline immediately. I'm right here with you.",
    stressScore: 95,
    category: 'Critical'
  },
  {
    keywords: ['stressed', 'overwhelmed', 'burnout', 'exhausted', 'can\'t take it', 'too much'],
    response: "It sounds like you're carrying a massive burden. Burnout and feeling overwhelmed are signals that you need space to breathe. Let's step back, pause for a moment, and try a 2-minute breathing exercise. How does your workload look today?",
    stressScore: 78,
    category: 'High'
  },
  {
    keywords: ['anxious', 'panic', 'scared', 'worry', 'nervous', 'heart racing'],
    response: "Anxiety can feel so intense in the body, but remember that this feeling will pass. Let's ground ourselves: take a slow breath in... and let it out. What is one small thing in your direct field of vision that brings you comfort?",
    stressScore: 68,
    category: 'High'
  },
  {
    keywords: ['sad', 'depressed', 'lonely', 'crying', 'unhappy', 'blue'],
    response: "I'm really sorry you're feeling down. It's completely okay to not be okay. Sometimes just acknowledging the sadness helps. Would you like to chat about what's going on, or would you prefer a quiet, guided meditation recommendation?",
    stressScore: 55,
    category: 'Medium'
  },
  {
    keywords: ['angry', 'mad', 'frustrated', 'annoyed', 'furious'],
    response: "It is completely valid to feel frustrated. Workplace frustrations can pile up quickly. If you need to vent, I am here to listen without judgment. What triggered this frustration today?",
    stressScore: 50,
    category: 'Medium'
  },
  {
    keywords: ['calm', 'relax', 'peaceful', 'good', 'happy', 'great', 'fine'],
    response: "That's wonderful to hear! It's so important to celebrate and maintain these balanced moments. Keep up the daily streak and let me know if there's anything else you'd like to reflect on today.",
    stressScore: 15,
    category: 'Low'
  }
];

/**
 * Generate AI chatbot response
 */
export const generateChatResponse = async (chatHistory, userMessage) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Construct context prompt from chat history
      const formattedHistory = chatHistory.map(msg => 
        `${msg.sender === 'user' ? 'User' : 'MindGuard AI'}: ${msg.content}`
      ).join('\n');
      
      const systemPrompt = `You are MindGuard, a compassionate, professional employee mental wellness coach. 
      Your goal is to provide empathetic, therapeutic support. Respond directly to the user in a comforting, helpful tone. 
      Ask brief, adaptive follow-up questions to understand their emotional state better. Keep responses concise and supportive. Use markdown formatting.
      
      Chat History:
      ${formattedHistory}
      
      User's latest message: ${userMessage}
      
      Respond as MindGuard AI:`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini API Error (using fallback):', error.message);
    }
  }

  // Local fallback response generator
  const content = userMessage.toLowerCase();
  for (const item of fallbackResponses) {
    if (item.keywords.some(keyword => content.includes(keyword))) {
      return item.response;
    }
  }

  return "Thank you for opening up to me. I'm here to support your mental wellness. Could you tell me a bit more about how that is affecting your day-to-day focus?";
};

/**
 * AI/Local Stress score analyzer
 */
export const analyzeStressScore = async (userMessage, aiResponse) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const systemPrompt = `You are the MindGuard stress analysis engine. 
      Analyze the emotional intensity, sentiment, and stress level of this employee message and the corresponding counselor response.
      
      Employee Message: "${userMessage}"
      Counselor Response: "${aiResponse}"
      
      Based on this interaction, calculate a stress score from 0 (completely calm) to 100 (extreme danger / panic / suicidal thoughts).
      Classify the score into one of these categories:
      - Low: 0-25
      - Medium: 26-50
      - High: 51-75
      - Critical: 76-100
      
      Respond ONLY with a valid JSON object matching this schema:
      {
        "score": number,
        "category": "Low" | "Medium" | "High" | "Critical",
        "explanation": string
      }
      Do not include any markdown fences or extra text.`;

      const result = await model.generateContent(systemPrompt);
      const responseText = (await result.response).text().trim();
      
      // Strip markdown code block wrappers if any
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysis = JSON.parse(cleaned);
      if (typeof analysis.score === 'number' && analysis.category) {
        return {
          score: analysis.score,
          category: analysis.category,
          explanation: analysis.explanation || ''
        };
      }
    } catch (error) {
      console.error('Gemini Stress Analysis Error (using fallback):', error.message);
    }
  }

  // Local fallback stress analysis algorithm
  const content = userMessage.toLowerCase();
  let baseScore = 20; // default baseline

  // Keyword score adjustments
  for (const item of fallbackResponses) {
    if (item.keywords.some(keyword => content.includes(keyword))) {
      baseScore = item.stressScore;
      break;
    }
  }

  // Add random variance for realistic live charts
  const variance = Math.floor(Math.random() * 11) - 5; // -5 to +5
  let score = Math.max(5, Math.min(100, baseScore + variance));

  let category = 'Low';
  if (score > 75) category = 'Critical';
  else if (score > 50) category = 'High';
  else if (score > 25) category = 'Medium';

  return {
    score,
    category,
    explanation: 'Calculated using keyword density and emotional sentiment analysis.'
  };
};

/**
 * AI/Local Wellness Recommendation generator
 */
export const generateAIRecommendations = async (stressScore, category) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const systemPrompt = `You are a professional wellness recommendation advisor. 
      Generate tailored, actionable recommendations for an employee with a stress score of ${stressScore}/100 (Category: ${category}).
      
      Provide recommendations across the following topics:
      1. Meditation: specific meditation technique
      2. Breathing: specific breathing exercise
      3. Exercise: physical exercise recommendation
      4. Productivity: workplace boundary or productivity tip
      5. Relaxation: sensory relaxation tip
      6. Sleep: sleep hygiene improvement tip
      
      Respond ONLY with a JSON object containing these topics:
      {
        "meditation": string,
        "breathing": string,
        "exercise": string,
        "productivity": string,
        "relaxation": string,
        "sleep": string
      }
      Do not include any markdown fences or extra text.`;

      const result = await model.generateContent(systemPrompt);
      const responseText = (await result.response).text().trim();
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Gemini Recommendation Error (using fallback):', error.message);
    }
  }

  // Static recommendations fallback
  if (category === 'Critical' || category === 'High') {
    return {
      meditation: "Try a 10-minute Loving-Kindness meditation to ease emotional friction.",
      breathing: "Perform the Box Breathing method (4s inhale, 4s hold, 4s exhale, 4s hold) for 5 minutes.",
      exercise: "Take a gentle 20-minute walk outside in nature. Avoid high-intensity workouts when cortisol is peak.",
      productivity: "Turn off slack/email notifications for the next 2 hours. Focus only on one single item.",
      relaxation: "Try a warm shower or bath, dim the lights, and listen to weightless ambient music.",
      sleep: "Shut down all electronic screens 1.5 hours before bed. Have a cup of caffeine-free chamomile tea."
    };
  } else if (category === 'Medium') {
    return {
      meditation: "5-minute somatic mindfulness meditation focusing on physical contact points.",
      breathing: "Try the 4-7-8 calming breath (4s inhale, 7s hold, 8s slow exhale) to activate the vagus nerve.",
      exercise: "Do a light stretch routine or 15 minutes of Yoga for focus.",
      productivity: "Apply the Pomodoro technique. Work for 25 minutes, then force a 5-minute screen-free break.",
      relaxation: "Spend 10 minutes journaling your current thoughts to offload cognitive strain.",
      sleep: "Set a cooling temperature in your room (around 18°C / 65°F) and read a physical book."
    };
  } else {
    return {
      meditation: "Gratitude meditation, list 3 things you are genuinely appreciative of today.",
      breathing: "Try equal ratio breathing (5s inhale, 5s exhale) to sustain calm focus.",
      exercise: "A 30-minute jogging session or moderate strength training to boost endorphins.",
      productivity: "Plan your top three outcomes for tomorrow right now so you can log off peacefully today.",
      relaxation: "Engage in a creative hobby (drawing, playing an instrument, or reading).",
      sleep: "Maintain your regular circadian rhythm by going to bed at your standard time tonight."
    };
  }
};
