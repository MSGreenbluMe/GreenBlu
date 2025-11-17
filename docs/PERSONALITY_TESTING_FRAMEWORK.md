# GreenBlu.ai - Personality Testing Framework

## Table of Contents
- [1. Overview](#1-overview)
- [2. Progressive Profiling Strategy](#2-progressive-profiling-strategy)
- [3. Multi-Framework Integration](#3-multi-framework-integration)
- [4. Daily Question System](#4-daily-question-system)
- [5. Personality Vector Calculation](#5-personality-vector-calculation)
- [6. Genius Personality Types](#6-genius-personality-types)
- [7. Application to Mood Prediction](#7-application-to-mood-prediction)
- [8. Privacy & Ethics](#8-privacy--ethics)

## 1. Overview

GreenBlu.ai uses a **progressive profiling** approach to understand user personality without overwhelming them with lengthy assessments. Instead of a 100-question quiz upfront, users answer 1-2 carefully selected questions per day over time.

### 1.1 Design Principles

1. **Non-Intrusive**: Maximum 2 questions/day, < 30 seconds
2. **Adaptive**: Questions based on previous answers and confidence gaps
3. **Multi-Framework**: Synthesize insights from multiple personality models
4. **Contextual**: Questions tied to recent experiences (mood, events)
5. **Transparent**: Users see their evolving profile and confidence scores

### 1.2 Goals

- Build comprehensive personality profile over 60-90 days
- Integrate personality into mood prediction models
- Power job crafting recommendations
- Enable genius-type categorization
- Personalize intervention strategies

## 2. Progressive Profiling Strategy

### 2.1 Timeline

**Week 1-2: Foundations**
- Core personality dimensions (Big Five)
- Basic preferences and values
- Work style fundamentals
- 10-14 questions total

**Week 3-6: Depth**
- MBTI dimensions
- DISC communication style
- Stress responses
- Flow triggers
- 20-30 questions total

**Week 7-12: Nuance**
- Enneagram type
- StrengthsFinder themes
- Genius personality types
- Cross-validation questions
- 30-50 questions total

**Ongoing: Refinement**
- Confidence-based questioning
- Life change adaptation
- Trait stability monitoring
- Profile evolution

### 2.2 Question Selection Algorithm

```python
def select_daily_questions(user_profile, confidence_scores, recent_moods):
    """
    Select 1-2 optimal questions for today
    """
    # Priority 1: Low confidence traits
    low_confidence_traits = [t for t in traits if confidence_scores[t] < 0.6]

    # Priority 2: Cross-validation opportunities
    inconsistent_traits = detect_inconsistencies(user_profile)

    # Priority 3: Context-relevant questions
    contextual_questions = get_contextual_questions(recent_moods)

    # Priority 4: Unexplored frameworks
    unexplored = get_unexplored_frameworks(user_profile)

    # Build candidate pool
    candidates = []
    candidates.extend(low_confidence_traits, weight=0.4)
    candidates.extend(inconsistent_traits, weight=0.3)
    candidates.extend(contextual_questions, weight=0.2)
    candidates.extend(unexplored, weight=0.1)

    # Select 1-2 questions
    # Avoid similar topics on same day
    selected = diverse_sampling(candidates, k=random.choice([1, 2]))

    return selected
```

### 2.3 Confidence Scoring

**Initial Confidence**: 0.0 (unknown)

**After Each Answer**:
- Direct question: +0.2 confidence
- Corroborating answer: +0.1 confidence
- Contradictory answer: -0.1 confidence (flag for review)
- Behavioral confirmation: +0.05 per instance

**Confidence Levels**:
- 0.0-0.3: Unknown/Uncertain
- 0.3-0.6: Emerging understanding
- 0.6-0.8: Confident
- 0.8-1.0: Very confident

**Convergence Target**: 0.7+ confidence on core traits within 60 days

## 3. Multi-Framework Integration

### 3.1 Big Five (OCEAN)

**Dimensions**:
1. **Openness**: Imagination, curiosity, openness to experience
2. **Conscientiousness**: Organization, dependability, discipline
3. **Extraversion**: Sociability, assertiveness, energy from others
4. **Agreeableness**: Compassion, cooperation, trust
5. **Neuroticism**: Emotional stability, anxiety, stress reactivity

**Scoring**: Each dimension 0-100 (standardized)

**Sample Questions**:
- "I enjoy trying new and unfamiliar experiences" (Openness)
- "I make plans and follow through on them" (Conscientiousness)
- "I feel energized after social gatherings" (Extraversion)
- "I go out of my way to help others" (Agreeableness)
- "I often worry about things that might go wrong" (Neuroticism)

**Response Scale**: 1-5 (Strongly Disagree to Strongly Agree)

### 3.2 MBTI (Myers-Briggs)

**Four Dichotomies**:
1. **E/I** (Extraversion/Introversion): Energy source
2. **S/N** (Sensing/Intuition): Information processing
3. **T/F** (Thinking/Feeling): Decision making
4. **J/P** (Judging/Perceiving): Lifestyle orientation

**Scoring**: Percentage preference (e.g., 65% E, 35% I)

**16 Types**: INTJ, ENFP, ISTJ, etc.

**Sample Questions**:
- "I prefer spending time alone to recharge" (I)
- "I focus on concrete details rather than big-picture concepts" (S)
- "I make decisions based on logic rather than emotions" (T)
- "I like to have things settled and organized" (J)

**Integration with Big Five**:
- E/I ↔ Extraversion
- S/N ↔ Openness
- T/F ↔ Agreeableness (inverse)
- J/P ↔ Conscientiousness

### 3.3 DISC

**Four Behavioral Styles**:
1. **Dominance**: Direct, results-oriented, decisive
2. **Influence**: Outgoing, enthusiastic, persuasive
3. **Steadiness**: Patient, team-oriented, supportive
4. **Conscientiousness**: Accurate, analytical, systematic

**Scoring**: Percentage distribution (sum to 100%)

**Sample Scenarios**:
- "When facing a problem, I take charge immediately" (D)
- "I motivate others through enthusiasm and optimism" (I)
- "I prefer stable, predictable work environments" (S)
- "I carefully analyze data before deciding" (C)

**Application**:
- Communication style preferences
- Conflict resolution approach
- Leadership tendencies
- Stress triggers

### 3.4 Enneagram

**Nine Types**:
1. **Perfectionist**: Principled, purposeful, self-controlled
2. **Helper**: Generous, demonstrative, people-pleasing
3. **Achiever**: Adaptive, driven, image-conscious
4. **Individualist**: Expressive, dramatic, self-absorbed
5. **Investigator**: Perceptive, innovative, detached
6. **Loyalist**: Engaging, responsible, anxious
7. **Enthusiast**: Spontaneous, versatile, scattered
8. **Challenger**: Self-confident, decisive, confrontational
9. **Peacemaker**: Receptive, reassuring, complacent

**Scoring**: Primary type + wing (e.g., Type 5w4)

**Core Motivations**:
- Type 1: Integrity, improvement
- Type 2: Love, appreciation
- Type 3: Success, admiration
- Type 4: Authenticity, significance
- Type 5: Knowledge, competence
- Type 6: Security, support
- Type 7: Satisfaction, experiences
- Type 8: Control, self-reliance
- Type 9: Peace, harmony

**Deep Questions**:
- "What is your core fear?"
- "What do you most desire?"
- "How do you respond to stress?"
- "What brings you fulfillment?"

### 3.5 StrengthsFinder Themes

**34 Themes** (select top 5):
- **Strategic**: See patterns, create alternative paths
- **Achiever**: Constant drive for accomplishment
- **Learner**: Desire to learn and continuously improve
- **Relator**: Enjoy close relationships, deep connections
- **Analytical**: Search for reasons and causes
- **Ideation**: Fascinated by ideas and connections
- **Adaptability**: Prefer to go with the flow
- **Empathy**: Sense others' feelings by intuition
- *[26 more...]*

**Application**:
- Identify natural talents
- Optimize task allocation
- Build complementary teams
- Career development guidance

### 3.6 Genius Personality Types

**Four Genius Types** (inspired by Patrick Lencioni):
1. **Wonder**: Strategy, innovation, big-picture thinking
2. **Invention**: Problem-solving, creation, technical excellence
3. **Discernment**: Analysis, evaluation, pattern recognition
4. **Galvanizing**: Leadership, motivation, people development
5. **Enablement**: Service, support, facilitating others
6. **Tenacity**: Persistence, execution, follow-through

**Combination Approach**:
- Primary genius (dominant strength)
- Secondary genius (supporting strength)
- Working competency (can do but draining)
- Frustration areas (avoid or delegate)

**Assessment Method**:
- Job satisfaction questions
- Energy level after different activities
- Natural inclinations
- Performance feedback patterns

## 4. Daily Question System

### 4.1 Question Types

**Type 1: Direct Assessment**
- Standard personality inventory items
- Clear, validated questions
- Likert scale responses
- High reliability

Example: "I enjoy being the center of attention at social events."
- Strongly Disagree / Disagree / Neutral / Agree / Strongly Agree

**Type 2: Situational Judgment**
- Real-world scenarios
- Multiple choice responses
- Context-rich
- Behavioral prediction

Example: "Your team is behind schedule. You would most likely:"
- A) Create a detailed catch-up plan (Conscientiousness)
- B) Rally the team with a motivational speech (Extraversion)
- C) Analyze what went wrong first (Analytical)
- D) Stay calm and support team members (Agreeableness)

**Type 3: Forced Choice**
- Choose between two options
- Reveals priorities
- Reduces social desirability bias

Example: "Which describes you better?"
- A) "I prefer clear structure and plans"
- B) "I like flexibility and spontaneity"

**Type 4: Contextual Reflection**
- Based on recent mood or events
- Connects personality to behavior
- High engagement

Example: "Yesterday you felt stressed (Valence: -0.5). What helped most?"
- A) Taking a break and being alone
- B) Talking to a friend or colleague
- C) Making a to-do list
- D) Accepting it and moving on

