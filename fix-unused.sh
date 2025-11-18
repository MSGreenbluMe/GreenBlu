#!/bin/bash

# JobMatching.tsx
sed -i 's/import type { PersonalityCV, JobMatchResult, JobRequirement, RoleArchetype } from/import type { PersonalityCV, JobMatchResult, JobRequirement } from/' /home/user/GreenBlu/src/pages/JobMatching.tsx
sed -i 's/export default function JobMatching({ userId, onNavigate }/export default function JobMatching({ userId, onNavigate: _onNavigate }/' /home/user/GreenBlu/src/pages/JobMatching.tsx
sed -i 's/const \[loading, setLoading\] = useState(false);/const [_loading, setLoading] = useState(false);/' /home/user/GreenBlu/src/pages/JobMatching.tsx

# PersonalityProfile.tsx
sed -i 's/\.map((strength, index) =>/\.map((strength, _index) =>/' /home/user/GreenBlu/src/pages/PersonalityProfile.tsx

# Services files - prefix unused with _
sed -i 's/import type { VAD, MoodEntry, PersonalityProfile, CircadianEntry } from/import type { VAD, CircadianEntry } from/' /home/user/GreenBlu/src/services/baseline-models.ts
sed -i 's/import type { VAD, MoodEntry, VADWithConfidence, PersonalityProfile, CircadianEntry } from/import type { VAD, MoodEntry, VADWithConfidence } from/' /home/user/GreenBlu/src/services/ensemble-predictor.ts
sed -i 's/import type { VAD, MoodEntry, PersonalityProfile } from/import type { VAD, MoodEntry } from/' /home/user/GreenBlu/src/services/kan-network.ts
sed -i 's/import type { MoodEntry, VADWithConfidence } from/import type { MoodEntry } from/' /home/user/GreenBlu/src/services/prediction-pipeline.ts

# cv-generator.ts
sed -i 's/const { flowTriggers, energyMap, roleFitScores } =/const { flowTriggers: _flowTriggers, energyMap: _energyMap, roleFitScores: _roleFitScores } =/' /home/user/GreenBlu/src/services/cv-generator.ts

# job-matcher.ts  
sed -i 's/GeniusType,//' /home/user/GreenBlu/src/services/job-matcher.ts
sed -i 's/const currentTeam =/const _currentTeam =/' /home/user/GreenBlu/src/services/job-matcher.ts
sed -i 's/const role =/const _role =/' /home/user/GreenBlu/src/services/job-matcher.ts
sed -i 's/const personalityMatch =/const _personalityMatch =/' /home/user/GreenBlu/src/services/job-matcher.ts
sed -i 's/const geniusMatch =/const _geniusMatch =/' /home/user/GreenBlu/src/services/job-matcher.ts

# kan-network.ts
sed -i 's/constructor(inputSize: number, outputSize: number, hiddenSize: number, degree: number)/constructor(inputSize: number, outputSize: number, hiddenSize: number, _degree: number)/' /home/user/GreenBlu/src/services/kan-network.ts
sed -i 's/, output:/, _output:/' /home/user/GreenBlu/src/services/kan-network.ts

# question-selector.ts
sed -i 's/interface QuestionScore {/_interface QuestionScore {/' /home/user/GreenBlu/src/services/question-selector.ts
sed -i 's/const { lastQuestionDate } =/const { lastQuestionDate: _lastQuestionDate } =/' /home/user/GreenBlu/src/services/question-selector.ts

# role-fit-analyzer.ts - Just one line
sed -i '481s/const role =/const _role =/' /home/user/GreenBlu/src/services/role-fit-analyzer.ts

# xgboost-model.ts
sed -i 's/const sampleIndices =/const _sampleIndices =/' /home/user/GreenBlu/src/services/xgboost-model.ts

echo "Fixed unused variables and imports"
