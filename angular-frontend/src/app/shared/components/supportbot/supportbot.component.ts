import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';
import { ToastService } from '../../../services/toast.service';
import { AiAgentService } from '../../../services/ai-agent.service';
import {
  faPaperPlane,
  faTimes,
  faCommentDots,
  faVolumeMute,
  faVolumeUp,
  faMicrophone
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subscription } from 'rxjs';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  thinking?: boolean;
  typing?: boolean;
}

declare const webkitSpeechRecognition: any; // Declare for TypeScript

@Component({
  selector: 'app-supportbot',
  templateUrl: './supportbot.component.html',
  styleUrls: ['./supportbot.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule]
})
export class SupportbotComponent implements OnInit, OnDestroy {
  @ViewChild('messagesEnd') messagesEndRef!: ElementRef;

  // Icons
  faPaperPlane = faPaperPlane;
  faTimes = faTimes;
  faCommentDots = faCommentDots;
  faVolumeMute = faVolumeMute;
  faVolumeUp = faVolumeUp;
  faMicrophone = faMicrophone;

  isOpen: boolean = false;
  messages: ChatMessage[] = [];
  inputMessage: string = '';
  isLoading: boolean = false;
  typing: boolean = false;
  hasSpokenLangaGreeting: boolean = false;
  isMuted: boolean = false;
  isSpeaking: boolean = false; // For animation
  isListening: boolean = false;
  recognitionActiveRef: boolean = false;

  private recognition: any;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private typingInterval: any;
  private themeSubscription: Subscription = new Subscription();

  // Theme-related properties
  bubbleBgColor: string = '';
  headerBgGradient: string = '';
  headerColor: string = '';
  chatBg: string = '';
  userBgColor: string = '';
  botBgColor: string = '';
  textColor: string = '';
  inputBg: string = '';
  inputBorderColor: string = '';
  inputFocusBorderColor: string = '';
  inputAreaBg: string = '';
  inputAreaBorderColor: string = '';

  langaImage: string = "https://placehold.co/150x150/008080/ffffff?text=Langa"; // Placeholder URL
  langaGreeting: string = "Hi! I'm Langa. How can I help you today?";

  constructor(
    private themeService: ThemeService,
    private toastService: ToastService,
    private aiAgentService: AiAgentService,
    private renderer: Renderer2
  ) {
    // Initialize SpeechRecognition if available
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const speech = event.results[0][0].transcript;
        this.inputMessage = '';
        this.isListening = false;
        this.recognitionActiveRef = false;
        this.handleSendMessage(speech);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.recognitionActiveRef = false;
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.toastService.show({
          title: 'Voice Input Failed',
          description: "Sorry, I couldn't process your voice message. Try again or type your message.",
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom',
        });
        this.isListening = false;
        this.recognitionActiveRef = false;
      };
    }
  }

  ngOnInit(): void {
    this.setupThemeSubscription();
    this.setupVoiceSelection();

    // Initial message if needed, or when opened
    if (this.isOpen && !this.hasSpokenLangaGreeting && !this.isMuted) {
      // This is handled by toggleOpen or after messages are set
    }
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    if (this.recognitionActiveRef) {
      this.recognition.stop();
    }
    window.speechSynthesis.cancel();
  }

  private setupThemeSubscription(): void {
    this.themeSubscription = this.themeService.colorMode$.subscribe(mode => {
      this.bubbleBgColor = this.themeService.getColorModeValue('white', 'gray.800');
      this.headerBgGradient = this.themeService.getColorModeValue('linear-gradient(to right, #38B2AC, #319795)', 'linear-gradient(to right, #2D3748, #4A5568)');
      this.headerColor = this.themeService.getColorModeValue('white', 'white');
      this.chatBg = this.themeService.getColorModeValue('gray.50', 'gray.800');
      this.userBgColor = this.themeService.getColorModeValue('blue.100', 'blue.800');
      this.botBgColor = this.themeService.getColorModeValue('gray.100', 'gray.700');
      this.textColor = this.themeService.getColorModeValue('black', 'white');
      this.inputBg = this.themeService.getColorModeValue('white', 'gray.700');
      this.inputBorderColor = this.themeService.getColorModeValue('gray.200', 'gray.600');
      this.inputFocusBorderColor = this.themeService.getColorModeValue('teal.400', 'teal.400');
      this.inputAreaBg = this.themeService.getColorModeValue('gray.100', 'gray.900');
      this.inputAreaBorderColor = this.themeService.getColorModeValue('gray.200', 'gray.700');
    });
  }

  private setupVoiceSelection(): void {
    const setVoice = () => {
      this.selectedVoice = this.pickSiriLikeVoice();
    };
    setVoice();
    if (typeof window !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }
  }

  private pickSiriLikeVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    let siriVoice = voices.find(v => v.lang && v.lang.includes('en-US') && (v.name === 'Samantha' || v.name === 'Alex'));
    if (!siriVoice) {
      siriVoice = voices.find(v => v.lang && v.lang.includes('en-US'));
    }
    if (!siriVoice) {
      siriVoice = voices.find(v => v.lang && v.lang.startsWith('en'));
    }
    return siriVoice || null;
  }

  speakReply(text: string): void {
    if (this.isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.selectedVoice?.lang || 'en-US';
    utterance.voice = this.selectedVoice || null;
    utterance.pitch = 1.1;
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    this.isSpeaking = true;
    utterance.onend = () => this.isSpeaking = false;
    utterance.onerror = () => this.isSpeaking = false;
    window.speechSynthesis.speak(utterance);
  }

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      if (!this.hasSpokenLangaGreeting && !this.isMuted) {
        window.speechSynthesis.cancel();
        this.messages = [{ text: this.langaGreeting, sender: 'bot' }];
        this.speakReply(this.langaGreeting);
        this.hasSpokenLangaGreeting = true;
      } else if (this.messages.length === 0) {
        this.messages = [{ text: this.langaGreeting, sender: 'bot' }];
      }
    } else {
      window.speechSynthesis.cancel();
      this.isListening = false; // Stop listening when closing chatbot
      this.recognitionActiveRef = false;
      if (this.recognition) {
        this.recognition.stop();
      }
    }
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      window.speechSynthesis.cancel();
    }
  }

  async handleSendMessage(messageText: string = this.inputMessage.trim()): Promise<void> {
    if (!messageText) return;

    this.messages.push({ text: messageText, sender: 'user' });
    this.inputMessage = '';
    this.isLoading = true;
    this.typing = true;

    // Add 'Thinking...' message
    this.messages.push({ text: '🤔 Thinking...', sender: 'bot', thinking: true });
    this.scrollToBottom();

    await new Promise(res => setTimeout(res, 800));

    // Replace 'Thinking...' with animated typing dots
    this.messages = this.messages.map(msg => 
      msg.thinking ? { ...msg, text: 'Langa is typing', typing: true } : msg
    );
    this.scrollToBottom();

    let dotCount = 0;
    this.typingInterval = setInterval(() => {
      this.messages = this.messages.map(msg => 
        msg.typing ? { ...msg, text: `Langa is typing${'.'.repeat(dotCount % 4)}` } : msg
      );
      dotCount++;
      this.scrollToBottom();
    }, 400);

    let botReply: string;
    try {
      const data = await this.aiAgentService.sendMessage(messageText).toPromise();
      botReply = data?.reply || data?.response || "Sorry, I didn't get a reply.";
    } catch (error) {
      console.error('Error:', error);
      botReply = "I apologize, but I'm having trouble connecting. Please try again.";
      this.toastService.show({
        title: 'Error',
        description: 'Failed to get response from server',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      clearInterval(this.typingInterval);
      this.isLoading = false;
      this.typing = false;
    }

    this.messages = this.messages.map(msg => 
      msg.typing || msg.thinking ? { text: botReply, sender: 'bot' } : msg
    );
    this.scrollToBottom();
    this.speakReply(botReply);
  }

  handleMicClick(): void {
    if (!this.recognition) {
      this.toastService.show({
        title: 'Browser Not Supported',
        description: "Sorry, your browser doesn't support voice-to-text.",
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
      return;
    }

    if (this.isListening || this.recognitionActiveRef) {
      this.recognition.stop();
      this.isListening = false;
      this.recognitionActiveRef = false;
    } else {
      try {
        this.recognition.start();
        this.isListening = true;
        this.recognitionActiveRef = true;
      } catch (e: any) {
        if (e.name === 'AbortError') {
          // User agent is already listening, do nothing.
        } else {
          console.error('Speech recognition start error:', e);
        }
        this.isListening = true; // Still show as listening if already started
        this.recognitionActiveRef = true;
      }
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSendMessage();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesEndRef) {
        this.messagesEndRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 0); // Small delay to allow DOM to update
  }
}