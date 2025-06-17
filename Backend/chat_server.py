from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from hugging_services import HuggingFaceChatbot
import logging
import tempfile
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize chatbot
chatbot = HuggingFaceChatbot()

class ChatMessage(BaseModel):
    message: str
    history: Optional[List[dict]] = []  # Make history optional with default empty list

@app.post("/api/chat")
async def chat_endpoint(chat_message: ChatMessage):
    try:
        logger.info(f"Received message: {chat_message.message}")
        response = chatbot.get_response(chat_message.message)  # Remove history parameter
        logger.info(f"Sending response: {response}")
        return {"response": response}
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice-to-text")
async def voice_to_text(audio: UploadFile = File(...)):
    try:
        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            # Write the audio file content
            content = await audio.read()
            temp_file.write(content)
            temp_file.flush()
            
            # Process the audio file
            text = chatbot.process_voice_query(temp_file.name)
            
            # Clean up the temporary file
            os.unlink(temp_file.name)
            
            return {"text": text}
    except Exception as e:
        logger.error(f"Error processing voice: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
