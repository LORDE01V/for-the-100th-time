from hugging_services import HuggingFaceChatbot
import re
from datetime import datetime

class EnhancedChatbot(HuggingFaceChatbot):
    def __init__(self):
        super().__init__()
        # Add more dynamic context
        self.context = {
            "time_of_day": self._get_time_of_day(),
            "common_patterns": {
                "greeting": r'\b(hi|hello|hey|greetings)\b',
                "farewell": r'\b(bye|goodbye|see you|farewell)\b',
                "thanks": r'\b(thanks|thank you|appreciate)\b',
                "help": r'\b(help|assist|support)\b',
                "problem": r'\b(issue|problem|error|wrong)\b'
            }
        }

    def _get_time_of_day(self):
        hour = datetime.now().hour
        if 5 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:
            return "night"

    def generate_dynamic_response(self, query: str, intent: str, confidence: float) -> str:
        """Generate more dynamic and contextual responses"""
        
        # Check for basic patterns first
        for pattern_type, pattern in self.context["common_patterns"].items():
            if re.search(pattern, query.lower()):
                if pattern_type == "greeting":
                    return f"Good {self.context['time_of_day']}! How can I assist you with your solar energy system today?"
                elif pattern_type == "farewell":
                    return "Thank you for chatting! If you need any more help with your solar system, don't hesitate to ask."
                elif pattern_type == "thanks":
                    return "You're welcome! Is there anything else you'd like to know about your solar energy system?"

        # Generate contextual responses based on intent and query content
        responses = {
            "payment": self._handle_payment_query(query),
            "technical_support": self._handle_technical_query(query),
            "energy_consumption": self._handle_energy_query(query),
            "maintenance": self._handle_maintenance_query(query),
            "solar_panel": self._handle_solar_query(query),
            "status": self._handle_status_query(query)
        }

        # Get the specific response or fall back to a general one
        response = responses.get(intent, self._handle_general_query(query))
        
        # Add confidence-based qualifier if confidence is low
        if confidence < 0.7:
            response += "\n\nIf this doesn't address your question completely, please feel free to ask for more specific details."
            
        return response

    def _handle_payment_query(self, query: str) -> str:
        if "how" in query.lower():
            return ("There are several ways to pay:\n"
                   "1. Through our mobile app\n"
                   "2. Via bank transfer\n"
                   "3. Using our web portal\n"
                   "Which method would you prefer to learn more about?")
        elif "late" in query.lower():
            return "I understand you're asking about late payments. Would you like to:\n1. Set up a payment plan\n2. Learn about our grace period\n3. Make an immediate payment?"
        else:
            return "I can help you with any payment-related questions. Would you like to know about payment methods, due dates, or current balance?"

    def _handle_technical_query(self, query: str) -> str:
        if "error" in query.lower():
            return "Could you please provide the error code or describe what you're seeing? This will help me diagnose the issue more accurately."
        elif "not working" in query.lower():
            return "Let's troubleshoot this together. When did you first notice the issue? Have you checked if:\n1. The system is powered on\n2. All connections are secure\n3. The display shows any error messages?"
        else:
            return "I'm here to help with technical issues. Could you describe what's happening with your system?"

    def _handle_energy_query(self, query: str) -> str:
        if "consumption" in query.lower():
            return "I can help you track your energy consumption. Would you like to see:\n1. Today's usage\n2. Weekly comparison\n3. Monthly trends\n4. Energy-saving tips"
        elif "save" in query.lower():
            return "Here are some immediate ways to optimize your energy usage:\n1. Schedule high-energy activities during peak sun hours\n2. Monitor real-time consumption through our app\n3. Set up usage alerts\nWould you like more specific tips?"
        else:
            return "I can provide insights about your energy usage patterns and offer optimization suggestions. What specific information would you like?"

    def _handle_maintenance_query(self, query: str) -> str:
        if "schedule" in query.lower():
            return "I can help you schedule maintenance. Would you prefer:\n1. Routine check-up\n2. Specific issue inspection\n3. Annual maintenance\nPlease let me know your preference."
        elif "clean" in query.lower():
            return "For solar panel cleaning, I recommend:\n1. Regular dust monitoring\n2. Professional cleaning service\n3. DIY cleaning guidelines\nWould you like details about any of these options?"
        else:
            return "Regular maintenance ensures optimal performance. Would you like information about scheduling, cleaning, or general maintenance tips?"

    def _handle_solar_query(self, query: str) -> str:
        if "efficiency" in query.lower():
            return "Solar panel efficiency depends on several factors:\n1. Panel positioning\n2. Weather conditions\n3. Regular maintenance\nWhich aspect would you like to learn more about?"
        elif "install" in query.lower():
            return "For installation queries, I can provide:\n1. Installation requirements\n2. Process overview\n3. Cost estimates\nWhat specific information do you need?"
        else:
            return "I can provide information about your solar panel system's performance, maintenance, or installation. What would you like to know?"

    def _handle_status_query(self, query: str) -> str:
        return "I can check your system's current status. Would you like to know about:\n1. Current power generation\n2. System health\n3. Recent performance\nPlease specify what you'd like to check."

    def _handle_general_query(self, query: str) -> str:
        return f"I understand you're asking about {query}. To help you better, could you specify if this is about:\n1. System performance\n2. Maintenance\n3. Billing\n4. Technical support"

    def chat(self, query: str) -> str:
        try:
            # Get classification and confidence
            result = self.pipe(query, candidate_labels=self.candidate_labels)
            intent = result['labels'][0]
            confidence = result['scores'][0]
            
            # Generate dynamic response
            return self.generate_dynamic_response(query, intent, confidence)
            
        except Exception as e:
            print(f"Error in chat: {e}")
            return "I apologize, but I'm having trouble processing your request. Could you please rephrase your question?"

def start_chat():
    chatbot = EnhancedChatbot()
    print("Solar Energy Assistant: Hello! I'm your solar energy system assistant. How can I help you today?")
    print("(Type 'quit' to exit)")
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'bye']:
            print("\nSolar Energy Assistant: Thank you for chatting! Have a great day!")
            break
            
        response = chatbot.chat(user_input)
        print("\nSolar Energy Assistant:", response)

if __name__ == "__main__":
    start_chat()
