/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaComments } from 'react-icons/fa';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Textarea,
  VStack,
  Spinner, // Ensure Spinner is imported only once
  useColorModeValue,
  useToast,
  Collapse,
  UnorderedList,
  ListItem,
  SimpleGrid,
  Icon,
  Tooltip,
  Container,
  Avatar,
} from '@chakra-ui/react';
import forumBackground from '../assets/images/Forum_page.png';

const ForumPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const metaTextColor = useColorModeValue('gray.500', 'gray.400');
  
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replies, setReplies] = useState({});
  const [tone, setTone] = useState(null);
  const [isSummarized, setIsSummarized] = useState(false);
  const [isCheckingTone, setIsCheckingTone] = useState(false);

  // Mock data for dummyTopics
  const dummyTopics = useMemo(() => [
    {
      id: 1,
      title: 'Solar Panel Maintenance Tips',
      author: 'John Doe',
      lastActivity: '2025-03-15',
      replies: 5,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Regular cleaning of panels is essential for efficiency."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Check for dust buildup every month."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Use mild soap for washing to avoid damage."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Inspect wiring for any signs of wear."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Angle adjustments based on seasons help."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Monitor for shading issues from nearby trees."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Professional inspections recommended annually."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Avoid high-pressure water on panels."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Keep an eye on inverter connections."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Use protective covers during storms."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Track performance with monitoring apps."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Replace damaged panels promptly."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Ensure proper grounding for safety."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Clean edges and frames carefully."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Test output regularly with a multimeter."
        }
      ]
    },
    {
      id: 2,
      title: 'Best Battery Storage Solutions',
      author: 'Jane Smith',
      lastActivity: '2025-03-14',
      replies: 3,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Lithium-ion batteries are reliable for home use. They offer high energy density and long cycle life, making them ideal for residential solar setups. Maintenance is minimal, and they are widely available in the market."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Consider lead-acid for cost-effective options. These batteries are cheaper upfront and have been used for decades. However, they require regular maintenance and have a shorter lifespan compared to lithium-ion."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Flow batteries offer long-duration storage. These are newer technologies that can store energy for extended periods, but they are more expensive and have a lower energy density."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Saltwater batteries are eco-friendly alternatives. These are experimental and require specialized equipment for maintenance."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Hybrid systems combine solar and battery tech. This is a cost-effective solution that maximizes solar output and provides backup power."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Capacity should match your daily energy needs. Over-sizing can be wasteful, while under-sizing can lead to frequent charging cycles."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Check for depth of discharge ratings. This determines how deeply you can discharge the battery before it needs recharging."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Maintenance involves regular charging cycles. Lithium-ion batteries are generally maintenance-free, but lead-acid requires regular watering."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Integrate with smart home systems for efficiency. This allows for real-time monitoring and optimization of energy usage."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Cost per kWh is a key factor in selection. Lithium-ion batteries have the lowest cost per kWh over their lifespan."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Look for warranties over 10 years. This ensures long-term reliability and peace of mind."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Tesla Powerwall is popular for residential setups. It's a well-known brand with excellent customer reviews."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Ensure proper ventilation for safety. Batteries release gases, and proper airflow is crucial for longevity."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Monitor battery health via apps. Many battery management systems offer smartphone apps for monitoring and alerts."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Scalability allows adding more units later. This is important if your energy needs grow over time."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Compare efficiency ratings before buying. This helps you understand the energy output and lifespan of different battery types."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Grid-tied vs. off-grid compatibility matters. This depends on your energy needs and location."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Recycling programs for old batteries are important. Proper disposal is crucial for environmental sustainability."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "User reviews help in decision-making. Reading experiences from other users can provide valuable insights."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Future-proof with expandable systems. This ensures your energy storage can grow with your needs."
        }
      ]
    },
    {
      id: 3,
      title: 'Energy Saving Strategies',
      author: 'Mike Johnson',
      lastActivity: '2025-03-13',
      replies: 7,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Turn off lights when not in use. This simple step can significantly reduce your energy consumption."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Use LED bulbs for lower energy consumption. They are more energy-efficient and last longer."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Unplug devices to avoid phantom power. Many devices continue to draw power even when turned off."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Upgrade to energy-efficient appliances. This includes refrigerators, washing machines, and dishwashers."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Insulate your home to reduce heating needs. Proper insulation can cut your heating bills by up to 30%."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Install programmable thermostats. This allows you to set different temperatures for different times of the day."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Optimize water heater settings. Lowering the temperature can save energy and reduce water usage."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Use natural light during the day. This reduces the need for artificial lighting."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Seal drafts around windows and doors. This prevents heat from escaping and reduces your heating needs."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Monitor energy usage with smart meters. This allows you to track your energy consumption in real-time."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Adjust AC temperatures slightly. This can save energy while still maintaining comfort."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Choose energy-star rated products. These products are designed to consume less energy."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Implement rainwater harvesting for savings. This reduces your reliance on municipal water."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Carpool or use public transport. This reduces your carbon footprint and transportation costs."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Plant trees for natural shading. Trees can provide shade and reduce your cooling needs."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Maintain HVAC systems regularly. This ensures optimal performance and energy efficiency."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Switch to renewable energy sources. This includes solar, wind, and hydro power."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Educate family on conservation habits. This helps everyone in the household understand and adopt energy-saving practices."
        }
      ]
    },
    // Adding 10 more topics with new authors and posts
    {
      id: 4,
      title: 'Inverter Installation Guide',
      author: 'Emily Clark',
      lastActivity: '2025-03-12',
      replies: 4,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Start with selecting the right inverter size. This is crucial for your solar system's efficiency and reliability."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Ensure proper wiring from panels. This is critical for safety and optimal energy transfer."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Mount in a cool, dry location. Inverter overheating can lead to reduced efficiency and potential damage."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Connect to the battery system carefully. This is important for efficient energy storage and distribution."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Test voltage compatibility first. This ensures your inverter works with your solar panels and battery."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Use surge protectors for safety. This protects your inverter from sudden voltage spikes."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Follow local electrical codes. This ensures your installation complies with regulations."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Secure all connections tightly. Loose connections can lead to overheating and potential damage."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Monitor for overheating issues. This is a common problem that can be prevented with proper ventilation."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Integrate with monitoring software. This allows you to monitor your inverter's performance and status."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Hire a professional if unsure. This ensures your inverter is installed correctly and safely."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Check for ground fault protection. This is a safety feature that prevents electrical shocks."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Label all circuits clearly. This makes maintenance and troubleshooting easier."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Perform a load test after installation. This ensures your inverter is working as intended."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Keep documentation for future reference. This is important for warranty and maintenance."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Update firmware if applicable. This improves performance and adds new features."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Ensure ventilation around the unit. This prevents overheating and extends inverter lifespan."
        }
      ]
    },
    {
      id: 5,
      title: 'Renewable Energy Grants',
      author: 'Alex Rivera',
      lastActivity: '2025-03-11',
      replies: 6,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Government grants cover solar installations. These can significantly reduce your upfront costs."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Check eligibility based on income. Some grants are need-based, while others are for low-income households."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Apply online for federal programs. Many programs have online portals for easy application."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "State-specific grants vary by region. Some states offer additional incentives for renewable energy."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Include energy audits in applications. This demonstrates your commitment to energy efficiency."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Deadlines are usually annual. It's important to apply on time to secure funding."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Match grants don't require repayment. These are essentially free money for your project."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Verify with local energy offices. They can provide guidance and ensure you meet requirements."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Combine with tax incentives. This can further reduce your costs and increase your ROI."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Small business grants available too. This includes grants for solar installers and distributors."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Track application status online. Many programs offer online portals for status updates."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Required documents include estimates. This demonstrates the financial feasibility of your project."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Grants for wind and hydro exist. These are alternative renewable energy sources."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Community programs offer additional support. This includes grants for local projects."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Success stories can guide applications. Learning from others can help you prepare."
        }
      ]
    },
    {
      id: 6,
      title: 'Solar vs. Wind Energy',
      author: 'Sarah Lee',
      lastActivity: '2025-03-10',
      replies: 8,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Solar is ideal for sunny regions. Solar panels are more efficient in direct sunlight."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Wind energy suits windy areas better. Wind turbines generate power when the wind blows."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Solar panels have lower maintenance. They require minimal upkeep, unlike wind turbines."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Wind turbines can be noisier. This is a common misconception, but modern turbines are quiet."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Compare initial costs per kW. Solar is generally more expensive upfront, but cheaper per kWh."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Solar is more space-efficient. Solar panels take up less land than wind turbines."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Wind provides energy at night. This is true, but solar is also available during the day."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Hybrid systems maximize output. This combines the strengths of both solar and wind."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Environmental impact differs slightly. Both are clean, but solar has a smaller footprint."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Government incentives favor both. Many countries offer incentives for both solar and wind."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Scalability options for each. Both can be expanded as needed."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Energy storage needs vary. Solar is intermittent, while wind is more predictable."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Installation complexity compared. Solar is simpler, while wind requires more expertise."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Long-term ROI calculations. This depends on your location, energy needs, and costs."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "User experiences with reliability. Both are reliable, but wind can be more variable."
        }
      ]
    },
    {
      id: 7,
      title: 'Home Battery Backup Systems',
      author: 'David Kim',
      lastActivity: '2025-03-09',
      replies: 2,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Essential during power outages. This is the primary reason for battery backup."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Costs can be high initially. Battery systems are expensive, but their value is long-term."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Pair with solar for full independence. This allows you to use solar power during the day."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Capacity determines backup duration. This is the most important factor for your needs."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Safety features include fire suppression. This is a critical safety feature."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Integration with smart grids. This allows for more efficient energy distribution."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Warranty periods are crucial. This ensures your investment is protected."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Maintenance involves cycle checks. This is necessary to extend battery lifespan."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Options for expandable systems. This allows you to add more capacity as needed."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Compare brands like Tesla and LG. These are well-regarded brands for home batteries."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Environmental impact of batteries. Batteries are recyclable, but their materials are scarce."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Installation requires professionals. This is a complex process that must be done correctly."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Monitor via mobile apps. This allows you to keep an eye on your battery's status."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Lifespan is 10-15 years typically. This is the expected lifespan of most batteries."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Rebates available in some areas. This can further reduce your costs."
        }
      ]
    },
    {
      id: 8,
      title: 'Eco-Friendly Appliances',
      author: 'Laura Chen',
      lastActivity: '2025-03-08',
      replies: 5,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Energy-star fridges save power. These are designed to consume less energy."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Washers with high efficiency ratings. These are more energy-efficient and save water."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "LED lighting for homes. These are more energy-efficient and last longer."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Smart thermostats for heating. These allow you to optimize your heating settings."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Low-flow water appliances. These reduce water usage while maintaining performance."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Compare costs and savings. This helps you understand the long-term benefits."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Brands like Bosch and Miele. These are well-known brands for high-quality products."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Long-term environmental benefits. These products have a smaller carbon footprint."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Government rebates for upgrades. This can significantly reduce your costs."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Maintenance tips for longevity. This helps you keep your products running efficiently."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Impact on utility bills. This is a key consideration for your energy costs."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Recycling old appliances. This is crucial for environmental sustainability."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "User reviews for reliability. This helps you understand product performance."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Integration with home automation. This allows for more efficient and convenient living."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Energy monitoring features. This allows you to track your energy consumption."
        }
      ]
    },
    {
      id: 9,
      title: 'Grid Independence Tips',
      author: 'Robert Garcia',
      lastActivity: '2025-03-07',
      replies: 3,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Start with solar panels installation. This is the foundation of a grid-independent system."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Batteries are key for storage. This allows you to use solar power during the day and store excess for night."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Use inverters for AC power. This converts DC power from solar panels and batteries to AC for your home."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Monitor energy production daily. This helps you understand your energy usage and production."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Reduce consumption with efficiency. This is the most effective way to save energy."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Backup generators as a fallback. This provides power during extended outages."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Legal requirements for off-grid. This varies by country and region. You need to comply."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Water and waste management. This is crucial for a sustainable off-grid setup."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Community resources for advice. This can help you learn from others and avoid common pitfalls."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Cost analysis for transition. This helps you understand the financial implications."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Sustainable living practices. This includes energy-saving habits and waste reduction."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Weather-proofing your setup. This ensures your system can withstand extreme weather conditions."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Scaling up over time. This allows you to add more solar panels, batteries, or appliances as your needs grow."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Education on energy basics. This is crucial for understanding how energy works and how to save it."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Success stories from users. This can inspire you and guide your decision-making."
        }
      ]
    },
    {
      id: 10,
      title: 'Energy Monitoring Tools',
      author: 'Maria Lopez',
      lastActivity: '2025-03-06',
      replies: 7,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Apps like Sense for real-time tracking. This allows you to monitor your energy usage and production in real-time."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Hardware like smart meters. This provides a more accurate and reliable way to measure energy."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Integration with home systems. This allows your energy monitoring tools to work seamlessly with your existing systems."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Alerts for high usage. This helps you identify potential issues and optimize your energy consumption."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Data visualization features. This makes it easier to understand and analyze your energy data."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Cost vs. benefit analysis. This helps you understand the value of energy monitoring tools."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Compatibility with devices. This ensures your tools work with your existing devices and systems."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "User-friendly interfaces. This makes it easy for anyone to use and understand the data."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Privacy concerns addressed. Many tools offer robust privacy protections."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Accuracy of measurements. This is crucial for reliable energy tracking."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Recommendations from experts. This can help you make informed decisions about energy-saving measures."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Free vs. paid tools. This depends on your needs and budget. Some are free, while others offer more features."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Setting energy goals. This helps you track your progress and stay motivated."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Historical data tracking. This allows you to analyze trends and patterns over time."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Impact on behavior change. This is the ultimate goal of energy monitoring tools."
        }
      ]
    },
    {
      id: 11,
      title: 'Sustainable Home Design',
      author: 'James Patel',
      lastActivity: '2025-03-05',
      replies: 4,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Passive solar design maximizes light. This design strategy uses the sun to heat your home naturally."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Insulation tips for energy efficiency. This is one of the most effective ways to reduce heating and cooling costs."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Green roofing options. This is a sustainable and attractive roofing option."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Material choices for sustainability. This includes using recycled materials and non-toxic products."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Water conservation in design. This is crucial for reducing your water footprint."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Architects specializing in eco-homes. These professionals are trained to design sustainable homes."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Cost implications discussed. This is a key consideration for any home improvement project."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Long-term benefits outlined. This includes environmental, financial, and health benefits."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Case studies shared. This can help you understand the practical applications of sustainable design."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Community building aspects. This includes creating a sense of belonging and fostering a sustainable community."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Regulations and certifications. This ensures your home meets certain sustainability standards."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "DIY vs. professional advice. This depends on your skills and budget. Some projects are better left to professionals."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Energy modeling tools. This helps you understand how your home uses energy and how to optimize it."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Aesthetic vs. functional balance. This is important for creating a beautiful and functional space."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "User experiences with designs. This can inspire you and guide your decision-making."
        }
      ]
    },
    {
      id: 12,
      title: 'EV Charging Solutions',
      author: 'Olivia Nguyen',
      lastActivity: '2025-03-04',
      replies: 6,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Home chargers are convenient for daily use. This allows you to charge your EV at home."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Cost comparison with public stations. This helps you understand the financial implications of charging at home versus public stations."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Level 2 vs. DC fast charging. This is a trade-off between charging speed and cost."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Installation guides for homes. This is a complex process that must be done correctly."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Integration with solar power. This allows you to charge your EV using solar energy."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "App-based monitoring. This allows you to keep an eye on your EV's status and charging progress."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Safety features to consider. This is crucial for any EV charging solution."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Government incentives available. This can significantly reduce your costs."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Range anxiety solutions. This is a common concern for EV owners. Solutions exist."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Compatibility with vehicle models. This ensures your charger works with your specific EV."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Maintenance and upkeep. This is necessary to ensure your charger operates efficiently."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Environmental impact. This is a crucial consideration for any EV charging solution."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "User reviews on reliability. This helps you understand product performance."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Future-proofing with upgrades. This allows you to add more chargers or upgrade as needed."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Community charging networks. This allows you to charge your EV at multiple locations."
        }
      ]
    },
    {
      id: 13,
      title: 'Water Heating Efficiency',
      author: 'Brian Taylor',
      lastActivity: '2024-03-03',
      replies: 5,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Solar water heaters save money long-term. This is a significant financial benefit."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Maintenance advice for tanks. This is crucial for the longevity of your water heater."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Heat pump options compared. This is a more efficient and environmentally friendly option."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Insulation wraps for pipes. This is one of the most effective ways to reduce heat loss."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Energy ratings to check. This is important for understanding the efficiency of your water heater."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Installation costs broken down. This is a key consideration for any home improvement project."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Rebates and incentives. This can significantly reduce your costs."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "User tips for efficiency. This includes regular maintenance and optimizing settings."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Tankless vs. traditional systems. This is a trade-off between upfront cost and long-term savings."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Environmental benefits. This is a crucial consideration for any water heating solution."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Monitoring water usage. This helps you understand your water consumption and identify leaks."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Common issues and fixes. This allows you to identify and address problems quickly."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Integration with smart homes. This allows for more efficient and convenient water management."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Longevity and warranties. This ensures your investment is protected."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Success stories from users. This can inspire you and guide your decision-making."
        }
      ]
    }
  ]);

  const mockSummarize = (message) => {
    const firstSentence = message.split('.')[0] || message;
    return firstSentence.length > 50 
      ? `${firstSentence.substring(0, 47)}...` 
      : firstSentence;
  };

  const handlePostMessage = () => {
    if (!newMessage.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message before posting',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const userName = localStorage.getItem('forumUserName') || 'You';
    const topicId = selectedTopic.id;

    const newReplies = { ...replies };
    if (!newReplies[topicId]) newReplies[topicId] = [];
    const reply = { name: userName, message: newMessage, timestamp: Date.now() };
    newReplies[topicId].push(reply);

    setReplies(newReplies);

    toast({
      title: 'Message Posted',
      description: 'Your message has been posted successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    setNewMessage('');
  };

  const handleSummarize = () => {
    setIsSummarized(true);
    if (!selectedTopic?.posts?.length) {
      toast({
        title: 'No Posts',
        description: 'There are no posts to summarize.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const mockedSummary = mockSummarize(selectedTopic.posts);
      setSummary(mockedSummary);
    } catch (error) {
      console.error('Summarization error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate summary. Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckTone = async () => {
    if (!newMessage.trim()) {
      toast({
        title: 'Please enter some text to check the tone.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsCheckingTone(true);
    setTone(null);
    try {
      const response = await api.post('/api/ai/sentiment', { text: newMessage });
      setTone(response.data.tone);
    } catch (error) {
      toast({
        title: 'Failed to check tone. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCheckingTone(false);
    }
  };

  const renderTone = () => {
    if (!tone) return null;
    let color = 'gray.400', label = 'Neutral', emoji = '😐';
    if (tone === 'positive') { color = 'green.400'; label = 'Positive'; emoji = '😊'; }
    if (tone === 'negative') { color = 'red.400'; label = 'Negative'; emoji = '😞'; }
    return (
      <Tooltip label={label}>
        <Text ml={2} color={color} fontWeight="bold" as="span" fontSize="lg">
          {emoji}
        </Text>
      </Tooltip>
    );
  };

  const renderTopicsList = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w='full'>
      {dummyTopics.map((topic) => (
        <Box
          key={topic.id}
          p={6}
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          borderRadius="lg"
          boxShadow="md"
          transition='all 0.3s ease-in-out'
          _hover={{ boxShadow: 'xl', transform: 'translateY(-5px)' }}
        >
          <Flex align='center' mb={2}>
            <Icon as={FaComments} mr={2} />
            <Heading size='md' color={textColor}>
              {topic.title}
            </Heading>
          </Flex>
          <Text color={subTextColor}>By {topic.author}</Text>
          <Text color={subTextColor}>{topic.replies} replies</Text>
          <Text color={metaTextColor}>Last activity: {topic.lastActivity}</Text>
          <Button onClick={() => setSelectedTopic(topic)} mt={4} colorScheme='blue'>
            View Discussion
          </Button>
        </Box>
      ))}
    </SimpleGrid>
  );

  const renderTopicDiscussion = () => {
    return (
      <Box>
        <Box
          p={6}
          bg={cardBg}
          borderRadius="xl"
          boxShadow="xl"
          mb={6}
          color={cardTextColor}
          border="1px solid"
          borderColor={borderCol}
          backdropFilter="blur(16px)"
        >
          <Heading size="lg" mb={4} color={cardTextColor}>
            {selectedTopic.title}
          </Heading>
          <Text color={subTextColor}>
            Started by {selectedTopic.author}
          </Text>
          <VStack mt={4} align="stretch" spacing={3}>
            <Heading size="md" mt={4}>Posts:</Heading>
            {selectedTopic.posts && selectedTopic.posts.length > 0 ? (
              [...selectedTopic.posts, ...(replies[selectedTopic.id] || [])]
                .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
                .map((post, index) => {
                  return (
                    <Box
                      key={index}
                      p={3}
                      bg={postBg}
                      borderRadius="md"
                      boxShadow="sm"
                      color={cardTextColor}
                      display="flex"
                      alignItems="flex-start"
                      gap={3}
                    >
                      <Avatar
                        name={post.name}
                        size="sm"
                        bg={post.avatarColor}
                        color="white"
                        fontWeight="bold"
                        showBorder
                      />
                      <Box>
                        <Text fontWeight="bold" color={cardTextColor}>{post.name}</Text>
                        <Text color={cardTextColor}>{isSummarized ? mockSummarize(post.message) : post.message}</Text>
                        {post.timestamp && (
                          <Text fontSize="xs" color={metaTextColor} mt={1}>
                            {new Date(post.timestamp).toLocaleString()}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  );
                })
            ) : (
              <Text color={subTextColor}>No posts yet.</Text>
            )}
            {isSummarized && (
              <Button onClick={handleShowFullPosts} colorScheme="gray" mb={4}>
                Show Full Posts
              </Button>
            )}
          </VStack>
          <Button
            onClick={handleSummarize}
            isLoading={isLoading}
            isDisabled={isLoading}
            colorScheme="blue"
            mb={4}
            mt={4}
          >
            Summarize Thread
          </Button>
          {summary && (
            <Collapse in={summary !== null} animateOpacity>
              <Box p={4} bg={postBg} borderRadius="md" mt={4}>
                <Heading size="sm" mb={2} color={cardTextColor}>Thread Summary</Heading>
                <UnorderedList>
                  {summary.map((item, index) => (
                    <ListItem key={index} color={subTextColor}>{item}</ListItem>
                  ))}
                </UnorderedList>
              </Box>
            </Collapse>
          )}
        </Box>

        {/* Message Input */}
        <Box
          p={6}
          bg={cardBg}
          borderRadius="xl"
          boxShadow="xl"
          color={cardTextColor}
          border="1px solid"
          borderColor={borderCol}
          backdropFilter="blur(16px)"
        >
          <Textarea
            value={newMessage}
            onChange={e => {
              setNewMessage(e.target.value);
              setTone(null); // Reset tone if user edits
            }}
            placeholder="Type your message..."
            mb={2}
            color={cardTextColor}
            bg={postBg}
          />
          <Flex align="center" mb={2}>
            <Button
              size="sm"
              onClick={handleCheckTone}
              isDisabled={!newMessage.trim()}
              mr={2}
            >
              {isCheckingTone ? <Spinner size="xs" /> : 'Check Tone'}
            </Button>
            {renderTone()}
          </Flex>
          <Button
            rightIcon={<FaPaperPlane />}
            colorScheme="blue"
            onClick={handlePostMessage}
          >
            Post Message
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      minH="100vh"
      backgroundImage={`url(${forumBackground})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundAttachment="fixed"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
      }}
    >
      <Container maxW="container.xl" py={8} position="relative" zIndex={2}>
        <Box
          maxW="6xl"
          mx="auto"
          bg={cardBg}
          boxShadow="xl"
          borderRadius="xl"
          p={8}
          position="relative"
          zIndex={2}
          backdropFilter="blur(16px)"
          border="1px solid"
          borderColor={borderCol}
          color={cardTextColor}
          mt={8}
        >
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            mb={8}
            onClick={() => {
              if (selectedTopic) {
                setSelectedTopic(null);
              } else {
                navigate('/home');
              }
            }}
          >
            {selectedTopic ? 'Back to Topics' : 'Back to Home'}
          </Button>

        <VStack spacing={8} align="stretch">
          <Heading size="xl">Community Forum</Heading>
          {selectedTopic 
            ? renderTopicDiscussion() 
            : renderTopicsList()
          }
        </VStack>
      </Box>
    </Box>
  );
};

export default ForumPage;