**Type 5: Self-Perception**
- How user sees themselves
- Identity and values
- Aspirational vs. actual

Example: "Which statement resonates most?"
- A) "I am driven by achievements and goals"
- B) "I value deep connections with others"
- C) "I seek understanding and knowledge"
- D) "I want to make a positive impact"

### 4.2 Question Bank Structure

**Database Schema**:
```json
{
  "question_id": "BF_O_001",
  "framework": "Big Five",
  "dimension": "Openness",
  "question_text": "I enjoy trying new and unfamiliar experiences",
  "question_type": "direct_assessment",
  "response_type": "likert_5",
  "scoring": {
    "strongly_disagree": 1,
    "disagree": 2,
    "neutral": 3,
    "agree": 4,
    "strongly_agree": 5
  },
  "reverse_scored": false,
  "related_questions": ["BF_O_002", "BF_O_015"],
  "minimum_confidence_threshold": 0.3,
  "priority_level": "high"
}
```

**Question Pool Size**:
- Big Five: 50 questions (10 per dimension)
- MBTI: 40 questions (10 per dichotomy)
- DISC: 30 questions
- Enneagram: 45 questions (5 per type)
- StrengthsFinder: 100 questions (targeting top themes)
- Genius Types: 30 questions
- **Total**: ~300 questions

