import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface AgentResponse {
  reply?: string;
  response?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiAgentService {
  private API_BASE_URL = 'http://localhost:5000'; // Removed process.env

  constructor(private http: HttpClient) { }

  sendMessage(message: string): Observable<AgentResponse> {
    return this.http.post<AgentResponse>(`${this.API_BASE_URL}/api/ai-agent`, { message });
  }
}