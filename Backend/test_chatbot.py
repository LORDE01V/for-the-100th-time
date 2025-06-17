from hugging_services import HuggingFaceChatbot

def test_chatbot():
    # Initialize the chatbot
    chatbot = HuggingFaceChatbot()

    # Test queries
    test_queries = [
        "How do I pay my bill?",
        "Is my solar panel working properly?",
        "I need technical support",
        "What's my energy consumption today?",
        "How do I schedule maintenance?"
    ]

    print("Testing Chatbot Responses:\n")
    
    for query in test_queries:
        print(f"User Query: {query}")
        
        # Get and print the response
        response = chatbot.get_response(query)
        print(f"Chatbot Response: {response}")
        
        # Get and print confidence scores
        scores = chatbot.get_confidence_scores(query)
        print("Confidence Scores:")
        for intent, score in scores.items():
            print(f"  {intent}: {score:.4f}")
        
        print("\n" + "-"*50 + "\n")

if __name__ == "__main__":
    test_chatbot()