### 4.3 Adaptive Questioning

**Smart Selection**:
1. **Bayesian Updating**: Update probability distributions after each answer
2. **Information Gain**: Select questions that maximize reduction in uncertainty
3. **Cross-Validation**: Periodically ask questions that verify previous answers
4. **Diversity**: Rotate through frameworks to build complete profile

**Example Algorithm**:
```python
def calculate_information_gain(question, current_profile, confidence):
    # Expected reduction in uncertainty
    entropy_before = calculate_entropy(current_profile, confidence)

    # Simulate possible answers
    expected_entropy_after = 0
    for answer in question.possible_answers:
        # Update profile with this hypothetical answer
        updated_profile = update_profile(current_profile, question, answer)
        updated_confidence = update_confidence(confidence, question, answer)

        # Calculate probability of this answer
        p_answer = predict_answer_probability(question, answer, current_profile)

        # Calculate entropy after this answer
        entropy_after = calculate_entropy(updated_profile, updated_confidence)

        expected_entropy_after += p_answer * entropy_after

    # Information gain = reduction in entropy
    return entropy_before - expected_entropy_after
```

### 4.4 User Experience

**Daily Presentation**:
- Shown during morning check-in or first interaction
- Visual: Progress bar showing profile completion
- Context: "Let's learn more about you today!"
- Time estimate: "30 seconds"

