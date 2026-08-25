import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ModerationReport, ReportStatus, VerificationRequest } from '../../app.models';
import { AdminService } from '../../services/admin.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/loading-state/loading-state.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, EmptyStateComponent, LoadingStateComponent],
})
export class AdminPage implements OnInit {
  private readonly adminService = inject(AdminService);
  loadingVerifications = false;
  updatingVerificationId: number | null = null;
  verificationError = '';
  verificationSuccess = '';
  verifications: VerificationRequest[] = [];

  loadingReports = false;
  updatingReportId: number | null = null;
  reportError = '';
  reportSuccess = '';
  reports: ModerationReport[] = [];

  get isRefreshing() {
    return this.loadingVerifications || this.loadingReports;
  }

  ngOnInit() {
    this.refreshAll();
  }

  refreshAll() {
    if (this.isRefreshing) return;
    this.loadVerifications();
    this.loadReports();
  }

  loadVerifications() {
    this.loadingVerifications = true;
    this.verificationError = '';
    this.adminService.listVerifications('pending').subscribe({
      next: (res) => this.verifications = Array.isArray(res?.data) ? res.data : [],
      error: (err) => this.verificationError = err?.error?.message || 'No se pudieron cargar las verificaciones.',
    }).add(() => this.loadingVerifications = false);
  }

  verificationName(item: VerificationRequest) {
    return item.user?.name || item.user?.email || `Usuario #${item.user_id || '-'}`;
  }

  reviewVerification(item: VerificationRequest, action: 'approve' | 'reject') {
    if (!item.id || this.updatingVerificationId !== null) return;
    this.updatingVerificationId = item.id;
    this.verificationError = '';
    this.verificationSuccess = '';
    const request = action === 'approve'
      ? this.adminService.approveVerification(item.id)
      : this.adminService.rejectVerification(item.id);
    request.subscribe({
      next: () => {
        this.verifications = this.verifications.filter(current => current.id !== item.id);
        this.verificationSuccess = action === 'approve' ? 'La verificación fue aprobada correctamente.' : 'La verificación fue rechazada.';
      },
      error: (err) => this.verificationError = err?.error?.message || 'No se pudo revisar la verificación.',
    }).add(() => this.updatingVerificationId = null);
  }

  loadReports() {
    this.loadingReports = true;
    this.reportError = '';
    this.adminService.listReports('open').subscribe({
      next: (res) => this.reports = Array.isArray(res?.data) ? res.data : [],
      error: (err) => this.reportError = err?.error?.message || 'No se pudieron cargar los reportes.',
    }).add(() => this.loadingReports = false);
  }

  reportTitle(report: ModerationReport) {
    return `${this.targetLabel(report.target_type)} #${report.target_id || '-'}`;
  }

  reporterName(report: ModerationReport) {
    return report.reporter?.name || report.reporter?.email || `Usuario #${report.reporter_id || '-'}`;
  }

  updateReport(report: ModerationReport, status: Extract<ReportStatus, 'resolved' | 'dismissed'>) {
    if (!report.id || this.updatingReportId !== null) return;
    this.updatingReportId = report.id;
    this.reportError = '';
    this.reportSuccess = '';
    this.adminService.updateReportStatus(report.id, status).subscribe({
      next: () => {
        this.reports = this.reports.filter(current => current.id !== report.id);
        this.reportSuccess = status === 'resolved' ? 'El reporte fue marcado como resuelto.' : 'El reporte fue desestimado.';
      },
      error: (err) => this.reportError = err?.error?.message || 'No se pudo actualizar el reporte.',
    }).add(() => this.updatingReportId = null);
  }

  initials(value: string) {
    return value.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U';
  }

  roleLabel(role: VerificationRequest['role']) {
    return role === 'health' ? 'Profesional de salud' : 'Empresa';
  }

  targetLabel(targetType: string) {
    const labels: Record<string, string> = { post: 'Publicación', user: 'Usuario', job: 'Empleo', company: 'Empresa', health_profile: 'Perfil de salud' };
    return labels[targetType.toLowerCase()] || 'Elemento';
  }

  formatDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  trackById(_: number, item: { id: number }) {
    return item.id;
  }
}
