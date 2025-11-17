# GreenBlu.ai - Product Requirements Document (PRD)

## Table of Contents
- [2.1 Product Overview](#21-product-overview)
- [2.2 User Personas](#22-user-personas)
- [2.3 Core Features](#23-core-features)
- [2.4 MVP Features vs. Future Enhancements](#24-mvp-features-vs-future-enhancements)
- [2.5 User Requirements](#25-user-requirements)
- [2.6 Success Metrics](#26-success-metrics)

## 2.1 Product Overview

GreenBlu.ai is an AI-powered wellbeing and productivity Chrome extension inspired by "Chobotničky z druhého poschodia" (a Czechoslovakian TV series). It helps employees improve their wellbeing through continuous monitoring of mood, personalized interventions, and data-driven insights while providing valuable team analytics for managers.

## 2.2 User Personas

### Individual Knowledge Worker
- Primary user working 6+ hours on computer
- Experiences stress, eye strain, and varying energy levels
- Values work-life balance and personal productivity
- Wants unobtrusive, helpful wellbeing support

### Team Manager
- Responsible for team wellbeing and productivity
- Seeks data-driven insights for team optimization
- Wants to optimize meeting schedules
- Values team harmony and preventing burnout

### HR Professional
- Oversees company-wide wellbeing initiatives
- Looks for aggregate data and trends
- Needs metrics to measure program effectiveness
- Values employee retention and satisfaction

## 2.3 Core Features

### 2.3.1 Mood Tracking (VAD Model)

**Description:** Capture emotional state using Valence-Arousal-Dominance model

**User Value:** Science-backed mood tracking with minimal input effort

**Requirements:**
- Simple, intuitive interface for mood selection
- Energy/arousal level slider
- Optional context input
- Visual character representation that reflects mood state
- Maximum 15 seconds completion time per check

### 2.3.2 Circadian Rhythm Tracking

**Description:** Daily input of wake-up time with weather correlation

**User Value:** Personalized productivity window recommendations

**Requirements:**
- Morning check-in notification
- Simple time input
- Integration with weather API
- Visualization of energy curve
- Optimal timing recommendations

### 2.3.3 Intervention Modules

**Description:** Curated wellbeing exercises and activities

**User Value:** Quick, effective tools to manage stress and energy

**Requirements:**
- Breathing exercises (3 patterns, 2-5 minutes)
- Eye exercises (palming, movement exercises, 1-3 minutes)
- Physical exercises (desk stretches, 2-4 minutes)
- Cognitive mini-games (1-3 minutes)
- Visual guides and timers
- Success tracking and statistics

### 2.3.4 Behavioral Analysis

**Description:** Non-intrusive monitoring of work patterns

**User Value:** Insight into stress and focus without manual input

**Requirements:**
- Mouse movement analysis
- Activity pattern monitoring
- Privacy controls and transparency
- Stress level indicators
- Actionable recommendations

### 2.3.5 Team Analytics Dashboard

**Description:** Visualization of team energy and optimal collaboration times

**User Value:** Data-driven team management decisions

**Requirements:**
- Team energy flow visualization
- Synchronization of circadian rhythms
- Optimal meeting time recommendations
- Anonymous data aggregation
- Early risk detection (burnout, etc.)

### 2.3.6 Personalization System

**Description:** AI-powered adaptation to individual preferences and patterns

**User Value:** Increasingly relevant and effective recommendations

**Requirements:**
- Progressive preference learning
- Adaptation to feedback
- Personalized intervention timing
- Custom notification frequency
- Pattern-based recommendations

## 2.4 MVP Features vs. Future Enhancements

### MVP (Minimum Viable Product):
- Basic VAD mood tracking
- Morning check-in with wake-up time
- Weather integration
- Simple breathing exercises
- Basic dashboard visualization
- Google Sheets as initial database

### Future Enhancements:
- Personal Graph Knowledge Base
- Advanced behavioral analysis
- Comprehensive intervention library
- Team synchronization features
- Predictive analytics
- Mobile companion app

## 2.5 User Requirements

### Privacy and Data Security
- Clear consent for data collection
- Anonymous aggregation for team data
- Local storage of sensitive information
- Option to delete personal data

### Performance
- Minimal browser resource usage (<5% CPU)
- Quick startup time (<2 seconds)
- Smooth animations (60fps)
- Responsive interface

### Usability
- Non-intrusive notifications
- Minimal workflow disruption
- Quick access to key features
- Clear, simple UI with consistent patterns

### Accessibility
- Color schemes suitable for color blindness
- Screen reader compatibility
- Keyboard navigation
- Adjustable text sizes

## 2.6 Success Metrics

### User Engagement
- 70% adoption rate among target users
- 80% daily active users
- 3 interactions per day per user
- <15% abandonment rate after 30 days

### Wellbeing Impact
- 30% reduction in reported stress levels
- 25% improvement in eye strain metrics
- 20% increase in reported energy levels
- 15% improvement in work satisfaction

### Team Performance
- 20% reduction in meeting inefficiency
- 15% improvement in team synchronization
- 10% increase in reported productivity
- 15% reduction in employee turnover
