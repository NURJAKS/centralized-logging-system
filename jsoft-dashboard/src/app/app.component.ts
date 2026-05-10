import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  logs: any[] = [];
  selectedLog: any = null;
  selectedIds: string[] = [];
  searchText: string = '';

  currentPage: number = 1;
  limit: number = 50;
  totalPages: number = 1;
  totalLogsCount: number = 0;

  ngOnInit() {
    this.fetchLogs();
    setInterval(() => this.fetchLogs(false), 5000);
  }

  get filteredLogs() {
    if (!this.searchText) return this.logs;
    const term = this.searchText.toLowerCase();

    return this.logs.filter((log) => {
      return (
        log.projectKey?.toLowerCase().includes(term) ||
        log.endpoint?.toLowerCase().includes(term) ||
        log.errorMessage?.toLowerCase().includes(term) ||
        log.ip?.includes(term) ||
        log.method?.toLowerCase().includes(term) ||
        log.userAgent?.toLowerCase().includes(term) ||
        JSON.stringify(log.payload).toLowerCase().includes(term)
      );
    });
  }

  fetchLogs(isLoadMore: boolean = false) {
    if (!isLoadMore) {
      this.currentPage = 1;
    }

    const url = `http://localhost:3005/api/logs?page=${this.currentPage}&limit=${this.limit}`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (isLoadMore) {
          const newLogs = response.data.filter(
            (newLog: any) => !this.logs.some((l) => l.id === newLog.id),
          );
          this.logs = [...this.logs, ...newLogs];
        } else {
          this.logs = response.data;
        }

        this.totalPages = response.totalPages;
        this.totalLogsCount = response.total;

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Ошибка загрузки:', err),
    });
  }

  
  loadMore() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchLogs(true);
    }
  }

  viewDetails(log: any) {
    this.selectedLog = log;
  }
  closeDetails() {
    this.selectedLog = null;
  }

  toggleSelection(id: string) {
    if (this.selectedIds.includes(id)) {
      this.selectedIds = this.selectedIds.filter((i) => i !== id);
    } else {
      this.selectedIds.push(id);
    }
  }

  toggleAll() {
    this.selectedIds =
      this.selectedIds.length === this.filteredLogs.length
        ? []
        : this.filteredLogs.map((l) => l.id);
  }

  deleteSelected() {
    if (this.selectedIds.length === 0) return;
    this.http
      .post('http://localhost:3005/api/logs/delete', { ids: this.selectedIds })
      .subscribe(() => {
        this.selectedIds = [];
        this.fetchLogs(); 
        this.selectedLog = null;
      });
  }

  
  isAnalyzing: boolean = false;
  aiAnalysisResult: string | null = null;

  analyzeWithAI() {
    if (!this.selectedLog) return;

    this.isAnalyzing = true;
    this.aiAnalysisResult = null;

    let filePath = this.selectedLog.fileLocation;
    let lineNum = 1;

    if (filePath && filePath.includes(':')) {
      const parts = filePath.split(':');
      filePath = `src/${parts[0]}`;
      lineNum = parseInt(parts[1], 10) || 1;
    }

    const payload = {
      logId: this.selectedLog.id,
      filePath: filePath,
      line: lineNum,
      stackTrace: this.selectedLog.stackTrace,
    };

    this.http.post<any>('http://localhost:3005/ai/analyze', payload).subscribe({
      next: (response) => {
        this.aiAnalysisResult = response.analysis;
        this.isAnalyzing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.aiAnalysisResult = '❌ Ошибка при обращении к AI сервису.';
        this.isAnalyzing = false;
        this.cdr.detectChanges();
      },
    });
  }
}
