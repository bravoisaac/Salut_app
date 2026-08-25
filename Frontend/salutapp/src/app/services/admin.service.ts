import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  ApiPage,
  ModerationReport,
  ReportStatus,
  VerificationRequest,
} from '../app.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  listVerifications(status: 'pending' | 'approved' | 'rejected' = 'pending') {
    return this.http.get<ApiPage<VerificationRequest>>(`${environment.apiBase}/verifications`, {
      params: { status },
    });
  }

  approveVerification(id: number) {
    return this.http.put<VerificationRequest>(`${environment.apiBase}/verifications/${id}/approve`, {});
  }

  rejectVerification(id: number) {
    return this.http.put<VerificationRequest>(`${environment.apiBase}/verifications/${id}/reject`, {});
  }

  listReports(status: ReportStatus = 'open') {
    return this.http.get<ApiPage<ModerationReport>>(`${environment.apiBase}/reports`, {
      params: { status },
    });
  }

  updateReportStatus(id: number, status: ReportStatus) {
    return this.http.put<ModerationReport>(`${environment.apiBase}/reports/${id}`, { status });
  }
}
