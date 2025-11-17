# GreenBlu.ai - Job Crafting System Design

## Table of Contents
- [1. Job Crafting Overview](#1-job-crafting-overview)
- [2. Role-Fit Analysis](#2-role-fit-analysis)
- [3. Genius-Type Mapping](#3-genius-type-mapping)
- [4. Team Optimization](#4-team-optimization)
- [5. Career Development Pathways](#5-career-development-pathways)
- [6. Implementation Strategy](#6-implementation-strategy)

## 1. Job Crafting Overview

### 1.1 What is Job Crafting?

**Definition**: The process of redesigning one's job to better align with personal strengths, values, and preferences, leading to increased engagement, satisfaction, and performance.

**Three Dimensions** (Wrzesniewski & Dutton):
1. **Task Crafting**: Changing job tasks (scope, type, number)
2. **Relational Crafting**: Changing interactions with others
3. **Cognitive Crafting**: Changing how you think about your job

### 1.2 GreenBlu's Approach

**Data-Driven Job Crafting**:
- Analyze personality, flow patterns, and mood data
- Identify tasks that energize vs. drain
- Recommend role adjustments for optimal fit
- Guide toward genius-aligned positions
- Support team-level optimization

**Benefits**:
- Increased job satisfaction and engagement
- Higher flow state frequency
- Reduced burnout and turnover
- Better team dynamics
- Optimal talent allocation

### 1.3 Ethical Considerations

**Principles**:
- Employee-controlled data and recommendations
- No automated hiring/firing decisions
- Transparency in algorithms
- Respect for career autonomy
- Development-focused (not limitation-focused)

**Privacy Safeguards**:
- Job crafting insights visible only to employee
- Optional sharing with manager (explicit consent)
- Anonymized team data for organizational insights
- Right to opt out without penalty

## 2. Role-Fit Analysis

### 2.1 Role-Fit Scoring Model

**Input Data**:
1. **Personality Profile**: Big Five, MBTI, DISC, Enneagram
2. **Genius Types**: Primary and secondary strengths
3. **Flow Frequency**: Which tasks trigger flow states
4. **Mood Patterns**: Energy levels by activity type
5. **Behavioral Data**: Task completion, engagement, satisfaction
6. **Self-Reported**: Job satisfaction, preferences

**Role-Fit Score Formula**:
```python
def calculate_role_fit(role, user_profile):
    """
    Calculate fit score (0-100) between user and role
    """
    scores = {}

    # 1. Personality Match (30%)
    personality_requirements = ROLE_PERSONALITIES[role]
    scores['personality'] = calculate_personality_match(
        user_profile.personality,
        personality_requirements
    )

    # 2. Genius Type Alignment (25%)
    genius_requirements = ROLE_GENIUS_TYPES[role]
    scores['genius'] = calculate_genius_alignment(
        user_profile.genius_profile,
        genius_requirements
    )

    # 3. Flow Trigger Match (20%)
    role_activities = ROLE_ACTIVITIES[role]
    scores['flow'] = calculate_flow_compatibility(
        user_profile.flow_triggers,
        role_activities
    )

    # 4. Energy Patterns (15%)
    role_demands = ROLE_ENERGY_DEMANDS[role]
    scores['energy'] = calculate_energy_match(
        user_profile.energy_patterns,
        role_demands
    )

    # 5. Skills & Experience (10%)
    scores['skills'] = calculate_skill_match(
        user_profile.skills,
        ROLE_SKILLS[role]
    )

    # Weighted total
    total_score = (
        0.30 * scores['personality'] +
        0.25 * scores['genius'] +
        0.20 * scores['flow'] +
        0.15 * scores['energy'] +
        0.10 * scores['skills']
    )

    return {
        'total_score': round(total_score, 1),
        'component_scores': scores,
        'confidence': calculate_confidence(user_profile),
        'reasoning': generate_explanation(scores, role)
    }
```

### 2.2 Role Archetypes

**Technical Roles**:
1. **Software Engineer**
   - Primary Genius: Invention
   - Personality: High O, moderate C, I-leaning
   - Flow Triggers: Technical challenges, building, problem-solving
   - Energy: Sustained focus, minimal interruptions

2. **Data Scientist**
   - Primary Genius: Discernment + Invention
   - Personality: High O, high C, analytical
   - Flow Triggers: Complex analysis, pattern finding, research
   - Energy: Deep analytical work, iterative experimentation

3. **DevOps Engineer**
   - Primary Genius: Tenacity + Invention
   - Personality: High C, moderate E, systematic
   - Flow Triggers: Automation, optimization, reliable systems
   - Energy: Consistent execution, problem prevention

**Leadership Roles**:
4. **Product Manager**
   - Primary Genius: Wonder + Galvanizing
   - Personality: High E, high O, strategic
   - Flow Triggers: Strategy, user research, cross-functional collaboration
   - Energy: Variety, meetings balanced with thinking time

5. **Engineering Manager**
   - Primary Genius: Galvanizing + Enablement
   - Personality: High E, high A, moderate C
   - Flow Triggers: Team development, removing blockers, 1-on-1s
   - Energy: People interaction, coaching, strategic thinking

6. **Tech Lead**
   - Primary Genius: Invention + Galvanizing
   - Personality: Moderate E, high O, high C
   - Flow Triggers: Architecture, mentoring, technical decisions
   - Energy: Mix of coding and collaboration

**Support Roles**:
7. **Project Manager**
   - Primary Genius: Tenacity + Enablement
   - Personality: High C, high A, organized
   - Flow Triggers: Planning, coordination, achieving milestones
   - Energy: Structured work, predictable patterns

8. **UX Researcher**
   - Primary Genius: Discernment + Wonder
   - Personality: High O, high A, empathetic
   - Flow Triggers: User interviews, synthesis, insight discovery
   - Energy: Deep research, storytelling, moderate social

9. **Designer**
   - Primary Genius: Invention + Wonder
   - Personality: High O, creative, aesthetic
   - Flow Triggers: Creative problem-solving, visual design, iteration
   - Energy: Creative flow, feedback cycles, variety

**Operations Roles**:
10. **QA Engineer**
    - Primary Genius: Discernment + Tenacity
    - Personality: High C, detail-oriented, systematic
    - Flow Triggers: Finding bugs, ensuring quality, comprehensive testing
    - Energy: Methodical work, completeness, thoroughness

### 2.3 Role Fit Reports

**Example Role Fit Report**:
```
📊 Your Role Fit Analysis

Current Role: Software Engineer
Overall Fit: 87/100 (Excellent Match! 🎯)

Breakdown:
✅ Personality Match:     92/100 (Strong)
✅ Genius Type Alignment: 95/100 (Excellent)
✅ Flow Compatibility:    85/100 (Very Good)
✅ Energy Patterns:       78/100 (Good)
✅ Skills Match:          85/100 (Very Good)

Why This Role Works For You:
• Your Invention genius thrives on technical problem-solving
• High Openness drives enjoyment of learning new technologies
• Flow states most frequent during coding sessions (78% of flow time)
• Energy peaks during afternoon deep work blocks

Optimization Opportunities:
⚠️  Energy dips during excessive meetings (>3 per day)
   → Recommendation: Protect 2-hour morning focus blocks

⚠️  Moderate Extraversion suggests energy drain from solo work
   → Recommendation: Regular pair programming sessions

💡 Growth Path: Consider Tech Lead role in 12-18 months
   (Your emerging Galvanizing genius + strong technical foundation)
```

### 2.4 Task-Level Analysis

**Activity Energy Matrix**:
```python
def analyze_task_energy(user_profile):
    """
    Categorize tasks by energy impact
    """
    activities = user_profile.tracked_activities

    categorized = {
        'energizing': [],      # High energy gain, flow-inducing
        'neutral': [],         # Sustainable, neither drain nor gain
        'manageable': [],      # Slight drain but acceptable
        'draining': []         # High energy cost, avoid if possible
    }

    for activity in activities:
        # Calculate energy impact
        mood_before = activity.mood_before
        mood_after = activity.mood_after
        flow_frequency = activity.flow_frequency

        energy_delta = (
            mood_after.arousal - mood_before.arousal +
            (mood_after.valence - mood_before.valence) * 0.5
        )

        # Categorize
        if energy_delta > 0.3 or flow_frequency > 0.6:
            categorized['energizing'].append(activity)
        elif energy_delta > -0.1:
            categorized['neutral'].append(activity)
        elif energy_delta > -0.3:
            categorized['manageable'].append(activity)
        else:
            categorized['draining'].append(activity)

    return categorized
```

**Recommendations**:
```
🔋 Your Energy Map

ENERGIZING (Do More!):
✅ Writing code (new features)      → 85% flow rate, +0.4 arousal
✅ Technical design discussions     → 72% flow rate, +0.3 arousal
✅ Debugging complex issues         → 68% flow rate, +0.2 arousal

NEUTRAL (Sustainable):
◽ Code reviews                     → Neutral energy, important
◽ Documentation                    → Slight energy cost, manageable
◽ Team standups                    → Quick, minimal impact

MANAGEABLE (Limit & Batch):
⚠️  Back-to-back meetings           → -0.2 arousal, limit to 2/day
⚠️  Context switching              → -0.15 arousal, batch similar tasks
⚠️  Administrative tasks           → -0.1 arousal, schedule strategically

DRAINING (Minimize/Delegate):
🔴 All-hands meetings (>50 people) → -0.4 arousal, attend selectively
🔴 Legacy code maintenance         → -0.3 arousal, rotate with team
🔴 Repetitive bug fixes            → -0.25 arousal, automate when possible

💡 Job Crafting Suggestions:
1. Increase "new feature" work from 40% → 55%
2. Delegate legacy maintenance to those who find it energizing
3. Batch administrative tasks to Friday afternoons (lower stakes)
4. Propose pair programming for better energy during solo work
```

## 3. Genius-Type Mapping

### 3.1 Genius-to-Role Matrix

**Primary Genius → Ideal Roles**:

```python
GENIUS_ROLE_MAPPING = {
    "Wonder": {
        "ideal_roles": [
            "Product Strategist",
            "Solutions Architect",
            "Innovation Lead",
            "Research Scientist",
            "Business Analyst"
        ],
        "good_fit": [
            "Product Manager",
            "UX Researcher",
            "Consultant"
        ],
        "challenging": [
            "QA Engineer",  # Too detail-focused
            "Operations",   # Too repetitive
            "Support"       # Too reactive
        ]
    },
    "Invention": {
        "ideal_roles": [
            "Software Engineer",
            "Data Engineer",
            "Designer",
            "Solutions Engineer",
            "R&D Engineer"
        ],
        "good_fit": [
            "Tech Lead",
            "DevOps Engineer",
            "Product Manager (technical)"
        ],
        "challenging": [
            "Sales",           # Limited creation
            "Customer Success", # More service than invention
            "HR"               # Different skill set
        ]
    },
    "Discernment": {
        "ideal_roles": [
            "Data Scientist",
            "Security Engineer",
            "QA Engineer",
            "UX Researcher",
            "Business Analyst"
        ],
        "good_fit": [
            "Tech Lead",
            "Product Manager",
            "Consultant"
        ],
        "challenging": [
            "Sales (transactional)",  # Less analysis
            "Operations (routine)",   # Less critical thinking
            "Marketing (creative)"    # Different strengths
        ]
    },
    "Galvanizing": {
        "ideal_roles": [
            "Engineering Manager",
            "Team Lead",
            "Scrum Master",
            "Head of [Department]",
            "Coach/Trainer"
        ],
        "good_fit": [
            "Product Manager",
            "Tech Lead",
            "Developer Advocate"
        ],
        "challenging": [
            "Individual Contributor (isolated)",
            "Backend roles (minimal interaction)",
            "Research (solo)"
        ]
    },
    "Enablement": {
        "ideal_roles": [
            "Project Manager",
            "Scrum Master",
            "Developer Relations",
            "Customer Success",
            "Technical Writer"
        ],
        "good_fit": [
            "Engineering Manager",
            "DevOps",
            "Support Engineer"
        ],
        "challenging": [
            "Competitive Sales",
            "High-pressure Leadership",
            "Solo IC work"
        ]
    },
    "Tenacity": {
        "ideal_roles": [
            "DevOps Engineer",
            "Site Reliability Engineer",
            "QA Lead",
            "Project Manager",
            "Release Manager"
        ],
        "good_fit": [
            "Backend Engineer",
            "Data Engineer",
            "Platform Engineer"
        ],
        "challenging": [
            "Research (open-ended)",
            "Strategy (abstract)",
            "Creative roles (ambiguous)"
        ]
    }
}
```

### 3.2 Multi-Genius Combinations

**Powerful Combinations**:
```python
GENIUS_COMBINATIONS = {
    ("Wonder", "Invention"): {
        "superpower": "Innovative Creator",
        "ideal_roles": ["CTO", "Product Architect", "Startup Founder"],
        "description": "Envisions the future and builds it"
    },
    ("Wonder", "Discernment"): {
        "superpower": "Strategic Analyst",
        "ideal_roles": ["Principal Consultant", "Strategy Lead", "Research Director"],
        "description": "Sees patterns and evaluates possibilities"
    },
    ("Invention", "Tenacity"): {
        "superpower": "Reliable Builder",
        "ideal_roles": ["Senior Engineer", "Tech Lead", "Platform Lead"],
        "description": "Creates robust, finished solutions"
    },
    ("Galvanizing", "Enablement"): {
        "superpower": "Servant Leader",
        "ideal_roles": ["VP Engineering", "Head of People", "Agile Coach"],
        "description": "Empowers and elevates teams"
    },
    ("Discernment", "Tenacity"): {
        "superpower": "Quality Guardian",
        "ideal_roles": ["QA Director", "Security Lead", "Compliance Officer"],
        "description": "Ensures excellence through rigor"
    },
    ("Wonder", "Galvanizing"): {
        "superpower": "Visionary Leader",
        "ideal_roles": ["CEO", "Product VP", "Transformation Lead"],
        "description": "Inspires teams toward ambitious goals"
    }
}
```

### 3.3 Team Genius Balance

**Optimal Team Composition**:
```python
IDEAL_TEAM_GENIUS_DISTRIBUTION = {
    "Wonder": 0.15,       # 15% - Strategy and vision
    "Invention": 0.35,    # 35% - Building and creating (largest)
    "Discernment": 0.15,  # 15% - Quality and analysis
    "Galvanizing": 0.10,  # 10% - Leadership and motivation
    "Enablement": 0.10,   # 10% - Support and facilitation
    "Tenacity": 0.15      # 15% - Execution and completion
}

def analyze_team_genius_balance(team_profiles):
    """
    Analyze team genius distribution and identify gaps
    """
    # Count genius types
    genius_counts = count_primary_genius(team_profiles)
    total = len(team_profiles)

    # Calculate distribution
    actual_distribution = {
        g: count / total for g, count in genius_counts.items()
    }

    # Compare to ideal
    gaps = []
    excesses = []

    for genius_type, ideal_pct in IDEAL_TEAM_GENIUS_DISTRIBUTION.items():
        actual_pct = actual_distribution.get(genius_type, 0)
        diff = actual_pct - ideal_pct

        if diff < -0.1:  # 10% below ideal
            gaps.append((genius_type, diff))
        elif diff > 0.1:  # 10% above ideal
            excesses.append((genius_type, diff))

    return {
        'actual': actual_distribution,
        'ideal': IDEAL_TEAM_GENIUS_DISTRIBUTION,
        'gaps': gaps,
        'excesses': excesses,
        'recommendations': generate_team_recommendations(gaps, excesses)
    }
```

**Team Balance Report**:
```
👥 Team Genius Balance Analysis

Team: Backend Engineering (8 members)

Current Distribution:
🔵 Invention:   50% (4 members) [Above ideal: +15%]
🟢 Tenacity:    25% (2 members) [Ideal: +10%]
🟡 Discernment: 12.5% (1 member) [Near ideal]
🟠 Enablement:  12.5% (1 member) [Ideal]
⚪ Wonder:       0% (0 members) [Gap: -15%]
⚪ Galvanizing:  0% (0 members) [Gap: -10%]

Implications:
✅ Strong execution and building (Invention + Tenacity)
⚠️  Limited strategic thinking (no Wonder)
⚠️  Limited leadership/motivation (no Galvanizing)
⚠️  May struggle with vision and team cohesion

Recommendations:
1. Hire: Product-minded engineer (Wonder) or promote from within
2. Develop: Identify emerging Galvanizing talent for leadership
3. Collaborate: Partner with Product team for strategic input
4. Redistribute: Move 1 Invention person to adjacent team (excess)
```

## 4. Team Optimization

### 4.1 Role Allocation Algorithm

**Optimize Team Performance**:
```python
def optimize_team_roles(team_members, available_roles):
    """
    Assign team members to roles for maximum fit
    (Hungarian Algorithm / Linear Assignment Problem)
    """
    # Build cost matrix (negative of fit scores)
    cost_matrix = []
    for member in team_members:
        member_costs = []
        for role in available_roles:
            fit_score = calculate_role_fit(role, member.profile)
            cost = 100 - fit_score.total_score  # Convert to cost
            member_costs.append(cost)
        cost_matrix.append(member_costs)

    # Solve assignment problem
    assignments = hungarian_algorithm(cost_matrix)

    # Generate recommendations
    recommendations = []
    for member_idx, role_idx in assignments:
        member = team_members[member_idx]
        role = available_roles[role_idx]
        fit_score = calculate_role_fit(role, member.profile)

        recommendations.append({
            'member': member.name,
            'current_role': member.current_role,
            'recommended_role': role,
            'fit_score': fit_score.total_score,
            'improvement': fit_score.total_score - member.current_fit_score,
            'reasoning': fit_score.reasoning
        })

    return sorted(recommendations, key=lambda x: x['improvement'], reverse=True)
```

### 4.2 Collaboration Optimization

**Identify Best Pairings**:
```python
def suggest_collaboration_pairs(team_members):
    """
    Recommend who should work together based on complementary strengths
    """
    pairs = []

    for i, member_a in enumerate(team_members):
        for member_b in team_members[i+1:]:
            # Calculate collaboration score
            score = 0

            # 1. Complementary genius types
            if are_complementary_genius(
                member_a.genius_profile,
                member_b.genius_profile
            ):
                score += 30

            # 2. Personality compatibility
            personality_compat = calculate_personality_compatibility(
                member_a.personality,
                member_b.personality
            )
            score += personality_compat * 25

            # 3. Energy synchronization
            if overlapping_energy_peaks(member_a, member_b) > 0.6:
                score += 20

            # 4. Complementary skills
            skill_synergy = calculate_skill_synergy(member_a, member_b)
            score += skill_synergy * 25

            if score > 60:  # Strong pairing
                pairs.append({
                    'members': (member_a.name, member_b.name),
                    'score': score,
                    'strengths': describe_pairing_strengths(member_a, member_b),
                    'project_fit': suggest_project_types(member_a, member_b)
                })

    return sorted(pairs, key=lambda x: x['score'], reverse=True)
```

**Example Pairing Recommendation**:
```
🤝 Recommended Collaboration: Alice + Bob

Synergy Score: 87/100 (Excellent!)

Complementary Strengths:
✅ Alice (Wonder + Discernment): Strategic vision + Analysis
✅ Bob (Invention + Tenacity): Building + Follow-through
→ Together: Complete cycle from vision to execution

Personality Compatibility: 82/100
• Alice (INTJ): Strategic thinking, independent
• Bob (ISTP): Practical problem-solving, hands-on
• Shared Introversion → Comfortable with focused work
• Complementary T → Logic-driven decisions

Energy Synchronization:
• Both peak 9-11 AM (optimal collaboration time)
• Both prefer deep work blocks (2+ hours)
• Compatible break preferences

Ideal Projects:
1. Greenfield architecture design + implementation
2. Complex technical problem requiring innovation
3. Research → Prototype → Production pipeline

Communication Tips:
• Schedule morning collaborations (peak overlap)
• Use written specs (both prefer documentation)
• Allow independent work time, sync regularly
• Respect need for quiet, focused environment
```

### 4.3 Meeting Optimization

**Who Should Attend?**:
```python
def optimize_meeting_attendance(meeting, team_members):
    """
    Recommend optimal attendees for a meeting
    """
    scored_members = []

    for member in team_members:
        relevance_score = 0

        # 1. Role relevance
        if meeting.required_roles and member.role in meeting.required_roles:
            relevance_score += 40

        # 2. Genius type fit
        if meeting.type == "brainstorming" and member.genius_profile.primary == "Wonder":
            relevance_score += 30
        elif meeting.type == "planning" and member.genius_profile.primary == "Tenacity":
            relevance_score += 30
        elif meeting.type == "technical_design" and member.genius_profile.primary == "Invention":
            relevance_score += 30

        # 3. Energy cost
        energy_cost = calculate_meeting_energy_cost(member, meeting)
        relevance_score -= energy_cost * 10

        # 4. Current flow state (protect flow!)
        if member.current_flow_state in ["FLOW", "DEEP_FLOW"]:
            relevance_score -= 50  # Huge penalty for interrupting flow

        scored_members.append({
            'member': member,
            'score': relevance_score,
            'recommendation': categorize_attendance(relevance_score)
        })

    # Categorize
    must_attend = [m for m in scored_members if m['score'] > 70]
    should_attend = [m for m in scored_members if 40 <= m['score'] <= 70]
    optional = [m for m in scored_members if 20 <= m['score'] < 40]
    skip = [m for m in scored_members if m['score'] < 20]

    return {
        'must_attend': must_attend,
        'should_attend': should_attend,
        'optional': optional,
        'skip': skip,
        'optimal_size': len(must_attend) + len(should_attend)
    }
```

## 5. Career Development Pathways

### 5.1 Growth Trajectory Prediction

**Career Path Modeling**:
```python
def suggest_career_paths(user_profile, current_role, years_experience):
    """
    Recommend career development paths based on profile
    """
    paths = []

    # Identify primary genius trajectory
    primary_genius = user_profile.genius_profile.primary
    secondary_genius = user_profile.genius_profile.secondary

    # Technical track
    if primary_genius in ["Invention", "Discernment"]:
        technical_path = build_technical_track(
            current_role, years_experience, user_profile
        )
        paths.append(technical_path)

    # Management track
    if primary_genius in ["Galvanizing", "Enablement"] or \
       user_profile.personality.extraversion > 60:
        management_path = build_management_track(
            current_role, years_experience, user_profile
        )
        paths.append(management_path)

    # Strategic/Product track
    if primary_genius == "Wonder":
        strategic_path = build_strategic_track(
            current_role, years_experience, user_profile
        )
        paths.append(strategic_path)

    # Specialist track
    if primary_genius == "Tenacity" or user_profile.personality.conscientiousness > 75:
        specialist_path = build_specialist_track(
            current_role, years_experience, user_profile
        )
        paths.append(specialist_path)

    # Rank by fit
    return sorted(paths, key=lambda x: x['fit_score'], reverse=True)
```

**Example Career Path**:
```
🚀 Your Career Development Paths

Current: Software Engineer II (3 years experience)
Genius Profile: Invention (Primary) + Wonder (Secondary)

PATH 1: Technical Leadership Track (Best Fit: 92/100)
┌─────────────────────────────────────────────┐
│ Now: Software Engineer II                   │
│   Focus: Deepen technical skills            │
│   Timeline: Current                         │
│                                             │
│ 1-2 years: Senior Software Engineer        │
│   Focus: Architecture, mentoring            │
│   Develop: Wonder genius (strategic design) │
│                                             │
│ 3-4 years: Staff Engineer / Tech Lead      │
│   Focus: System design, technical strategy  │
│   Develop: Galvanizing (team influence)     │
│                                             │
│ 5-7 years: Principal Engineer / Architect  │
│   Focus: Company-wide technical vision      │
│   Peak: Invention + Wonder superpowers      │
└─────────────────────────────────────────────┘

Why This Fits:
✅ Leverages Invention genius (building)
✅ Grows Wonder genius (strategy)
✅ Aligns with High Openness (innovation)
✅ Matches flow patterns (technical work)

PATH 2: Product Engineering Track (Good Fit: 78/100)
┌─────────────────────────────────────────────┐
│ 1-2 years: Product-focused Engineer        │
│ 3-4 years: Product Manager (Technical)     │
│ 5-7 years: Senior Product Manager / GPM    │
└─────────────────────────────────────────────┘

Why Consider:
✅ Wonder genius valuable in product
✅ Technical background + strategy
⚠️  Less hands-on building (may reduce flow)
⚠️  More meetings (energy consideration)

Next Steps for Path 1:
□ Take on architecture projects (next 6 months)
□ Mentor junior engineer (develop Galvanizing)
□ Lead design review meetings (visibility)
□ Build expertise in [domain] systems
□ Consider tech lead role in 12-18 months
```

### 5.2 Skill Development Recommendations

**Personalized Learning Path**:
```python
def recommend_skill_development(user_profile, target_role):
    """
    Suggest skills to develop for career progression
    """
    current_skills = user_profile.skills
    target_skills = ROLE_SKILLS[target_role]

    # Identify gaps
    skill_gaps = []
    for skill, required_level in target_skills.items():
        current_level = current_skills.get(skill, 0)
        if current_level < required_level:
            gap = {
                'skill': skill,
                'current': current_level,
                'target': required_level,
                'priority': calculate_skill_priority(
                    skill, user_profile, target_role
                ),
                'learning_path': generate_learning_path(skill, current_level, required_level),
                'estimated_time': estimate_learning_time(skill, current_level, required_level)
            }
            skill_gaps.append(gap)

    # Sort by priority
    return sorted(skill_gaps, key=lambda x: x['priority'], reverse=True)
```

### 5.3 Transition Support

**Role Transition Guidance**:
```
📋 Transition Plan: Software Engineer → Tech Lead

Timeline: 6-12 months
Success Probability: 82% (with preparation)

Phase 1: Foundation (Months 1-3)
□ Shadow current tech lead (1 hour/week)
□ Lead design reviews (2x/month)
□ Mentor 1 junior engineer
□ Complete "Technical Leadership" course
□ Read: "The Manager's Path", "Staff Engineer"

Phase 2: Practice (Months 4-6)
□ Own 1 medium project end-to-end
□ Run team technical retrospectives
□ Propose architecture improvements
□ Build cross-team relationships
□ Present at engineering all-hands

Phase 3: Demonstration (Months 7-9)
□ Lead critical project (with oversight)
□ Demonstrate decision-making ability
□ Mentor 2-3 engineers successfully
□ Contribute to engineering strategy
□ Advocate for tech lead promotion

Phase 4: Transition (Months 10-12)
□ Receive tech lead offer
□ Gradual handoff of IC work
□ Ramp up leadership responsibilities
□ Build your team/project
□ Establish leadership style

Energy Management:
⚠️  New tech leads often experience energy dip
→ More meetings, less flow time initially
→ Strategies: Protect 2-hour focus blocks
            Balance IC work with leadership
            Develop Enablement genius

Support Resources:
• Internal tech lead community
• External coaching (if needed)
• Peer support group
• Manager guidance
```

## 6. Implementation Strategy

### 6.1 Data Collection

**Required Data Points**:
1. Personality profile (from personality engine)
2. Genius type assessment
3. Flow frequency by task type
4. Mood patterns by activity
5. Self-reported job satisfaction
6. Task energy impact
7. Skills and experience

**Collection Methods**:
- Automated: Flow detection, mood tracking, activity patterns
- Periodic: Job satisfaction surveys (monthly)
- Progressive: Personality assessments (daily micro-questions)
- One-time: Skills inventory (with updates)

### 6.2 MVP Features

**Phase 1: Individual Insights (Weeks 1-4)**
- Role fit scoring for current role
- Task energy analysis
- Basic job crafting recommendations
- Career path exploration

**Phase 2: Advanced Personal (Weeks 5-8)**
- Multiple role comparisons
- Detailed skill gap analysis
- Transition planning
- Learning recommendations

**Phase 3: Team Features (Weeks 9-12)**
- Team genius balance
- Collaboration optimization
- Meeting attendance suggestions
- Shared with manager (opt-in)

**Phase 4: Organizational (Weeks 13-16)**
- Aggregate insights for HR
- Hiring recommendations
- Team composition optimization
- Retention risk prediction

### 6.3 User Experience

**Entry Points**:
1. **Dashboard Widget**: "Your Role Fit" score
2. **Weekly Insight**: Job crafting tip based on data
3. **Career Explorer**: Browse potential paths
4. **Monthly Report**: Comprehensive job crafting analysis

**Interaction Design**:
- Non-prescriptive (suggestions, not mandates)
- Empowering language ("opportunities" not "problems")
- Actionable recommendations
- Privacy-first (user controls sharing)

### 6.4 Validation & Iteration

**Success Metrics**:
- Increased job satisfaction scores
- Higher flow state frequency
- Reduced burnout indicators
- Successful role transitions
- Team performance improvements

**Continuous Improvement**:
- A/B test recommendations
- Collect feedback on suggestions
- Track long-term career outcomes
- Refine role archetypes
- Update genius-role mappings

---

**Remember**: Job crafting is about helping people thrive in their work, not forcing them into boxes. The goal is to provide insights and suggestions while respecting individual autonomy and career aspirations.
