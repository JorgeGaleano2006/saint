import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.css']
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('canvas') canvasEl: ElementRef;
  signaturePad: SignaturePad;

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
  }

  clearSignature() {
    this.signaturePad.clear();
  }

  getSignatureImage(): string {
    return this.signaturePad.toDataURL('image/png');
  }
}
