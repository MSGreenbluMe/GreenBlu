import type { VAD } from '../types';

interface OctopusProps {
  vad: VAD;
  size?: number;
}

export default function Octopus({ vad, size = 120 }: OctopusProps) {
  const { valence, arousal, dominance } = vad;

  // Calculate color based on valence (teal for positive, purple for negative, gray for neutral)
  const getBodyColor = (): string => {
    if (valence > 0.3) return '#14b8a6'; // Teal for positive
    if (valence < -0.3) return '#8b5cf6'; // Purple for negative
    return '#6b7280'; // Gray for neutral
  };

  // Calculate eye size based on arousal (bigger = more alert)
  const eyeSize = 8 + arousal * 4;
  const pupilSize = eyeSize * 0.5;

  // Calculate tentacle curl based on dominance
  const tentacleCurl = dominance * 15;

  // Eye expression based on valence
  const eyeY = valence < -0.3 ? 38 : 35; // Sad eyes are lower
  const eyeSpacing = 18;

  // Calculate mouth path based on valence
  const getMouthPath = (): string => {
    if (valence > 0.3) {
      // Happy smile
      return 'M 45 55 Q 50 60 55 55';
    } else if (valence < -0.3) {
      // Sad frown
      return 'M 45 57 Q 50 52 55 57';
    } else {
      // Neutral line
      return 'M 45 55 L 55 55';
    }
  };

  const bodyColor = getBodyColor();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-300"
    >
      {/* Octopus Head */}
      <ellipse
        cx="50"
        cy="40"
        rx="25"
        ry="22"
        fill={bodyColor}
        stroke="#000"
        strokeWidth="2"
      />

      {/* Eyes */}
      <g>
        {/* Left eye white */}
        <ellipse
          cx={50 - eyeSpacing / 2}
          cy={eyeY}
          rx={eyeSize}
          ry={eyeSize}
          fill="white"
          stroke="#000"
          strokeWidth="1.5"
        />
        {/* Right eye white */}
        <ellipse
          cx={50 + eyeSpacing / 2}
          cy={eyeY}
          rx={eyeSize}
          ry={eyeSize}
          fill="white"
          stroke="#000"
          strokeWidth="1.5"
        />

        {/* Left pupil */}
        <circle
          cx={50 - eyeSpacing / 2}
          cy={eyeY}
          r={pupilSize}
          fill="#000"
        />
        {/* Right pupil */}
        <circle
          cx={50 + eyeSpacing / 2}
          cy={eyeY}
          r={pupilSize}
          fill="#000"
        />

        {/* Eye shine */}
        <circle
          cx={50 - eyeSpacing / 2 + 2}
          cy={eyeY - 2}
          r={pupilSize * 0.4}
          fill="white"
        />
        <circle
          cx={50 + eyeSpacing / 2 + 2}
          cy={eyeY - 2}
          r={pupilSize * 0.4}
          fill="white"
        />
      </g>

      {/* Mouth */}
      <path
        d={getMouthPath()}
        fill="none"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Tentacles */}
      <g>
        {/* Tentacle 1 (left outer) */}
        <path
          d={`M 30 52 Q ${25 - tentacleCurl} 65 ${22 - tentacleCurl} 80`}
          fill="none"
          stroke={bodyColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Tentacle 2 (left middle) */}
        <path
          d={`M 35 53 Q ${32 - tentacleCurl / 2} 68 ${30 - tentacleCurl / 2} 85`}
          fill="none"
          stroke={bodyColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Tentacle 3 (left inner) */}
        <path
          d={`M 42 54 Q ${42 - tentacleCurl / 3} 70 ${40 - tentacleCurl / 3} 88`}
          fill="none"
          stroke={bodyColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Tentacle 4 (center left) */}
        <path
          d={`M 48 55 Q 48 72 46 90`}
          fill="none"
          stroke={bodyColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Tentacle 5 (center right) */}
        <path
          d={`M 52 55 Q 52 72 54 90`}
          fill="none"
          stroke={bodyColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Tentacle 6 (right inner) */}
        <path
          d={`M 58 54 Q ${58 + tentacleCurl / 3} 70 ${60 + tentacleCurl / 3} 88`}
          fill="none"
          stroke={bodyColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Tentacle 7 (right middle) */}
        <path
          d={`M 65 53 Q ${68 + tentacleCurl / 2} 68 ${70 + tentacleCurl / 2} 85`}
          fill="none"
          stroke={bodyColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Tentacle 8 (right outer) */}
        <path
          d={`M 70 52 Q ${75 + tentacleCurl} 65 ${78 + tentacleCurl} 80`}
          fill="none"
          stroke={bodyColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* Suction cups on tentacles */}
      <g opacity="0.3">
        <circle cx="25" cy="70" r="2" fill="#000" />
        <circle cx="33" cy="75" r="2" fill="#000" />
        <circle cx="42" cy="78" r="2" fill="#000" />
        <circle cx="50" cy="80" r="2" fill="#000" />
        <circle cx="58" cy="78" r="2" fill="#000" />
        <circle cx="67" cy="75" r="2" fill="#000" />
        <circle cx="75" cy="70" r="2" fill="#000" />
      </g>
    </svg>
  );
}
