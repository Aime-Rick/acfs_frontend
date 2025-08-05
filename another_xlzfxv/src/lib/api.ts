const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.detail || errorData.message || 'No detail'}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Renamed private helper to avoid conflict
  private async privateUploadRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.detail || errorData.message || 'No detail'}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async signUp(email: string, password: string) {
    return this.request('/users/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signIn(email: string, password: string) {
    return this.request('/users/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signOut() {
    return this.request('/users/signout', {
      method: 'POST',
    });
  }

  // Mission endpoints
  async createMission(data: any) {
    return this.request('/missions', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async getAllMissions() {
    return this.request('/missions');
  }

  async getMissionById(missionId: string) {
    return this.request(`/missions/${missionId}`);
  }

  async getUserMissions(userId: string) {
    return this.request(`/users/${userId}/missions`);
  }

  async updateMission(missionId: string, updatedData: any) {
    return this.request('/missions', {
      method: 'PUT',
      body: JSON.stringify({ mission_id: missionId, updated_data: updatedData }),
    });
  }

  async deleteMission(missionId: string) {
    return this.request(`/missions/${missionId}`, {
      method: 'DELETE',
    });
  }

  // Research endpoint
  async deepResearch(context: string, problematique: string, objectives: string, missionName: string) {
    return this.request('/research', {
      method: 'POST',
      body: JSON.stringify({
        context,
        problematique,
        objectives,
        mission_name: missionName,
      }),
    });
  }

  // Survey endpoints
  async createSurvey(context: string, problematique: string, objectives: string) {
    return this.request('/survey', {
      method: 'POST',
      body: JSON.stringify({
        context,
        problematique,
        objectives,
      }),
    });
  }

  // Email endpoints
  async generateEmail(contexte: string, objectifs: string, problematique: string) {
    return this.request('/email/generate', {
      method: 'POST',
      body: JSON.stringify({
        contexte,
        objectifs,
        problematique,
      }),
    });
  }

  async sendEmail(toEmails: string[], subject: string, textContent: string) {
    return this.request('/email/send', {
      method: 'POST',
      body: JSON.stringify({
        to_emails: toEmails,
        subject,
        text_content: textContent,
      }),
    });
  }

  // Data analysis endpoint
  async runEDA(missionName: string, file: File) {
    const formData = new FormData();
    formData.append('mission_name', missionName);
    formData.append('file', file);

    return this.privateUploadRequest('/eda', formData); // Updated call
  }

  // Report endpoints
  async generateFinalReport(missionName: string, context: string, problematique: string, objective: string) {
    return this.request('/report/final', {
      method: 'POST',
      body: JSON.stringify({
        mission_name: missionName,
        context,
        problematique,
        objective,
      }),
    });
  }

  async convertReportToPdf(markdownContent: string, reportType: string, fileName: string) {
    return this.request('/report/pdf', {
      method: 'POST',
      body: JSON.stringify({
        markdown_content: markdownContent,
        report_type: reportType,
        file_name: fileName,
      }),
    });
  }

  // Scope generation endpoint
  async generateScope(subject: string, sector: string, document: File) {
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('sector', sector);
    formData.append('doc', document);

    return this.privateUploadRequest('/scope', formData); // Updated call
  }

  // File upload endpoint
  async uploadFile(bucketName: string, bucketFolder: string, file: File) {
    const formData = new FormData();
    formData.append('bucket_name', bucketName);
    formData.append('bucket_folder', bucketFolder);
    formData.append('file', file);

    return this.privateUploadRequest('/files/upload', formData); // Updated call
  }

  // Environment variable endpoint
  async setEnvironmentVariable(key: string, value: string, envFile: string = '.env') {
    const formData = new FormData();
    formData.append('key', key);
    formData.append('value', value);
    formData.append('env_file', envFile);

    return this.privateUploadRequest('/env/set', formData); // Updated call
  }
}

export const apiService = new ApiService();
