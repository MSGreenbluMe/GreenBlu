// GreenBlu.ai Intervention Templates
// Production-ready interventions with complete instructions

import type { InterventionTemplate } from '../types';

export const interventionTemplates: InterventionTemplate[] = [
  // ==================== BREATHING EXERCISES ====================

  {
    template_id: 'breathing-478',
    name: '4-7-8 Breathing',
    type: 'breathing',
    description: 'A calming breathing technique that helps reduce anxiety and promotes relaxation. Developed by Dr. Andrew Weil, this method acts as a natural tranquilizer for the nervous system.',
    instructions: [
      'Sit or lie down in a comfortable position',
      'Place the tip of your tongue behind your upper front teeth',
      'Exhale completely through your mouth, making a whoosh sound',
      'Close your mouth and inhale quietly through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale completely through your mouth for 8 counts, making a whoosh sound',
      'This is one breath cycle. Repeat for 4 cycles total',
      'Practice at least twice daily for best results'
    ],
    duration_seconds: 120,
    difficulty: 'easy',
    avg_effectiveness: 0.82,
    usage_count: 0,
    completion_rate: 0.89,
    best_for_mood: {
      valence: -0.5,
      arousal: 0.5,
      dominance: -0.3
    },
    best_for_personality: {
      derived: {
        stress_resilience: 40,
        energy_baseline: 60,
        recovery_speed: 50,
        optimism: 50,
        flow_tendency: 50,
        collaboration_preference: 50,
        structure_need: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'Avoid if you have severe respiratory issues',
      'May cause lightheadedness initially - practice seated',
      'Not recommended during pregnancy without doctor approval'
    ]
  },

  {
    template_id: 'breathing-box',
    name: 'Box Breathing',
    type: 'breathing',
    description: 'Also known as square breathing, this technique is used by Navy SEALs to stay calm and focused in high-stress situations. Equal counts for inhale, hold, exhale, and hold create a balanced, grounding effect.',
    instructions: [
      'Sit upright with your feet flat on the floor',
      'Exhale all the air from your lungs',
      'Inhale slowly through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly through your mouth for 4 counts',
      'Hold your breath (empty lungs) for 4 counts',
      'This is one complete box. Repeat for 5 minutes',
      'Visualize drawing a box as you breathe to help maintain the rhythm'
    ],
    duration_seconds: 300,
    difficulty: 'easy',
    avg_effectiveness: 0.85,
    usage_count: 0,
    completion_rate: 0.91,
    best_for_mood: {
      valence: -0.3,
      arousal: 0.6,
      dominance: -0.2
    },
    best_for_personality: {
      big_five: {
        neuroticism: 60
      },
      derived: {
        stress_resilience: 45,
        structure_need: 65,
        energy_baseline: 50,
        recovery_speed: 50,
        optimism: 50,
        flow_tendency: 50,
        collaboration_preference: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'Not recommended for those with breathing disorders',
      'Reduce hold times if you feel dizzy',
      'Consult doctor if you have cardiovascular issues'
    ]
  },

  {
    template_id: 'breathing-wim-hof',
    name: 'Wim Hof Breathing',
    type: 'breathing',
    description: 'An energizing breathing method that increases oxygen levels and can boost energy, improve focus, and reduce stress. This is a more advanced technique that should be practiced with caution.',
    instructions: [
      'Sit or lie down in a safe, comfortable place',
      'Take 30-40 deep breaths: fully in through nose or mouth, relaxed out through mouth',
      'On the last exhale, breathe out and hold your breath (empty lungs)',
      'Hold until you feel the urge to breathe (typically 1-2 minutes)',
      'Take a deep recovery breath in and hold for 15 seconds',
      'Breathe normally for 30 seconds',
      'Repeat the cycle 3 times total',
      'IMPORTANT: Always practice sitting or lying down, never in water'
    ],
    duration_seconds: 420,
    difficulty: 'advanced',
    avg_effectiveness: 0.88,
    usage_count: 0,
    completion_rate: 0.72,
    best_for_mood: {
      valence: -0.4,
      arousal: -0.5,
      dominance: -0.4
    },
    best_for_personality: {
      derived: {
        stress_resilience: 70,
        risk_tolerance: 60,
        energy_baseline: 40,
        recovery_speed: 50,
        optimism: 50,
        flow_tendency: 50,
        collaboration_preference: 50,
        structure_need: 50
      }
    },
    contraindications: [
      'DO NOT practice while driving, swimming, or standing',
      'Avoid if pregnant or have epilepsy',
      'Not recommended for those with cardiovascular issues',
      'Consult a physician if you have any serious health conditions',
      'May cause tingling sensations or lightheadedness - this is normal'
    ]
  },

  {
    template_id: 'breathing-coherent',
    name: 'Coherent Breathing',
    type: 'breathing',
    description: 'Breathing at a rate of 5 breaths per minute (6-second inhale, 6-second exhale) creates optimal heart rate variability and promotes a state of calm alertness. Perfect for sustained focus work.',
    instructions: [
      'Sit comfortably with a straight spine',
      'Close your eyes or maintain a soft gaze',
      'Inhale gently through your nose for 6 seconds',
      'Exhale gently through your nose for 6 seconds',
      'Continue this rhythm for the full duration',
      'Keep the breath smooth and effortless - no forcing',
      'If 6 seconds feels too long, start with 4-5 seconds',
      'Practice for 10-20 minutes for optimal benefits'
    ],
    duration_seconds: 600,
    difficulty: 'moderate',
    avg_effectiveness: 0.87,
    usage_count: 0,
    completion_rate: 0.85,
    best_for_mood: {
      valence: -0.2,
      arousal: 0.3,
      dominance: 0.0
    },
    best_for_personality: {
      big_five: {
        conscientiousness: 65
      },
      derived: {
        flow_tendency: 70,
        stress_resilience: 60,
        structure_need: 60,
        energy_baseline: 50,
        recovery_speed: 50,
        optimism: 50,
        collaboration_preference: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'Generally safe for everyone',
      'Adjust timing if you feel uncomfortable',
      'May take several sessions to feel the full benefits'
    ]
  },

  {
    template_id: 'breathing-alternate-nostril',
    name: 'Alternate Nostril Breathing',
    type: 'breathing',
    description: 'Nadi Shodhana, an ancient yogic practice that balances the left and right hemispheres of the brain. Excellent for clearing mental fog and finding equilibrium.',
    instructions: [
      'Sit comfortably with a straight spine',
      'Rest your left hand on your left knee',
      'Bring your right hand to your nose',
      'Close your right nostril with your right thumb',
      'Inhale slowly through your left nostril for 4 counts',
      'Close your left nostril with your ring finger',
      'Release your thumb and exhale through your right nostril for 4 counts',
      'Inhale through your right nostril for 4 counts',
      'Close your right nostril and exhale through your left for 4 counts',
      'This is one complete cycle. Repeat for 5-10 minutes'
    ],
    duration_seconds: 420,
    difficulty: 'moderate',
    avg_effectiveness: 0.83,
    usage_count: 0,
    completion_rate: 0.80,
    best_for_mood: {
      valence: -0.1,
      arousal: 0.4,
      dominance: -0.2
    },
    best_for_personality: {
      big_five: {
        openness: 65
      },
      derived: {
        stress_resilience: 55,
        optimism: 60,
        flow_tendency: 60,
        energy_baseline: 50,
        recovery_speed: 50,
        collaboration_preference: 50,
        structure_need: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'Avoid if you have a cold or nasal congestion',
      'Not recommended during fever or illness',
      'Practice gently without forcing the breath'
    ]
  },

  // ==================== EYE EXERCISES ====================

  {
    template_id: 'eye-palming',
    name: 'Eye Palming',
    type: 'eye_exercise',
    description: 'A deeply relaxing technique developed by Dr. William Bates that helps reduce eye strain, headaches, and mental fatigue. Perfect for screen workers.',
    instructions: [
      'Rub your hands together vigorously for 10 seconds to warm them',
      'Close your eyes and gently place your warm palms over your eyes',
      'Cup your hands so they don\'t touch your eyelids directly',
      'Ensure no light enters - complete darkness helps the eyes rest',
      'Rest your elbows on a desk or table for support',
      'Breathe slowly and deeply',
      'Visualize complete blackness or a peaceful scene',
      'Hold for 2-3 minutes, or until your eyes feel refreshed',
      'Slowly remove your hands and open your eyes gradually'
    ],
    duration_seconds: 180,
    difficulty: 'easy',
    avg_effectiveness: 0.90,
    usage_count: 0,
    completion_rate: 0.94,
    best_for_mood: {
      valence: -0.3,
      arousal: 0.4,
      dominance: 0.0
    },
    best_for_personality: {
      derived: {
        stress_resilience: 50,
        energy_baseline: 45,
        structure_need: 55,
        recovery_speed: 50,
        optimism: 50,
        flow_tendency: 50,
        collaboration_preference: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'Avoid if you have eye infections or recent eye surgery',
      'Don\'t press hard on your eyes',
      'Remove contact lenses before practicing'
    ]
  },

  {
    template_id: 'eye-20-20-20',
    name: '20-20-20 Rule',
    type: 'eye_exercise',
    description: 'The gold standard for preventing digital eye strain. Every 20 minutes, look at something 20 feet away for 20 seconds. This simple practice dramatically reduces eye fatigue.',
    instructions: [
      'Set a timer for every 20 minutes during screen work',
      'When the timer goes off, stop what you\'re doing',
      'Look at an object at least 20 feet (6 meters) away',
      'Ideally, look out a window at a distant object',
      'Keep your gaze soft and relaxed - don\'t stare intensely',
      'Blink several times while looking away',
      'Hold your gaze on the distant object for a full 20 seconds',
      'Take a deep breath and return to your work',
      'Repeat every 20 minutes throughout your workday'
    ],
    duration_seconds: 20,
    difficulty: 'easy',
    avg_effectiveness: 0.86,
    usage_count: 0,
    completion_rate: 0.96,
    best_for_mood: {
      valence: 0.0,
      arousal: 0.3,
      dominance: 0.0
    },
    best_for_personality: {
      big_five: {
        conscientiousness: 60
      },
      derived: {
        structure_need: 65,
        stress_resilience: 50,
        energy_baseline: 50,
        recovery_speed: 50,
        optimism: 50,
        flow_tendency: 50,
        collaboration_preference: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'None - safe for everyone',
      'If you wear glasses, keep them on',
      'Can be done with contact lenses'
    ]
  },

  {
    template_id: 'eye-movements',
    name: 'Eye Movement Exercise',
    type: 'eye_exercise',
    description: 'Exercises the eye muscles and improves flexibility, reducing strain and improving focus. Great for breaking up long periods of screen focus.',
    instructions: [
      'Sit comfortably and keep your head still throughout',
      'Look up as far as you can without moving your head (5 seconds)',
      'Look down as far as you can (5 seconds)',
      'Look to the far left (5 seconds)',
      'Look to the far right (5 seconds)',
      'Look to the upper left diagonal (5 seconds)',
      'Look to the lower right diagonal (5 seconds)',
      'Look to the upper right diagonal (5 seconds)',
      'Look to the lower left diagonal (5 seconds)',
      'Roll your eyes slowly clockwise 3 times',
      'Roll your eyes slowly counter-clockwise 3 times',
      'Blink rapidly 10 times',
      'Close your eyes and rest for 30 seconds'
    ],
    duration_seconds: 180,
    difficulty: 'easy',
    avg_effectiveness: 0.79,
    usage_count: 0,
    completion_rate: 0.87,
    best_for_mood: {
      valence: -0.2,
      arousal: 0.2,
      dominance: 0.1
    },
    best_for_personality: {
      derived: {
        structure_need: 60,
        stress_resilience: 50,
        energy_baseline: 50,
        recovery_speed: 50,
        optimism: 50,
        flow_tendency: 50,
        collaboration_preference: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'Stop if you experience pain or dizziness',
      'Not recommended if you have retinal problems',
      'Consult an eye doctor if you have recent eye surgery'
    ]
  },

  // ==================== PHYSICAL EXERCISES ====================

  {
    template_id: 'physical-desk-stretches',
    name: 'Desk Stretches',
    type: 'physical',
    description: 'A comprehensive set of stretches designed to counteract the negative effects of prolonged sitting. Targets neck, shoulders, back, and hips.',
    instructions: [
      'Stand up and step away from your desk',
      'NECK: Gently tilt your head to the right, hold 15 seconds, repeat left',
      'NECK: Slowly turn your head to look over right shoulder, hold 15 seconds, repeat left',
      'SHOULDERS: Roll shoulders backward 10 times, then forward 10 times',
      'CHEST: Clasp hands behind back, straighten arms, lift chest up, hold 30 seconds',
      'BACK: Reach arms overhead, interlace fingers, lean to the right, hold 20 seconds, repeat left',
      'SPINE: Seated spinal twist - sit tall, twist right, hold 20 seconds, repeat left',
      'HIPS: Stand on one leg, bring other knee to chest, hold 20 seconds, switch legs',
      'WRISTS: Extend arm forward, pull fingers back with other hand, hold 15 seconds each side',
      'Shake out your whole body for 15 seconds',
      'Take 3 deep breaths'
    ],
    duration_seconds: 300,
    difficulty: 'easy',
    avg_effectiveness: 0.84,
    usage_count: 0,
    completion_rate: 0.82,
    best_for_mood: {
      valence: -0.2,
      arousal: -0.3,
      dominance: -0.1
    },
    best_for_personality: {
      derived: {
        energy_baseline: 40,
        stress_resilience: 50,
        structure_need: 55,
        recovery_speed: 50,
        optimism: 50,
        flow_tendency: 50,
        collaboration_preference: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'Don\'t push into pain - stretch gently',
      'Avoid if you have recent injuries',
      'Modify as needed for your body'
    ]
  },

  {
    template_id: 'physical-posture-reset',
    name: 'Posture Reset',
    type: 'physical',
    description: 'A quick routine to realign your spine and reset your posture. Counteracts the forward head and rounded shoulders from screen work.',
    instructions: [
      'Stand with your back against a wall',
      'Feet should be about 6 inches from the wall',
      'Press your lower back against the wall',
      'Bring your shoulder blades back and down the wall',
      'Tuck your chin slightly (making a double chin)',
      'Try to touch the back of your head to the wall',
      'Hold this position for 30 seconds while breathing normally',
      'Step away from the wall and maintain this alignment',
      'Do 10 shoulder blade squeezes: pull shoulders back, hold 5 seconds, release',
      'Finish with 5 chin tucks: sitting or standing, pull chin straight back, hold 5 seconds'
    ],
    duration_seconds: 180,
    difficulty: 'easy',
    avg_effectiveness: 0.81,
    usage_count: 0,
    completion_rate: 0.88,
    best_for_mood: {
      valence: -0.1,
      arousal: -0.2,
      dominance: -0.3
    },
    best_for_personality: {
      big_five: {
        conscientiousness: 65
      },
      derived: {
        structure_need: 70,
        stress_resilience: 50,
        energy_baseline: 50,
        recovery_speed: 50,
        optimism: 50,
        flow_tendency: 50,
        collaboration_preference: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'Avoid if you have severe back pain',
      'Don\'t force your head back if it causes neck pain',
      'Consult a physical therapist if you have chronic issues'
    ]
  },

  {
    template_id: 'physical-walking-break',
    name: 'Walking Break',
    type: 'physical',
    description: 'A mindful walking break that boosts creativity, improves mood, and increases blood flow to the brain. Research shows walking meetings are more productive than seated ones.',
    instructions: [
      'Step away from your workspace',
      'Walk at a comfortable pace - not rushed',
      'If possible, go outside for natural light and fresh air',
      'Keep your phone in your pocket - this is a mental break',
      'Notice your surroundings: sights, sounds, sensations',
      'Roll your shoulders back and maintain good posture',
      'Breathe naturally and deeply',
      'If your mind wanders to work, gently bring attention back to the walk',
      'Aim for at least 5 minutes, ideally 10-15 minutes',
      'Return to work feeling refreshed and mentally clear'
    ],
    duration_seconds: 600,
    difficulty: 'easy',
    avg_effectiveness: 0.89,
    usage_count: 0,
    completion_rate: 0.76,
    best_for_mood: {
      valence: -0.3,
      arousal: -0.4,
      dominance: -0.2
    },
    best_for_personality: {
      big_five: {
        openness: 60,
        extraversion: 55
      },
      derived: {
        stress_resilience: 55,
        energy_baseline: 40,
        optimism: 60,
        recovery_speed: 50,
        flow_tendency: 50,
        collaboration_preference: 50,
        structure_need: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'None - safe for everyone',
      'Stay safe - be aware of your surroundings',
      'Dress appropriately for weather if going outside'
    ]
  },

  {
    template_id: 'physical-yoga-flow',
    name: 'Quick Yoga Flow',
    type: 'physical',
    description: 'A gentle 5-minute yoga sequence that stretches the entire body, calms the mind, and re-energizes you for focused work.',
    instructions: [
      'Start in Mountain Pose: Stand tall, feet hip-width, arms at sides',
      'Inhale, sweep arms overhead, look up (5 seconds)',
      'Exhale, fold forward, hands toward floor (hold 10 seconds)',
      'Inhale, halfway lift, flat back, hands on shins',
      'Exhale, fold forward again',
      'Inhale, sweep arms up and back to standing',
      'Repeat this flow 3 times slowly',
      'WARRIOR 1: Step right foot back, bend left knee, arms overhead (hold 20 seconds)',
      'Switch sides: left foot back, bend right knee (hold 20 seconds)',
      'CHILD\'S POSE: Knees wide, sit back on heels, arms extended forward (hold 30 seconds)',
      'CAT-COW: On hands and knees, arch back (inhale), round back (exhale), repeat 5 times',
      'Return to standing, take 3 deep breaths'
    ],
    duration_seconds: 300,
    difficulty: 'moderate',
    avg_effectiveness: 0.87,
    usage_count: 0,
    completion_rate: 0.79,
    best_for_mood: {
      valence: -0.2,
      arousal: -0.1,
      dominance: 0.0
    },
    best_for_personality: {
      big_five: {
        openness: 65,
        conscientiousness: 60
      },
      derived: {
        stress_resilience: 60,
        flow_tendency: 65,
        structure_need: 60,
        energy_baseline: 50,
        recovery_speed: 50,
        optimism: 50,
        collaboration_preference: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'Listen to your body - don\'t push into pain',
      'Modify poses as needed for your flexibility',
      'Avoid if you have recent injuries without doctor approval',
      'Use a yoga mat or soft surface if available'
    ]
  },

  // ==================== COGNITIVE EXERCISES ====================

  {
    template_id: 'cognitive-mindfulness',
    name: 'Mindfulness Meditation',
    type: 'cognitive',
    description: 'A simple but powerful practice to anchor yourself in the present moment. Reduces anxiety, improves focus, and builds emotional resilience.',
    instructions: [
      'Sit comfortably with a straight spine',
      'Close your eyes or maintain a soft downward gaze',
      'Bring your attention to your breath',
      'Notice the sensation of breathing: air entering and leaving your nostrils',
      'When your mind wanders (and it will), gently notice what distracted you',
      'Without judgment, return your attention to the breath',
      'Continue this practice: breath → distraction → notice → return',
      'Remember: the practice isn\'t to stop thoughts, but to notice them and return to breath',
      'Set a gentle intention to be kind to yourself',
      'After 5 minutes, slowly open your eyes and notice how you feel'
    ],
    duration_seconds: 300,
    difficulty: 'moderate',
    avg_effectiveness: 0.86,
    usage_count: 0,
    completion_rate: 0.73,
    best_for_mood: {
      valence: -0.4,
      arousal: 0.5,
      dominance: -0.3
    },
    best_for_personality: {
      big_five: {
        openness: 65,
        neuroticism: 60
      },
      derived: {
        stress_resilience: 55,
        flow_tendency: 65,
        optimism: 60,
        energy_baseline: 50,
        recovery_speed: 50,
        collaboration_preference: 50,
        structure_need: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'May bring up difficult emotions initially - this is normal',
      'Start with shorter sessions if you\'re new to meditation',
      'Consider guided meditations if solo practice feels challenging'
    ]
  },

  {
    template_id: 'cognitive-gratitude',
    name: 'Gratitude Practice',
    type: 'cognitive',
    description: 'Scientifically proven to increase happiness, reduce depression, and improve overall well-being. Shifts focus from what\'s wrong to what\'s right.',
    instructions: [
      'Take out a piece of paper or open a note on your device',
      'Take a deep breath and reflect on your life right now',
      'Write down 3 things you\'re genuinely grateful for today',
      'Be specific: not just "my family" but "my partner making me coffee this morning"',
      'For each item, write WHY you\'re grateful for it',
      'Sit quietly and really feel the gratitude in your body',
      'Notice sensations: warmth in chest, relaxation, gentle smile',
      'If you\'re struggling, start small: warm bed, clean water, ability to read',
      'Take one more deep breath and carry this feeling forward',
      'Optional: text one person to thank them for something specific'
    ],
    duration_seconds: 240,
    difficulty: 'easy',
    avg_effectiveness: 0.83,
    usage_count: 0,
    completion_rate: 0.85,
    best_for_mood: {
      valence: -0.5,
      arousal: 0.2,
      dominance: -0.2
    },
    best_for_personality: {
      big_five: {
        neuroticism: 55
      },
      derived: {
        optimism: 40,
        stress_resilience: 50,
        energy_baseline: 50,
        recovery_speed: 50,
        flow_tendency: 50,
        collaboration_preference: 50,
        structure_need: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'None - safe for everyone',
      'If you\'re in a crisis, consider also seeking professional support',
      'It\'s okay if this feels hard at first - start small'
    ]
  },

  {
    template_id: 'cognitive-reframe',
    name: 'Cognitive Reframing',
    type: 'cognitive',
    description: 'A CBT technique to challenge negative thought patterns and see situations from a more balanced perspective. Builds mental flexibility and resilience.',
    instructions: [
      'Identify a stressful thought or situation bothering you right now',
      'Write it down exactly as you\'re thinking it (e.g., "I\'m terrible at my job")',
      'Ask: Is this thought 100% true? What evidence do I have?',
      'Ask: What would I tell a friend having this same thought?',
      'Ask: Is there another way to look at this situation?',
      'Ask: What\'s one small thing I can control in this situation?',
      'Write a more balanced version (e.g., "I made a mistake, but I\'m learning and improving")',
      'Notice how your body feels with the original thought vs. the reframed thought',
      'Take a deep breath and choose to hold the more balanced perspective',
      'Remember: thoughts are not facts, they\'re just mental events'
    ],
    duration_seconds: 300,
    difficulty: 'moderate',
    avg_effectiveness: 0.80,
    usage_count: 0,
    completion_rate: 0.77,
    best_for_mood: {
      valence: -0.6,
      arousal: 0.3,
      dominance: -0.4
    },
    best_for_personality: {
      big_five: {
        neuroticism: 65,
        openness: 60
      },
      derived: {
        stress_resilience: 40,
        optimism: 45,
        flow_tendency: 55,
        energy_baseline: 50,
        recovery_speed: 50,
        collaboration_preference: 50,
        structure_need: 50,
        risk_tolerance: 50
      }
    },
    contraindications: [
      'This is a skill that improves with practice',
      'Not a replacement for therapy if you\'re struggling significantly',
      'Be patient and compassionate with yourself as you learn'
    ]
  }
];

// Helper function to get intervention by ID
export function getInterventionById(templateId: string): InterventionTemplate | undefined {
  return interventionTemplates.find(t => t.template_id === templateId);
}

// Helper function to get interventions by type
export function getInterventionsByType(type: string): InterventionTemplate[] {
  return interventionTemplates.filter(t => t.type === type);
}

// Helper function to get interventions by difficulty
export function getInterventionsByDifficulty(difficulty: 'easy' | 'moderate' | 'advanced'): InterventionTemplate[] {
  return interventionTemplates.filter(t => t.difficulty === difficulty);
}

// Helper function to get interventions by duration
export function getInterventionsByDuration(maxSeconds: number): InterventionTemplate[] {
  return interventionTemplates.filter(t => t.duration_seconds <= maxSeconds);
}