**Engagement Mechanisms**:
- Streak tracking (consecutive days answered)
- Profile visualization (radar charts)
- Insight reveals ("Based on your answers, you might be...")
- Gamification (optional badges for milestones)

**Opt-Out Options**:
- Skip question (max 2 skips/week)
- "I don't know" response
- Revisit question later
- Pause personality profiling (affects prediction accuracy)

## 5. Personality Vector Calculation

### 5.1 Unified Representation

**Personality Vector**: 50-dimensional representation combining all frameworks

**Vector Components**:
```python
personality_vector = [
    # Big Five (5 dimensions, 0-100)
    openness, conscientiousness, extraversion, agreeableness, neuroticism,

    # MBTI (4 dimensions, -100 to +100)
    # Negative = first letter, Positive = second letter
    EI_score, SN_score, TF_score, JP_score,

    # DISC (4 dimensions, 0-100, sum = 100)
    dominance, influence, steadiness, conscientiousness_disc,

    # Enneagram (9 dimensions, 0-100)
    type1, type2, type3, type4, type5, type6, type7, type8, type9,

    # Genius Types (6 dimensions, 0-100)
    wonder, invention, discernment, galvanizing, enablement, tenacity,

    # StrengthsFinder (top 5 themes represented)
    strength1_score, strength2_score, strength3_score,
    strength4_score, strength5_score,

    # Derived traits
    stress_resilience, optimism, flow_tendency,
    collaboration_preference, structure_need,
    energy_baseline, recovery_speed, risk_tolerance
]
```

### 5.2 Trait Correlation

**Cross-Framework Consistency Check**:
```python
def validate_consistency(personality_vector):
    # Expected correlations
    correlations = {
        ('extraversion', 'EI_score'): 0.8,  # Should align
        ('openness', 'SN_score'): 0.6,
        ('conscientiousness', 'JP_score'): -0.7,  # J = high C
        ('neuroticism', 'stress_resilience'): -0.8
    }

    issues = []
    for (trait1, trait2), expected_r in correlations.items():
        actual_r = calculate_correlation(
            personality_vector[trait1],
            personality_vector[trait2]
        )

        if abs(actual_r - expected_r) > 0.3:
            issues.append(f"Inconsistency: {trait1} vs {trait2}")

    return issues
```

**Resolution Strategy**:
- Flag inconsistencies for follow-up questions
- Weight more reliable frameworks higher
- Use behavioral data to arbitrate
- Acknowledge complexity (people are multifaceted)

### 5.3 Personality Archetypes

**Clustering**: Group users into interpretable archetypes

**Example Archetypes**:
1. **Focused Achiever**: High C, low N, high Tenacity
2. **Creative Explorer**: High O, high N, high Wonder
3. **Social Connector**: High E, high A, high Enablement
4. **Strategic Analyzer**: High I (DISC-C), high Discernment
5. **Dynamic Leader**: High D, high E, high Galvanizing
6. **Steady Supporter**: High S (DISC), high A, high Enablement

**Application**:
- Default intervention preferences
- Communication style
- Predicted flow triggers
- Team role recommendations

## 6. Genius Personality Types

### 6.1 Six Genius Types (Expanded)

**1. Wonder (Strategy & Vision)**
- Strengths: Big-picture thinking, pattern recognition, innovation
- Energy sources: Brainstorming, strategic planning, future visioning
- Frustrations: Repetitive tasks, excessive details, short-term focus
- Flow triggers: Open-ended problems, creative freedom
- Team role: Strategist, Innovator, Visionary

**2. Invention (Problem-Solving & Creation)**
- Strengths: Technical excellence, building solutions, craftsmanship
- Energy sources: Creating, fixing, engineering
- Frustrations: Politics, ambiguity, non-technical work
- Flow triggers: Complex technical challenges, building from scratch
- Team role: Engineer, Developer, Architect

**3. Discernment (Analysis & Evaluation)**
- Strengths: Critical thinking, quality control, pattern detection
- Energy sources: Analyzing data, evaluating options, finding flaws
- Frustrations: Rushed decisions, ignored recommendations, superficiality
- Flow triggers: Complex analysis, research, due diligence
- Team role: Analyst, Quality Assurance, Researcher

