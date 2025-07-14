import { Component } from '@angular/core';
import { DocumentoService  } from '../../../services/viewbigbag.service';

@Component({
  selector: 'app-view-report-bigbag',
  templateUrl: './view-report-bigbag.component.html',
  styleUrls: ['./view-report-bigbag.component.css']
})
export class ViewReportBigbagComponent {
    documentos: any[] = [];

  constructor(private documentoService: DocumentoService) {}

  ngOnInit(): void {
    this.documentoService.obtenerDocumentos().subscribe(data => {
      this.documentos = data;
    });
  }
}


