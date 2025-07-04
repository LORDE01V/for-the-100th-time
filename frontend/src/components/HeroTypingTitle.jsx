import { TypeAnimation } from 'react-type-animation';
import { Heading } from '@chakra-ui/react';

function HeroTypingTitle({ color }) {
  return (
    <Heading size="2xl" color={color} textAlign="center">
      <TypeAnimation
        sequence={[
          'Monitor your energy in real-time ⚡️', 2000,
          'Predict future usage with AI 🧠', 2000,
          'Join the energy-smart community 🌍', 2000,
          'Beat load shedding schedules 🔌', 2000,
          'Optimize solar investments ☀️', 2000,
          'Track daily energy savings 💰', 2000,
          'Share power with neighbors 🤝', 2000,
          'Analyze consumption patterns 📊', 2000,
          'Get outage predictions ⚠️', 2000,
          'Compare community usage 👥', 2000,
          'Manage battery storage 🔋', 2000,
          'Receive smart grid alerts 📲', 2000,
          'Plan eco-friendly budgets 🌱', 2000,
          1000 // Final pause before restart
        ]}
        wrapper="span"
        cursor={true}
        repeat={Infinity}
        style={{ 
          display: 'inline-block',
          minHeight: '1.2em' // Prevent layout shift
        }}
      />
    </Heading>
  );
}

export default HeroTypingTitle; 