**4. Galvanizing (Leadership & Motivation)**
- Strengths: Inspiring others, team building, change catalyzing
- Energy sources: Leading, motivating, rallying teams
- Frustrations: Solo work, unmotivated teams, lack of impact
- Flow triggers: High-stakes leadership, team transformations
- Team role: Leader, Coach, Change Agent

**5. Enablement (Service & Support)**
- Strengths: Facilitating others, removing obstacles, empathy
- Energy sources: Helping others succeed, service, coordination
- Frustrations: Lack of appreciation, self-promotion, competition
- Flow triggers: Making others' work easier, behind-the-scenes impact
- Team role: Facilitator, Coordinator, Support

**6. Tenacity (Execution & Follow-Through)**
- Strengths: Persistence, reliability, completion
- Energy sources: Finishing projects, consistency, proven systems
- Frustrations: Constantly changing priorities, lack of follow-through
- Flow triggers: Clear goals, measurable progress, completion
- Team role: Executor, Project Manager, Implementer

### 6.2 Assessment Questions

**Energy-Based Questions**:
- "Which activity energizes you most?"
  - A) Planning the future strategy (Wonder)
  - B) Building a solution from scratch (Invention)
  - C) Analyzing and evaluating options (Discernment)
  - D) Leading and motivating a team (Galvanizing)
  - E) Supporting others to succeed (Enablement)
  - F) Completing a challenging project (Tenacity)

**Frustration-Based Questions**:
- "What drains your energy fastest?"
  - A) Being stuck in details without seeing the big picture (Wonder)
  - B) Dealing with politics instead of real work (Invention)
  - C) Making decisions without sufficient analysis (Discernment)
  - D) Working alone without team interaction (Galvanizing)
  - E) Being in the spotlight instead of supporting (Enablement)
  - F) Constantly starting new things without finishing (Tenacity)

**Behavioral Questions**:
- "In a team project, you naturally gravitate toward..."
  - A) Setting the vision and direction (Wonder)
  - B) Building the core product/solution (Invention)
  - C) Ensuring quality and catching issues (Discernment)
  - D) Keeping the team motivated and aligned (Galvanizing)
  - E) Coordinating and helping everyone succeed (Enablement)
  - F) Driving completion and follow-through (Tenacity)

### 6.3 Scoring Algorithm

```python
def calculate_genius_profile(responses, behavioral_data):
    scores = {type: 0.0 for type in GENIUS_TYPES}

    # Direct assessment (40% weight)
    for response in responses:
        scores[response.genius_type] += response.score

    # Behavioral confirmation (30% weight)
    # Which activities lead to flow states?
    flow_activities = behavioral_data.flow_state_activities
    for activity in flow_activities:
        associated_genius = map_activity_to_genius(activity)
        scores[associated_genius] += 0.1

    # Energy patterns (20% weight)
    # Which tasks correlate with high energy?
    energy_correlations = behavioral_data.task_energy_correlation
    for task, energy in energy_correlations.items():
        if energy > 0.7:  # High energy
            associated_genius = map_task_to_genius(task)
            scores[associated_genius] += 0.05

    # Job satisfaction (10% weight)
    # Self-reported satisfaction with different activities
    satisfaction = behavioral_data.satisfaction_by_activity
    for activity, rating in satisfaction.items():
        if rating > 4:  # High satisfaction (1-5 scale)
            associated_genius = map_activity_to_genius(activity)
            scores[associated_genius] += 0.02

    # Normalize to 0-100 scale
    normalized = normalize_scores(scores, scale=100)

    # Identify primary, secondary, competency, frustration
    ranked = sort_descending(normalized)
    return {
        'primary': ranked[0],      # Top genius
        'secondary': ranked[1],    # Supporting genius
        'competency': ranked[2:4], # Can do, but neutral
        'frustration': ranked[4:]  # Draining activities
    }
```

## 7. Application to Mood Prediction

### 7.1 Personality as Prediction Features

**Direct Features**:
- Neuroticism → Baseline stress sensitivity
- Extraversion → Social interaction impact on mood
- Conscientiousness → Response to deadlines
- Openness → Variety/novelty needs
- Agreeableness → Conflict impact

**Interaction Effects**:
```python
# Example: Extraverts drain energy faster in solo work
if personality.extraversion > 70 and context.hours_alone > 4:
    predicted_arousal -= 0.2
    recommendation = "social_interaction_break"

# Introverts need recovery after social events
if personality.extraversion < 30 and context.recent_meeting_count > 3:
    predicted_arousal -= 0.3
    recommendation = "quiet_time"

# High neuroticism amplifies stress response
stress_multiplier = 1 + (personality.neuroticism / 200)
predicted_valence_change *= stress_multiplier
```

### 7.2 Personalized Interventions

**Intervention-Personality Matching**:
```python
def select_intervention(mood_state, personality, context):
    interventions = []

    # High Openness → Try variety
    if personality.openness > 70:
        interventions.extend(['new_breathing_pattern', 'creative_break'])

    # High Conscientiousness → Structured approaches
    if personality.conscientiousness > 70:
        interventions.extend(['pomodoro_timer', 'task_breakdown'])

    # High Extraversion → Social solutions
    if personality.extraversion > 70:
        interventions.extend(['coffee_chat', 'collaborative_break'])

    # High Neuroticism → Calming techniques
    if personality.neuroticism > 60:
        interventions.extend(['deep_breathing', 'progressive_relaxation'])

    # Filter by context and predicted effectiveness
    optimal = rank_by_effectiveness(
        interventions, mood_state, personality, context
    )

    return optimal[0]
```

### 7.3 Flow State Optimization

**Personality-Specific Flow Triggers**:

**Wonder Types**:
- Flow trigger: Open-ended problems, future planning
- Intervention: "Time to brainstorm your next big idea"
- Avoid: Micromanagement, rigid processes

**Invention Types**:
- Flow trigger: Technical challenges, building
- Intervention: "Deep work block for coding/creating"
- Avoid: Meetings without purpose, abstract discussions

**Discernment Types**:
- Flow trigger: Complex analysis, research
- Intervention: "Data analysis session"
- Avoid: Rushed decisions, insufficient information

**Galvanizing Types**:
- Flow trigger: Leadership opportunities, team facilitation
- Intervention: "Team sync or mentoring session"
- Avoid: Isolated work, lack of human contact

**Enablement Types**:
- Flow trigger: Helping others succeed, coordination
- Intervention: "Support others or organize collaboration"
- Avoid: Self-promotional tasks, solo competition

**Tenacity Types**:
- Flow trigger: Clear goals, measurable progress
- Intervention: "Focus on completing your current project"
- Avoid: Constant context switching, lack of closure

## 8. Privacy & Ethics

### 8.1 Ethical Considerations

**Consent & Transparency**:
- Clear explanation of how personality data is used
- Opt-in for personality profiling (not required for basic features)
- Ability to view, edit, or delete personality profile
- No personality data shared with employers without consent

**Avoiding Bias**:
- No "good" or "bad" personality types
- Strengths-based framing (not deficits)
- Cultural sensitivity in question design
- Validation across diverse populations

**Misuse Prevention**:
- No hiring decisions based solely on personality
- No punitive uses of personality data
- Education on personality science limitations
- Emphasis on growth and development

### 8.2 Data Storage

**Security**:
- Encrypted local storage (IndexedDB)
- Optional cloud backup (encrypted)
- No third-party access
- Automatic expiration (delete after inactivity)

**Portability**:
- Export personality profile (JSON)
- Import to new device
- Share with other apps (user controlled)
- Data deletion on request

### 8.3 Scientific Validity

**Question Validation**:
- Use validated instruments (e.g., IPIP for Big Five)
- Pilot testing for new questions
- Reliability analysis (test-retest)
- Factor analysis to confirm dimensions

**Longitudinal Tracking**:
- Personality can evolve over time
- Detect meaningful changes vs. random variation
- Adapt to life transitions
- Research contribution (anonymous aggregates)

## 9. Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- Big Five question bank (50 questions)
- Basic scoring algorithm
- Daily question selector
- Profile visualization

### Phase 2: Expansion (Weeks 3-4)
- MBTI integration
- DISC integration
- Adaptive questioning algorithm
- Confidence scoring

### Phase 3: Advanced (Weeks 5-6)
- Enneagram assessment
- Genius personality types
- Job crafting foundations
- Personality-mood integration

### Phase 4: Intelligence (Weeks 7-8)
- Cross-framework validation
- Behavioral confirmation
- Personalized interventions
- Flow state optimization
